import $ from 'jquery';
import SingleQuestionView from './questions/single-question-view.js';
import SingleSliderQuestionView from './questions/single-slider-question-view.js';
import MultiQuestionView from './questions/multi-question-view.js';
import GridQuestionView from './questions/grid-question-view.js';
import MultiGridQuestionView from './questions/multi-grid-question-view.js';
import OpenTextListQuestionView from './questions/open-text-list-question-view.js';
import OpenTextQuestionView from './questions/open-text-question-view.js';
import NumericQuestionView from './questions/numeric-question-view.js';
import NumericListQuestionView from './questions/numeric-list-question-view.js';
import DateQuestionView from './questions/date-question-view.js';
import DateQuestionPolyfillView from './questions/date-question-polyfill-view.js';
import RankingQuestionView from './questions/ranking-question-view.js';
import HorizontalRatingGridQuestionView from './questions/horizontal-rating-grid-question-view.js';
import HorizontalRatingSingleQuestionView from './questions/horizontal-rating-single-question-view.js';
import GridBarsQuestionView from './questions/grid-bars-question-view.js';
import StarRatingQuestionView from './questions/star-rating-question-view.js';
import CarouselGridQuestionView from './questions/carousel-grid-question-view.js';
import DropdownSingleQuestionView from './questions/dropdown-single-question-view.js';
import DropdownGridQuestionView from './questions/dropdown-grid-question-view.js';
import AnswerButtonsSingleQuestionView from './questions/answer-buttons-single-question-view.js';
import AnswerButtonsMultiQuestionView from './questions/answer-buttons-multi-question-view.js';
import GeolocationQuestionView from './questions/geolocation-question-view.js';

export default class QuestionViewFactory {
    create(model) {

        if (model.customRendering) {
            return;
        }

        switch (model.type) {
            case 'Single':
                return this._createSingleQuestionView(model);
            case 'Multi':
                return this._createMultiQuestionView(model);
            case 'Grid':
                return this._createGridQuestionView(model);
            case 'Grid3d':
                return new MultiGridQuestionView(model);
            case 'OpenText':
                return new OpenTextQuestionView(model);
            case 'Numeric':
                return new NumericQuestionView(model);
            case 'OpenTextList':
                return new OpenTextListQuestionView(model);
            case 'NumericList':
                return new NumericListQuestionView(model);
            case 'Date':
                return this._createDateQuestionView(model);
            case 'Ranking':
                return new RankingQuestionView(model);
            case 'HorizontalRatingScaleSingle':
                return new HorizontalRatingSingleQuestionView(model);
            case 'HorizontalRatingScaleGrid':
                return new HorizontalRatingGridQuestionView(model);
            case 'GridBars':
                return new GridBarsQuestionView(model);
            case 'StarRating':
                return new StarRatingQuestionView(model);
            case 'GeoLocation':
                return new GeolocationQuestionView(model);
            case 'DynamicQuestionPlaceholder':
                return;
            default:
                return;
        }
    }

    _createSingleQuestionView(model) {
        if(model.dropdown) {
            return new DropdownSingleQuestionView(model);
        }

        if(model.slider) {
            return new SingleSliderQuestionView(model);
        }

        if (model.answerButtons) {
            return new AnswerButtonsSingleQuestionView(model);
        }

        return new SingleQuestionView(model);
    }

    _createDateQuestionView(model) {
        const html5DateSupported = () => $('<input type="date"/>').prop('type').toLowerCase() === 'date';

        // load polyfill if needed
        if (!html5DateSupported()) {
            return new DateQuestionPolyfillView(model);
        }

        return new DateQuestionView(model);
    }

    _createGridQuestionView(model) {
        if(model.dropdown) {
            return new DropdownGridQuestionView(model);
        }
        if(model.carousel) {
            return new CarouselGridQuestionView(model);
        }

        return new GridQuestionView(model);
    }

    _createMultiQuestionView(model) {
        if (model.answerButtons) {
            return new AnswerButtonsMultiQuestionView(model);
        }

        return new MultiQuestionView(model);
    }

    _createGrid3dQuestionView(model) {
        return new MultiGridQuestionView(model);

        // if (model.MultiGrid) {
        //     return new MultiGridQuestionView(model);
        // }
        //
        // return new Grid3dQuestionView(model);
    }
}