import $ from 'jquery';
import QuestionTypes from 'api/question-types.js'
import SingleQuestionView from './questions/single-question-view.js';
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
import CaptureOrderMultiQuestionView from './questions/capture-order-multi-question-view';
import AnswerButtonsCaptureOrderMultiQuestionView from './questions/answer-buttons-capture-order-multi-question-view';
import HorizontalRatingGridQuestionView from './questions/horizontal-rating-grid-question-view.js';
import HorizontalRatingSingleQuestionView from './questions/horizontal-rating-single-question-view.js';
import GridBarsGridQuestionView from './questions/grid-bars-grid-question-view.js';
import GridBarsSingeQuestionView from './questions/grid-bars-single-question-view';
import StarRatingGridQuestionView from './questions/star-rating-grid-question-view.js';
import StarRatingSingleQuestionView from './questions/star-rating-single-question-view.js';
import CarouselGridQuestionView from './questions/carousel-grid-question-view.js';
import CarouselMultiGridQuestionView from './questions/carousel-multi-grid-question-view.js';
import CarouselHorizontalRatingGridQuestionView from './questions/carousel-horizontal-rating-grid-question-view.js';
import CarouselGridBarsGridQuestionView from './questions/carousel-grid-bars-grid-question-view.js';
import CarouselStarRatingGridQuestionView from './questions/carousel-star-rating-grid-question-view.js';
import AccordionGridQuestionView from './questions/accordion-grid-question-view.js';
import DropdownSingleQuestionView from './questions/dropdown-single-question-view.js';
import DropdownGridQuestionView from './questions/dropdown-grid-question-view.js';
import DropdownHierarchyQuestionView from './questions/dropdown-hierarchy-question-view';
import AnswerButtonsSingleQuestionView from './questions/answer-buttons-single-question-view.js';
import AnswerButtonsMultiQuestionView from './questions/answer-buttons-multi-question-view.js';
import GeolocationQuestionView from './questions/geolocation-question-view.js';
import ImageUploadQuestionView from './questions/image-upload-question-view.js';
import LoginPageQuestionView from './questions/login-page-question-view.js';
import Grid3DQuestionView from './questions/grid-3d-question-view.js';
import MaxDiffQuestionView from './questions/max-diff/max-diff-question-view.js';
import SliderSingleQuestionView from './questions/slider-single-question-view.js';
import SliderGridQuestionView from './questions/slider-grid-question-view.js';
import SliderNumericQuestionView from './questions/slider-numeric-question-view.js';
import SliderNumericListQuestionView from "./questions/slider-numeric-list-question-view";
import VideoUploadQuestionView from './questions/video-upload-question-view';
import AudioUploadQuestionView from './questions/audio-upload-question-view';
import CodeCaptureQuestionView from "./questions/code-capture-question-view";
import SearchableMultiQuestionView from "./questions/searchable-multi-question-view";
import SearchableSingleQuestionView from "./questions/searchable-single-question-view";

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
                return this._createNumericQuestionView(model);
            case QuestionTypes.OpenTextList:
                return new OpenTextListQuestionView(model, this._questionViewSettings);
            case QuestionTypes.NumericList:
                return this._createNumericListQuestionView(model);
            case QuestionTypes.Date:
                return this._createDateQuestionView(model);
            case QuestionTypes.Ranking:
                return this._createRankingQuestionView(model);
            case QuestionTypes.HorizontalRatingScaleSingle:
                return new HorizontalRatingSingleQuestionView(model, this._questionViewSettings);
            case QuestionTypes.HorizontalRatingScale:
                return this._createHorizontalRatingGridQuestionView(model);
            case QuestionTypes.GridBars:
                return this._createGridBarsGridQuestionView(model);
            case QuestionTypes.GridBarsSingle:
                return new GridBarsSingeQuestionView(model, this._questionViewSettings);
            case QuestionTypes.StarRating:
                return this._createStarRatingGridQuestionView(model);
            case QuestionTypes.StarRatingSingle:
                return new StarRatingSingleQuestionView(model, this._questionViewSettings);
            case QuestionTypes.GeoLocation:
                return new GeolocationQuestionView(model, this._questionViewSettings);
            case QuestionTypes.ImageUploader:
                return new ImageUploadQuestionView(model);
            case QuestionTypes.VideoCapture:
                return new VideoUploadQuestionView(model, this._questionViewSettings);
            case QuestionTypes.AudioCapture:
                return new AudioUploadQuestionView(model, this._questionViewSettings);
            case QuestionTypes.CodeCapture:
                return new CodeCaptureQuestionView(model, this._questionViewSettings);
            case QuestionTypes.DynamicQuestionPlaceholder:
                return;
            case QuestionTypes.Login:
                return new LoginPageQuestionView(model);
            case QuestionTypes.Hierarchy:
                return new DropdownHierarchyQuestionView(model, this._questionViewSettings);
            case  QuestionTypes.SearchableMulti:
                return new SearchableMultiQuestionView(model, this._questionViewSettings);
            case QuestionTypes.SearchableSingle:
                return new SearchableSingleQuestionView(model, this._questionViewSettings);
            default:
                return;
        }
    }

    _createSingleQuestionView(model) {
        if (model.dropdown) {
            return new DropdownSingleQuestionView(model, this._questionViewSettings);
        }

        if (model.slider) {
            return new SliderSingleQuestionView(model, this._questionViewSettings);
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
        if (model.dropdown) {
            return new DropdownGridQuestionView(model, this._questionViewSettings);
        }

        if (model.carousel) {
            return new CarouselGridQuestionView(model, this._questionViewSettings);
        }

        if (model.accordion) {
            return new AccordionGridQuestionView(model, this._questionViewSettings);
        }

        if (model.slider) {
            return new SliderGridQuestionView(model, this._questionViewSettings);
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
            if (model.carousel) {
                return new CarouselMultiGridQuestionView(model, this._questionViewSettings);
            }
            return new MultiGridQuestionView(model, this._questionViewSettings);
        }

        if (model.maxDiff) {
            return new MaxDiffQuestionView(model, this._questionViewSettings);
        }

        return new Grid3DQuestionView(model, this._questionViewSettings);
    }

    _createNumericQuestionView(model) {
        if (model.slider) {
            return new SliderNumericQuestionView(model, this._questionViewSettings);
        }

        return new NumericQuestionView(model, this._questionViewSettings);
    }
    _createNumericListQuestionView(model) {
        if (model.slider) {
            return new SliderNumericListQuestionView(model, this._questionViewSettings);
        }

        return new NumericListQuestionView(model, this._questionViewSettings);
    }

    _createHorizontalRatingGridQuestionView(model) {
        if (model.carousel) {
            return new CarouselHorizontalRatingGridQuestionView(model, this._questionViewSettings);
        }

        return new HorizontalRatingGridQuestionView(model, this._questionViewSettings);
    }

    _createGridBarsGridQuestionView(model) {
        if (model.carousel) {
            return new CarouselGridBarsGridQuestionView(model, this._questionViewSettings);
        }

        return new GridBarsGridQuestionView(model, this._questionViewSettings);
    }

    _createStarRatingGridQuestionView(model) {
        if (model.carousel) {
            return new CarouselStarRatingGridQuestionView(model, this._questionViewSettings);
        }

        return new StarRatingGridQuestionView(model, this._questionViewSettings);
    }

    _createRankingQuestionView(model) {
        if (model.captureOrder) {
            if (model.answerButtons) {
                return new AnswerButtonsCaptureOrderMultiQuestionView(model, this._questionViewSettings);
            }

            return new CaptureOrderMultiQuestionView(model, this._questionViewSettings);
        }

        return new RankingQuestionView(model, this._questionViewSettings);
    }
}