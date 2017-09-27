import SingleQuestion from './models/questions/single-question.js';
import MultiQuestion  from './models/questions/multi-question.js';
import GridQuestion   from './models/questions/grid-question.js';
import OpenTextListQuestion from './models/questions/open-text-list-question.js';
import OpenTextQuestion from './models/questions/open-text-question.js';
import NumericQuestion from './models/questions/numeric-question.js';
import NumericListQuestion from './models/questions/numeric-list-question.js';
import InfoQuestion from './models/questions/info-question.js';
import DateQuestion from './models/questions/date-question.js';
import RankingQuestion from './models/questions/ranking-question.js';
import HorizontalRatingSingleQuestion from './models/questions/horizontal-rating-single-question.js';
import GridRatingQuestion from './models/questions/grid-rating-question.js';
import Grid3DQuestion from './models/questions/grid-3d-question.js';
import GeolocationQuestion from './models/questions/geolocation-question.js';
import DynamicQuestionPlaceholder from './models/questions/dynamic-question-placeholder.js';

export default class QuestionFactory {
    static create(rawModel) {

        switch (rawModel.nodeType) {
            case 'Single':
                return new SingleQuestion(rawModel);
            case 'Multi':
                return new MultiQuestion(rawModel);
            case 'Grid':
                return new GridQuestion(rawModel);
            case 'OpenText':
                return new OpenTextQuestion(rawModel);
            case 'Numeric':
                return new NumericQuestion(rawModel);
            case 'OpenTextList':
                return new OpenTextListQuestion(rawModel);
            case 'NumericList':
                return new NumericListQuestion(rawModel);
            case 'Info':
                return new InfoQuestion(rawModel);
            case 'Date':
                return new DateQuestion(rawModel);
            case 'Ranking':
                return new RankingQuestion(rawModel);
            case 'HorizontalRatingScaleSingle':
                return new HorizontalRatingSingleQuestion(rawModel);
            case 'HorizontalRatingScaleGrid':
            case 'GridBars':
            case 'StarRating':
                return new GridRatingQuestion(rawModel);
            case 'Grid3d':
                return new Grid3DQuestion(rawModel);
            case 'GeoLocation':
                return new GeolocationQuestion(rawModel);
            case 'DynamicQuestionPlaceholder':
                return new DynamicQuestionPlaceholder(rawModel);
            default:
                return;
        }
    }
}