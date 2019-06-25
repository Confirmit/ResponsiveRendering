import Question from '../base/question';
import Utils from 'utils.js';

/**
 * @desc AudioUploadQuestion.
 * @extends {Question}
 */
export default class AudioUploadQuestion extends Question {
    /**
     *
     * @param {object} model - Raw question model.
     */
    constructor(model) {
        super(model);

        this._audioId = null;
        this._previewUrl = null;
        this._duration = null;

        this._minDurationInSeconds = null;
        this._maxDurationInSeconds = null;

        this._loadInitialState(model);
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        const form = {};

        if(!Utils.isEmpty(this._audioId)){
            form[this.id] = this._audioId;
        }

        return form;
    }

    /**
     * Minimum duration of audio file in seconds.
     * @type {number}
     * @readonly
     */
    get minDurationInSeconds() {
        return this._minDurationInSeconds;
    }

    /**
     * Maximum duration of audio file in seconds.
     * @type {number}
     * @readonly
     */
    get maxDurationInSeconds() {
        return this._maxDurationInSeconds;
    }

    /**
     * Audio upload value.
     * @type {{audioId: string, previewUrl: string, duration: number}}
     * @readonly
     */
    get value() {
        return { audioId: this._audioId, previewUrl: this._previewUrl, duration: this._duration };
    }

    /**
     * Set answer value.
     * @param {string} audioId - Audio ID.
     * @param {string} previewUrl - Audio preview URL.
     * @param {number} duration - Audio file duration in seconds.
     */
    setValue(audioId, previewUrl, duration) {
        const changed = this._setValue(audioId, previewUrl, duration);
        if (changed) {
            this._onChange({value: {audioId, previewUrl, duration}});
        }
    }

    _setValue(audioId, previewUrl, duration) {
        const newAudioId = Utils.isEmpty(audioId) ? null : audioId.toString();
        const newPreviewUrl = Utils.isEmpty(previewUrl) ? null : previewUrl.toString();

        if (newAudioId === this._audioId) {
            return false;
        }

        if (newAudioId === null) {
            this._audioId = null;
            this._previewUrl = null;
            return true;
        }

        this._audioId = newAudioId;
        this._previewUrl = newPreviewUrl;
        this._duration = duration;

        return true;
    }

    _loadInitialState(model) {
        this._audioId = model.audioId;
        this._previewUrl = model.previewUrl;

        this._minDurationInSeconds = model.minDurationInSeconds;
        this._maxDurationInSeconds = model.maxDurationInSeconds;
    }
}
