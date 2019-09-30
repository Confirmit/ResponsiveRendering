import Utils from 'utils.js';
import QuestionTypes from 'api/question-types.js';

export default class AutoNextNavigator {
    constructor(page) {
        this._page = page;
        this._init();
    }

    _init() {
        const {surveyInfo, questions} = this._page;
        if (!surveyInfo.autoNext) {
            return;
        }

        if (!questions.every(x => this._supportsAutoNext(x)))
            return;

        questions.forEach(x => x.changeEvent.on(() => this._onQuestionChange()));
    }

    _supportsAutoNext(question) {
        if (!question.answers || !question.answers.every(x => !x.isOther))
            return false;

        return this._isSingle(question) || this._isGrid(question) || this._isGrid3D(question);
    }

    _isSingle(question) {
        const singleTypes = [
            QuestionTypes.Single,
            QuestionTypes.HorizontalRatingScaleSingle,
            QuestionTypes.GridBarsSingle,
            QuestionTypes.StarRatingSingle
        ];
        return singleTypes.includes(question.type);
    }

    _isGrid(question) {
        const gridTypes = [
            QuestionTypes.Grid,
            QuestionTypes.HorizontalRatingScale,
            QuestionTypes.GridBars,
            QuestionTypes.StarRating
        ];
        return gridTypes.includes(question.type);
    }

    _isGrid3D(question) {
        const grid3DTypes = [QuestionTypes.Grid3d];
        return grid3DTypes.includes(question.type) && question.innerQuestions.every(x => this._supportsAutoNext(x));
    }

    _onQuestionChange() {
        const {questions} = this._page;
        if (questions.every(x => this._isAnswered(x)))
            this._page.next();
    }

    _isAnswered(question) {
        if (this._isSingle(question))
            return !Utils.isEmpty(question.value);

        if (this._isGrid(question))
            return question.answers.every(x => !Utils.isEmpty(question.values[x.code]));

        if (this._isGrid3D(question))
            return question.innerQuestions.every(x => this._isAnswered(x));

        return false;
    }

}

