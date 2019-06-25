import QuestionView from './base/question-view.js';

export default class AudioUploadView extends QuestionView {
    constructor(question) {
        super(question);

        this._node = this._container.find('.cf-media-upload');

        this._uploadButton = this._node.find('.cf-media-upload__upload-button');
        this._uploadButton.on('click', this._upload.bind(this));

        this._audioPlayer = this._node.find('.cf-audio-player')[0];
        this._previewDurationLabel = this._node.find('.cf-audio-preview__duration-label');

        this._playButton = this._node.find('.cf-audio-preview__icon');
        this._playButton.on('click', this._play.bind(this));
    }

    /* this method have to be implemented in view, due to native app override */
    _upload() {
        // not implemented for CAWI
    }

    _play() {
        this._audioPlayer.play();
    }

    _updatePreview() {
        this._audioPlayer.src = this._question.value.previewUrl;
        this._previewDurationLabel.text(this._question.value.duration);
    }

    async _onModelValueChange() {
        if (!this._question.value.audioId) {
            return;
        }

        this._updatePreview();

        this._node.addClass('cf-media-upload--uploaded');
    }
}
