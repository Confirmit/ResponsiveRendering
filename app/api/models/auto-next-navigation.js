export default class AutoNextNavigation {
    constructor(page){
        this._page = page;
        this._init();
    }

    _init(){
        if (!this._page.surveyInfo.autoNext) {
            return;
        }

        const availableQuestionTypes = ['Single', 'HorizontalRatingScaleSingle', 'Grid', 'GridBars', 'HorizontalRatingScaleGrid', 'StarRating'];
        const allAnswersAreSupportedAutoNext = this._page.questions.every(question => availableQuestionTypes.includes(question.type) && question.answers.every(answer => !answer.isOther));

        if (!allAnswersAreSupportedAutoNext) {
            return;
        }

        this._page.questions.forEach(model => model.changeEvent.on(this._onQuestionChangeHandler.bind(this)));
    }


    _onQuestionChangeHandler() {
        const valid = this._page.questions.every(question => question.validate(false).isValid);

        if (!valid) {
            return
        }

        this._page.next();
    }
}

