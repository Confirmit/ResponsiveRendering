import AnswerErrorManager from "../../../error/answer-error-manager";
import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerGridQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._answerErrorManager = new AnswerErrorManager();

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        const itemClickHandler = (answer, scale) => {
            this._getScaleNode(answer.code, scale.code).on('click', this._onScaleItemClick.bind(this, answer, scale));
        };

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => itemClickHandler(answer, scale));
        });
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => {
                this._getScaleNode(answer.code, scale.code).removeClass('cf-grid-single-answer--selected');
            });
        });

        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-grid-single-answer--selected');
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
    }

    // TODO: do we want to mark answers only for grid?
    // _onValidationComplete(validationResult) {
    //     if(validationResult.valid) {
    //         this._answerErrorManager.removeAllErrors();
    //         return;
    //     }
    //
    //     validationResult.answerValidationResults.forEach(answerValidationResult => {
    //         const answer = this._question.getAnswer(answerValidationResult.answerCode);
    //         if(answer.isOther) {
    //             return;
    //         }
    //
    //         const target = this._getAnswerTextNode(answerValidationResult.answerCode);
    //         this._answerErrorManager.showErrors(answerValidationResult, target);
    //     });
    // }

    _onScaleItemClick(answer, scale) {
        this._question.setValue(answer.code, scale.code);
    }
}