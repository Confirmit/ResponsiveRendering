import QuestionTypes from './question-types.js';
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
import SingleRatingQuestion from './models/questions/single-rating-question.js';
import GridRatingQuestion from './models/questions/grid-rating-question.js';
import Grid3DQuestion from './models/questions/grid-3d-question.js';
import GeolocationQuestion from './models/questions/geolocation-question.js';
import DynamicQuestionPlaceholder from './models/questions/dynamic-question-placeholder.js';
import ImageUploadQuestion from './models/questions/image-upload-question.js';
import ImageUploader from "./image-uploader";
import LoginPageQuestion from "./models/questions/login-page-question";
import TelephoneQuestion from "./models/questions/telephone-question";
import HierarchyQuestion from "./models/questions/hierarchy-question";
import HierarchyService from "./hierarchy-service";
import Question from "./models/base/question";
import VideoUploadQuestion from './models/questions/video-upload-question';
import AudioUploadQuestion from './models/questions/audio-upload-question';
import CodeCaptureQuestion from './models/questions/code-capture-question';
import SearchableSingleQuestion  from './models/questions/searchable-single-question.js';
import SearchableMultiQuestion  from './models/questions/searchable-multi-question.js';
import SearchableAnswerListService  from './searchable-answer-list-service.js';

export default class QuestionFactory {
    constructor(language, endpoints, isAccessible = true) {
        this._language = language;
        this._endpoints = endpoints;
        this._isAccessible = isAccessible;
    }

    create(rawModel) {
        const model = this._create(rawModel);

        if(this._isAccessible && model instanceof Question) {
            model.allowValidateOnChange = false;
        }

        return model;
    }

    _create(rawModel) {
        switch (rawModel.nodeType) {
            case QuestionTypes.Single:
                return new SingleQuestion(rawModel);
            case QuestionTypes.Multi:
                return new MultiQuestion(rawModel);
            case QuestionTypes.Grid:
                return new GridQuestion(rawModel);
            case QuestionTypes.OpenText:
                return new OpenTextQuestion(rawModel);
            case QuestionTypes.Numeric:
                return new NumericQuestion(rawModel);
            case QuestionTypes.OpenTextList:
                return new OpenTextListQuestion(rawModel);
            case QuestionTypes.NumericList:
                return new NumericListQuestion(rawModel);
            case QuestionTypes.Info:
                return new InfoQuestion(rawModel);
            case QuestionTypes.Date:
                return new DateQuestion(rawModel);
            case QuestionTypes.Ranking:
                return new RankingQuestion(rawModel);
            case QuestionTypes.HorizontalRatingScaleSingle:
            case QuestionTypes.GridBarsSingle:
            case QuestionTypes.StarRatingSingle:
                return new SingleRatingQuestion(rawModel);
            case QuestionTypes.HorizontalRatingScale:
            case QuestionTypes.GridBars:
            case QuestionTypes.StarRating:
                return new GridRatingQuestion(rawModel);
            case QuestionTypes.Grid3d:
                return new Grid3DQuestion(rawModel, this);
            case QuestionTypes.GeoLocation:
                return new GeolocationQuestion(rawModel);
            case QuestionTypes.DynamicQuestionPlaceholder:
                return new DynamicQuestionPlaceholder(rawModel);
            case QuestionTypes.ImageUploader:
                return new ImageUploadQuestion(rawModel, new ImageUploader(this._endpoints.imageUploadEndpoint));
            case QuestionTypes.VideoCapture:
                return new VideoUploadQuestion(rawModel);
            case QuestionTypes.AudioCapture:
                return new AudioUploadQuestion(rawModel);
            case QuestionTypes.CodeCapture:
                return new CodeCaptureQuestion(rawModel);
            case QuestionTypes.Login:
                return new LoginPageQuestion(rawModel);
            case QuestionTypes.Telephone:
                return new TelephoneQuestion(rawModel);
            case QuestionTypes.Hierarchy:
                return new HierarchyQuestion(rawModel, new HierarchyService(this._endpoints.hierarchyApiEndpoint, this._language));
            case QuestionTypes.SearchableSingle:
                return new SearchableSingleQuestion(rawModel, new SearchableAnswerListService(this._endpoints.searchableAnswerListEndpoint));
            case QuestionTypes.SearchableMulti:
                return new SearchableMultiQuestion(rawModel, new SearchableAnswerListService(this._endpoints.searchableAnswerListEndpoint));
            default:
                return;
        }
    }
}