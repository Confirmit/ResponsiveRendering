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
import ImageUploadQuestionView from "./questions/image-upload-question-view";
import LoginPageQuestionView from './questions/login-page-question-view.js';

/**
 * @desc Question view factory
 */
export default class QuestionViewFactory {
    /**
     * @param {QuestionViewSettings} questionViewSettings Question view settings.
     */
    constructor(questionViewSettings) {
        this._questionViewSettings = questionViewSettings;
    }

    /**
     * Question view settings.
     * @returns {QuestionViewSettings}
     * @readonly
     */
    get questionViewSettings() {
        return this._questionViewSettings;
    }

    /**
     * Create question view.
     * @param {object} model Question model.
     * @returns {object|undefined} Question view.
     */
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
                return new MultiGridQuestionView(model, this._questionViewSettings);
            case 'OpenText':
                return new OpenTextQuestionView(model, this._questionViewSettings);
            case 'Numeric':
                return new NumericQuestionView(model, this._questionViewSettings);
            case 'OpenTextList':
                return new OpenTextListQuestionView(model, this._questionViewSettings);
            case 'NumericList':
                return new NumericListQuestionView(model, this._questionViewSettings);
            case 'Date':
                return this._createDateQuestionView(model);
            case 'Ranking':
                return new RankingQuestionView(model, this._questionViewSettings);
            case 'HorizontalRatingScaleSingle':
                return new HorizontalRatingSingleQuestionView(model, this._questionViewSettings);
            case 'HorizontalRatingScaleGrid':
                return new HorizontalRatingGridQuestionView(model, this._questionViewSettings);
            case 'GridBars':
                return new GridBarsQuestionView(model, this._questionViewSettings);
            case 'StarRating':
                return new StarRatingQuestionView(model, this._questionViewSettings);
            case 'GeoLocation':
                return new GeolocationQuestionView(model, this._questionViewSettings);
            case 'ImageUploader':
                return new ImageUploadQuestionView(model);
            case 'DynamicQuestionPlaceholder':
                return;
            case 'Login':
                return new LoginPageQuestionView(model);
            default:
                return;
        }
    }

    _createSingleQuestionView(model) {
        if(model.dropdown) {
            return new DropdownSingleQuestionView(model, this._questionViewSettings);
        }

        if(model.slider) {
            return new SingleSliderQuestionView(model, this._questionViewSettings);
        }

        if (model.answerButtons) {
            return new AnswerButtonsSingleQuestionView(model, this._questionViewSettings);
        }

        return new SingleQuestionView(model, this._questionViewSettings);
    }

    _createDateQuestionView(model) {
        const html5DateSupported = () => $('<input type="date"/>').prop('type').toLowerCase() === 'date';

        // load polyfill if needed
        if (!html5DateSupported()) {
            return new DateQuestionPolyfillView(model, this._questionViewSettings);
        }

        return new DateQuestionView(model, this._questionViewSettings);
    }

    _createGridQuestionView(model) {
        if(model.dropdown) {
            return new DropdownGridQuestionView(model, this._questionViewSettings);
        }
        if(model.carousel) {
            return new CarouselGridQuestionView(model, this._questionViewSettings);
        }

        return new GridQuestionView(model, this._questionViewSettings);
    }

    _createMultiQuestionView(model) {
        if (model.answerButtons) {
            return new AnswerButtonsMultiQuestionView(model, this._questionViewSettings);
        }

        return new MultiQuestionView(model, this._questionViewSettings);
    }

    _createGrid3dQuestionView(model) {
        return new MultiGridQuestionView(model, this._questionViewSettings);

        // if (model.MultiGrid) {
        //     return new MultiGridQuestionView(model, this._questionViewSettings);
        // }
        //
        // return new Grid3dQuestionView(model, this._questionViewSettings);
    }
}