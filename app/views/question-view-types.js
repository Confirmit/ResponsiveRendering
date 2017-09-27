import QuestionView from './questions/base/question-view.js';
import QuestionWithAnswersView from './questions/base/question-with-answers-view.js';
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

export default Object.freeze({
    'QuestionView': QuestionView,
    'QuestionWithAnswersView': QuestionWithAnswersView,
    'SingleQuestionView' : SingleQuestionView,
    'SingleSliderQuestionView' : SingleSliderQuestionView,
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
    'GridBarsQuestionView': GridBarsQuestionView,
    'StarRatingQuestionView': StarRatingQuestionView,
    'CarouselGridQuestionView': CarouselGridQuestionView,
    'DropdownSingleQuestionView': DropdownSingleQuestionView,
    'DropdownGridQuestionView': DropdownGridQuestionView,
    'AnswerButtonsSingleQuestionView': AnswerButtonsSingleQuestionView,
    'AnswerButtonsMultiQuestionView': AnswerButtonsMultiQuestionView,
    'GeolocationQuestionView': GeolocationQuestionView
});