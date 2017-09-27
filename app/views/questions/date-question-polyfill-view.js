import QuestionView from './base/question-with-answers-view.js';
import Utils from 'utils.js';
import $ from 'jquery';

export default class DateQuestionPolyfillView extends QuestionView {
    constructor(question) {
        super(question);

        this._render();
        this._attachControlHandlers();
    }

    _render() {
        this._container.find('.cf-text-box--date').hide(); // hide default input

        this._parseDateFormat().forEach(c => {
            switch(c){
                case 'y':
                    this._renderYear();
                    break;
                case 'm':
                    this._renderMonth();
                    break;
                case 'd':
                    this._renderDay();
                    break;
            }
        });

        // load initial state
        this._onModelValueChange();
    }

    _parseDateFormat(){
        let { dateFormat } = this._question.culture;
        dateFormat = dateFormat.replace(/y+/gi, 'y');
        dateFormat = dateFormat.replace(/m+/gi, 'm');
        dateFormat = dateFormat.replace(/d+/gi, 'd');
        dateFormat = dateFormat.replace(/[^ymd]*/gi, '');

        // if doesn't
        if(dateFormat.length !== 3 || [...dateFormat].sort().join('') !== 'dmy')
            dateFormat = 'mdy'; // unrecognized pattern, switch to default

        return [...dateFormat];
    }

    _renderYear() {
        let minYear = 1900,
            maxYear = 2100,
            years = Array.from(new Array(maxYear - minYear + 1), (val, idx) => minYear + idx),
            select = $('<select/>', {
                id: `${this.id}__year`,
                class:  'cf-date-answer__year',
                style: 'margin-right: 1em'
            });

        select.append($('<option/>')); // empty (not answered) option
        years.forEach(year => {
            let option = $('<option/>', { value: year, text: year });
            select.append(option);
        });

        this._container.find('.cf-question__content').append(select);
    }

    _renderMonth() {
        let { monthNames } = this._question.culture,
            select = $('<select/>', {
                id: `${this.id}__month`,
                class:  'cf-date-answer__month',
                style: 'margin-right: 1em'
            });

        select.append($('<option/>')); // empty (not answered) option
        monthNames.forEach((month, idx) => {
            idx++; // make it 1-based
            idx = ('0' + idx).slice(-2); // make it double-digit
            let option = $('<option/>', { value: idx, text: month });
            select.append(option);
        });

        this._container.find('.cf-question__content').append(select);
    }

    _renderDay() {
        let days = Array.from(new Array(31), (val, idx) => ('0' + (idx + 1)).slice(-2)), //make it 1-base double-digit
            select = $('<select/>', {
                id: `${this.id}__day`,
                class:  'cf-date-answer__day',
                style: 'margin-right: 1em'
            });

        select.append($('<option/>')); // empty (not answered) option
        days.forEach(day => {
            let option = $('<option/>', { value: day, text: day });
            select.append(option);
        });

        this._container.find('.cf-question__content').append(select);
    }

    _onModelValueChange() {
        if(Utils.isEmpty(this._question.value))
        {
            this._container.find('.cf-date-answer__day, .cf-date-answer__month, .cf-date-answer__year').val(null);
        }
        else {
            let [year, month, day] = this._question.value.split('-');

            this._container.find('.cf-date-answer__year').val(year);
            this._container.find('.cf-date-answer__month').val(month);
            this._container.find('.cf-date-answer__day').val(day);
        }
    }

    /* Control handlers */
    _attachControlHandlers() {
        this._container.find('.cf-date-answer__day, .cf-date-answer__month, .cf-date-answer__year').on('change', () => {
           let year = this._container.find('.cf-date-answer__year').val(),
               month = this._container.find('.cf-date-answer__month').val(),
               day = this._container.find('.cf-date-answer__day').val();

           if ([year, month, day].every(Utils.isEmpty)){
               this._question.setValue(null);
           }
           else {
               this._question.setValue([year, month, day].join('-'));
           }
        });
    }
}
