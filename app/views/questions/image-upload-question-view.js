import QuestionView from './base/question-view.js';
import ImageProcessor from '../helpers/image-processor.js';
import Event from 'event.js';

export default class ImageUploadQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        this._question.uploader.uploadProgressEvent.on(this._onUploadProgress.bind(this));
        this._question.uploader.uploadCompleteEvent.on(this._onUploadComplete.bind(this));
        this._question.uploader.uploadCancelEvent.on(this._onUploadCancel.bind(this));
        this._question.uploader.uploadErrorEvent.on(this._onUploadError.bind(this));

        this._imageProcessor = new ImageProcessor();

        this._progressControl = new ImageUploadProgress(this._container.find('.circular-progress'));
        this._progressControl.cancelEvent.on(this._onUploadProgressCancel.bind(this));

        this._fileInputNode = this._getQuestionInputNode();
        this._fileInputNode.on('change', this._onFileInputChange.bind(this));

        this._answerNode = this._container.find('.cf-image-upload-answer');
        this._previewNode =  this._answerNode.find('.cf-image-upload-answer__preview');
        this._uploadButton =  this._answerNode.find('.cf-image-upload-answer__upload-button');
        this._uploadButton.on('click', this._upload.bind(this));
    }

    /* this method have to be implemented in view, due to native app override */
    _upload() {
        this._fileInputNode.click();
    }

    _showError(error) {
        this._changeControlsState();

        this._errorBlock.showErrors([error]);
    }

    _hideError() {
        this._hideErrors();
    }

    _resetViewAndModel() {
        this._question.setValue(null, null);
        this._previewNode.find('.cf-image-upload-answer__preview-image').remove();
        this._fileInputNode.val('');
        this._hideError();
    }

    _changeControlsState(modifier) {
        this._answerNode.removeClass('cf-image-upload-answer--uploaded');
        this._answerNode.removeClass('cf-image-upload-answer--process');

        if (modifier === undefined && modifier !== 'uploaded' && modifier !== 'process') {
            return;
        }

        this._answerNode.addClass(`cf-image-upload-answer--${modifier}`);
    }

    async _processAndUploadImage(file) {
        this._resetViewAndModel();

        this._progressControl.start();
        this._changeControlsState('process');

        const blob = await this._processImage(file, this._question.maxImageWidth, this._question.maxImageHeight);

        if(this._progressControl.canceled === true){
            this._changeControlsState();
            return;
        }

        this._uploadImage(blob);
    }

    async _processImage(file, maxImageWidth, maxImageHeight) {
        if (!file.type) {
            this._showError('Unsupported file type');
            return;
        }

        if (/^image\/.*$/.test(file.type) === false) {
            this._showError('Only image files allowed.');
            return;
        }

        let blob;
        try {
            blob = await this._imageProcessor.process(file, maxImageWidth, maxImageHeight);
        } catch (error) {
            this._showError(error.message);
            return;
        }

        return blob;
    }

    _uploadImage(blob) {
        if(blob === undefined){
            return;
        }

        try {
            this._question.uploader.upload(blob);
        } catch(error) {
            this._showError(error.message);
        }
    }

    async _loadPreviewImage(url) {
        return new Promise(resolve => {
            const image = new Image();
            image.className = 'cf-image-upload-answer__preview-image';
            image.onload = () => {
                resolve(image);
            };
            image.src = url;
        });
    }

    async _showPreviewImage(imagePreviewUrl) {
        const image = await this._loadPreviewImage(imagePreviewUrl);
        this._previewNode.append(image);
    }

    async _onModelValueChange() {
        if (this._question.value.imageId === null) {
            this._changeControlsState();
            return;
        }

        await this._showPreviewImage(this._question.value.imagePreviewUrl);
        this._changeControlsState('uploaded');

    }

    _onUploadProgressCancel() {
        this._question.uploader.cancel();
    }

    _onUploadProgress(progressValue) {
        this._progressControl.progress(progressValue);
    }

    _onUploadComplete({imageId, imagePreviewUrl}) {
        this._progressControl.finish();
        this._question.setValue(imageId, imagePreviewUrl);
    }

    _onUploadCancel() {
        this._changeControlsState();
    }

    _onUploadError(error) {
        this._progressControl.finish();
        this._showError(error);
    }

    _onFileInputChange(event) {
        if (event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];

        this._processAndUploadImage(file)
    }
}



class ImageUploadProgress {
    constructor(container) {
        this._value = 0;

        this._cancelEvent = new Event('image-upload-progress:cancel');
        this._container = container;
        this._progressNode = container.find('.circular-progress__progress');
        this._container.on('click',  this._onClick.bind(this));
        this._circumference = 2 * Math.PI * parseInt(this._progressNode.attr('r'));

        this._canceled = null;
    }

    get cancelEvent() {
        return this._cancelEvent;
    }

    get canceled(){
        return this._canceled;
    }

    start() {
        this._value = 1;
        this._canceled = null;
        this._progressNode.attr('stroke-dashoffset', this._calculateDashOffset());
        this._progressNode.attr('stroke-dasharray', this._circumference);
    }

    progress(value) {
        this._value = value;
        this._progressNode.attr('stroke-dashoffset', this._calculateDashOffset());
    }

    finish() {
        this._value = 100;
        this._progressNode.attr('stroke-dashoffset', this._calculateDashOffset());
    }

    _calculateDashOffset() {
        return Math.round(((this._circumference * (100 - this._value)) / 100));
    }

    _onClick() {
        this._value = 0;
        this._progressNode.attr('stroke-dashoffset', this._calculateDashOffset());
        this._canceled = true;
        this._cancelEvent.trigger();
    }
}
