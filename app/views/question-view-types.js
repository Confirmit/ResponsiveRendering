import QuestionViewBase from './questions/base/question-view-base';
import QuestionView from './questions/base/question-view.js';
import QuestionWithAnswersView from './questions/base/question-with-answers-view.js';
import SingleQuestionView from './questions/single-question-view.js';
import SliderSingleQuestionView from './questions/slider-single-question-view.js';
import SliderNumericQuestionView from './questions/slider-numeric-question-view.js';
import SliderGridQuestionView from './questions/slider-grid-question-view.js';
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
import GridBarsSingleQuestionView from './questions/grid-bars-single-question-view.js';
import StarRatingGridQuestionView from './questions/star-rating-grid-question-view.js';
import StarRatingSingleQuestionView from './questions/star-rating-single-question-view.js';
import CarouselGridQuestionView from './questions/carousel-grid-question-view.js';
import CarouselHorizontalRatingGridQuestionView from './questions/carousel-horizontal-rating-grid-question-view.js';
import CarouselGridBarsGridQuestionView from './questions/carousel-grid-bars-grid-question-view.js';
import CarouselStarRatingGridQuestionView from './questions/carousel-star-rating-grid-question-view.js';
import DropdownSingleQuestionView from './questions/dropdown-single-question-view.js';
import DropdownGridQuestionView from './questions/dropdown-grid-question-view.js';
import AnswerButtonsSingleQuestionView from './questions/answer-buttons-single-question-view.js';
import AnswerButtonsMultiQuestionView from './questions/answer-buttons-multi-question-view.js';
import GeolocationQuestionView from './questions/geolocation-question-view.js';
import ImageUploadQuestionView from './questions/image-upload-question-view.js';
import LoginPageQuestionView from './questions/login-page-question-view.js';
import Grid3DQuestionView from './questions/grid-3d-question-view';
import Grid3DDesktopQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-question-view';
import Grid3DDesktopInnerQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-question-view';
import Grid3DDesktopInnerSingleQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-single-question-view';
import Grid3DDesktopInnerMultiQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-multi-question-view';
import Grid3DDesktopInnerOpenListQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-open-list-question-view';
import Grid3DDesktopInnerNumericListQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-numeric-list-question-view';
import Grid3DDesktopInnerGridQuestionView from './questions/grid-3d/desktop/grid-3d-desktop-inner-grid-question-view';
import Grid3DMobileQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-question-view';
import Grid3DMobileInnerQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-question-view';
import Grid3DMobileInnerSingleQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-single-question-view';
import Grid3DMobileInnerMultiQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-multi-question-view';
import Grid3DMobileInnerOpenListQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-open-list-question-view';
import Grid3DMobileInnerNumericListQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-numeric-list-question-view';
import Grid3DMobileInnerGridQuestionView from './questions/grid-3d/mobile/grid-3d-mobile-inner-grid-question-view';
import MaxDiffQuestionView from './questions/max-diff/max-diff-question-view.js';
import DropdownHierarchyQuestionView from "./questions/dropdown-hierarchy-question-view";
import AudioUploadQuestionView from './questions/audio-upload-question-view';
import VideoUploadQuestionView from './questions/video-upload-question-view';


export default Object.freeze({
    'QuestionViewBase': QuestionViewBase,
    'QuestionView': QuestionView,
    'QuestionWithAnswersView': QuestionWithAnswersView,
    'SingleQuestionView' : SingleQuestionView,
    'SliderSingleQuestionView' : SliderSingleQuestionView,
    'SliderNumericQuestionView' : SliderNumericQuestionView,
    'SliderGridQuestionView' : SliderGridQuestionView,
    'MultiQuestionView': MultiQuestionView,
    'GridQuestionView': GridQuestionView,
    'MultiGridQuestionView': MultiGridQuestionView,
    'OpenTextListQuestionView': OpenTextListQuestionView,
    'OpenTextQuestionView': OpenTextQuestionView,
    'NumericQuestionView': NumericQuestionView,
    'NumericListQuestionView': NumericListQuestionView,
    'DateQuestionView': DateQuestionView,
    'DateQuestionPolyfillView': DateQuestionPolyfillView,
    'RankingQuestionView': RankingQuestionView,
    'HorizontalRatingGridQuestionView': HorizontalRatingGridQuestionView,
    'HorizontalRatingSingleQuestionView': HorizontalRatingSingleQuestionView,
    'GridBarsGridQuestionView': GridBarsGridQuestionView,
    'GridBarsSingleQuestionView': GridBarsSingleQuestionView,
    'StarRatingGridQuestionView': StarRatingGridQuestionView,
    'StarRatingSingleQuestionView': StarRatingSingleQuestionView,
    'CarouselGridQuestionView': CarouselGridQuestionView,
    'CarouselHorizontalRatingGridQuestionView': CarouselHorizontalRatingGridQuestionView,
    'CarouselGridBarsGridQuestionView': CarouselGridBarsGridQuestionView,
    'CarouselStarRatingGridQuestionView': CarouselStarRatingGridQuestionView,
    'DropdownSingleQuestionView': DropdownSingleQuestionView,
    'DropdownGridQuestionView': DropdownGridQuestionView,
    'AnswerButtonsSingleQuestionView': AnswerButtonsSingleQuestionView,
    'AnswerButtonsMultiQuestionView': AnswerButtonsMultiQuestionView,
    'GeolocationQuestionView': GeolocationQuestionView,  // This ref used in mobile CAPI app overrides
    'ImageUploadQuestionView': ImageUploadQuestionView, // This ref used in mobile CAPI app overrides
    'AudioUploadQuestionView': AudioUploadQuestionView, // This ref used in mobile CAPI app overrides
    'VideoUploadQuestionView': VideoUploadQuestionView, // This ref used in mobile CAPI app overrides
    'LoginPageQuestionView': LoginPageQuestionView,
    'DropdownHierarchyQuestionView': DropdownHierarchyQuestionView,
    'MaxDiffQuestionView': MaxDiffQuestionView,

    'Grid3DQuestionView': Grid3DQuestionView,
    'Grid3DDesktopQuestionView': Grid3DDesktopQuestionView,
    'Grid3DDesktopInnerQuestionView': Grid3DDesktopInnerQuestionView,
    'Grid3DDesktopInnerSingleQuestionView': Grid3DDesktopInnerSingleQuestionView,
    'Grid3DDesktopInnerMultiQuestionView': Grid3DDesktopInnerMultiQuestionView,
    'Grid3DDesktopInnerOpenListQuestionView': Grid3DDesktopInnerOpenListQuestionView,
    'Grid3DDesktopInnerNumericListQuestionView': Grid3DDesktopInnerNumericListQuestionView,
    'Grid3DDesktopInnerGridQuestionView': Grid3DDesktopInnerGridQuestionView,
    'Grid3DMobileQuestionView': Grid3DMobileQuestionView,
    'Grid3DMobileInnerQuestionView': Grid3DMobileInnerQuestionView,
    'Grid3DMobileInnerSingleQuestionView': Grid3DMobileInnerSingleQuestionView,
    'Grid3DMobileInnerMultiQuestionView': Grid3DMobileInnerMultiQuestionView,
    'Grid3DMobileInnerOpenListQuestionView': Grid3DMobileInnerOpenListQuestionView,
    'Grid3DMobileInnerNumericListQuestionView': Grid3DMobileInnerNumericListQuestionView,
    'Grid3DMobileInnerGridQuestionView': Grid3DMobileInnerGridQuestionView,
});