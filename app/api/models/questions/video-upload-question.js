import Question from '../base/question';
import Utils from 'utils.js';

/**
 * @desc VideoUploadQuestion.
 * @extends {Question}
 */
export default class VideoUploadQuestion extends Question {
    /**
     *
     * @param {object} model - Raw question model.
     */
    constructor(model) {
        super(model);

        this._videoId = null;
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

        if(!Utils.isEmpty(this._videoId)){
            form[this.id] = this._videoId;
        }

        return form;
    }

    /**
     * Minimum duration of video file in seconds.
     * @type {number}
     * @readonly
     */
    get minDurationInSeconds() {
        return this._minDurationInSeconds;
    }

    /**
     * Maximum duration of video file in seconds.
     * @type {number}
     * @readonly
     */
    get maxDurationInSeconds() {
        return this._maxDurationInSeconds;
    }

    /**
     * Video upload value.
     * @type {{videoId: string, previewUrl: string, duration: number}}
     * @readonly
     */
    get value() {
        return { videoId: this._videoId, previewUrl: this._previewUrl, duration: this._duration };
    }

    /**
     * Set answer value.
     * @param {string} videoId - Video ID.
     * @param {string} previewUrl - Video preview URL.
     * @param {number} duration - Video file duration in seconds.
     */
    setValue(videoId, previewUrl, duration) {
        const changed = this._setValue(videoId, previewUrl, duration);
        if (changed) {
            this._onChange({value: {videoId, previewUrl, duration}});
        }
    }

    _setValue(videoId, previewUrl, duration) {
        const newVideoId = Utils.isEmpty(videoId) ? null : videoId.toString();
        const newPreviewUrl = Utils.isEmpty(previewUrl) ? null : previewUrl.toString();

        if (newVideoId === this._videoId) {
            return false;
        }

        if (newVideoId === null) {
            this._videoId = null;
            this._previewUrl = null;
            return true;
        }

        this._videoId = newVideoId;
        this._previewUrl = newPreviewUrl;
        this._duration = duration;

        return true;
    }

    _loadInitialState(model) {
        this._videoId = model.videoId;
        this._previewUrl = model.previewUrl;

        this._minDurationInSeconds = model.minDurationInSeconds;
        this._maxDurationInSeconds = model.maxDurationInSeconds;
    }
}
