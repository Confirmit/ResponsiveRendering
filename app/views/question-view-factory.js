import $ from 'jquery';
import QuestionTypes from 'api/question-types.js'
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
import GridBarsGridQuestionView from './questions/grid-bars-grid-question-view.js';
import GridBarsSingeQuestionView from './questions/grid-bars-single-question-view';
import StarRatingGridQuestionView from './questions/star-rating-grid-question-view.js';
import StarRatingSingleQuestionView from './questions/star-rating-single-question-view.js';
import CarouselGridQuestionView from './questions/carousel-grid-question-view.js';
import AccordionGridQuestionView from './questions/accordion-grid-question-view.js';
import DropdownSingleQuestionView from './questions/dropdown-single-question-view.js';
import DropdownGridQuestionView from './questions/dropdown-grid-question-view.js';
import AnswerButtonsSingleQuestionView from './questions/answer-buttons-single-question-view.js';
import AnswerButtonsMultiQuestionView from './questions/answer-buttons-multi-question-view.js';
import GeolocationQuestionView from './questions/geolocation-question-view.js';
import ImageUploadQuestionView from './questions/image-upload-question-view.js';
import LoginPageQuestionView from './questions/login-page-question-view.js';
import Grid3DQuestionView from './questions/grid-3d-question-view.js';
import MaxDiffQuestionView from './questions/max-diff/max-diff-question-view.js';
import CarouselMultiGridQuestionView from './questions/carousel-multi-grid-question-view.js';
import DropdownHierarchyQuestionView from './questions/dropdown-hierarchy-question-view';
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
            case QuestionTypes.Single:
                return this._createSingleQuestionView(model);
            case QuestionTypes.Multi:
                return this._createMultiQuestionView(model);
            case QuestionTypes.Grid:
                return this._createGridQuestionView(model);
            case QuestionTypes.Grid3d:
                return this._createGrid3DQuestionView(model);
            case QuestionTypes.OpenText:
                return new OpenTextQuestionView(model, this._questionViewSettings);
            case QuestionTypes.Numeric:
                return new NumericQuestionView(model, this._questionViewSettings);
            case QuestionTypes.OpenTextList:
                return new OpenTextListQuestionView(model, this._questionViewSettings);
            case QuestionTypes.NumericList:
                return new NumericListQuestionView(model, this._questionViewSettings);
            case QuestionTypes.Date:
                return this._createDateQuestionView(model);
            case QuestionTypes.Ranking:
                return new RankingQuestionView(model, this._questionViewSettings);
            case QuestionTypes.HorizontalRatingScaleSingle:
                return new HorizontalRatingSingleQuestionView(model, this._questionViewSettings);
            case QuestionTypes.HorizontalRatingScale:
                return new HorizontalRatingGridQuestionView(model, this._questionViewSettings);
            case QuestionTypes.GridBars:
                return new GridBarsGridQuestionView(model, this._questionViewSettings);
            case QuestionTypes.GridBarsSingle:
                return new GridBarsSingeQuestionView(model, this._questionViewSettings);
            case QuestionTypes.StarRating:
                return new StarRatingGridQuestionView(model, this._questionViewSettings);
            case QuestionTypes.StarRatingSingle:
                return new StarRatingSingleQuestionView(model, this._questionViewSettings);
            case QuestionTypes.GeoLocation:
                return new GeolocationQuestionView(model, this._questionViewSettings);
            case QuestionTypes.ImageUploader:
                return new ImageUploadQuestionView(model);
            case QuestionTypes.DynamicQuestionPlaceholder:
                return;
            case QuestionTypes.Login:
                return new LoginPageQuestionView(model);
            case QuestionTypes.Hierarchy:
                return new DropdownHierarchyQuestionView(model, this._questionViewSettings);
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
        if(model.accordion) {
            return new AccordionGridQuestionView(model, this._questionViewSettings);
        }
        return new GridQuestionView(model, this._questionViewSettings);
    }

    _createMultiQuestionView(model) {
        if (model.answerButtons) {
            return new AnswerButtonsMultiQuestionView(model, this._questionViewSettings);
        }

        return new MultiQuestionView(model, this._questionViewSettings);
    }

    _createGrid3DQuestionView(model) {
        if (model.multiGrid) {
            if(model.carousel){
                return new CarouselMultiGridQuestionView(model, this._questionViewSettings);
            }
            return new MultiGridQuestionView(model, this._questionViewSettings);
        }

        if (model.maxDiff) {
            return new MaxDiffQuestionView(model, this._questionViewSettings);
        }


        return new Grid3DQuestionView(model, this._questionViewSettings);
    }
}