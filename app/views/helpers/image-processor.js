const FLIP_X = 2;
const ROTATE_180 = 3;
const ROTATE_180_FLIP_X = 4;
const ROTATE_90_FLIP_X = 5;
const ROTATE_90 = 6;
const ROTATE_270_FLIP_X = 7;
const ROTATE_270 = 8;

//markers
const START_JPEG_MARKER = 0xFFD8;
const START_JFIF_MARKER = 0xFFE0;
const EXIF_HEADER = 0xFFE1;
const START_EXIF_MARKER = 0x45786966;
const INTEL_FORMAT_MARKER = 0x4949; //marker shows has littleEndian or not
const EXIF_ORIENTATION_MARKER = 0x0112;

export default class ImageProcessor {
    constructor() {
        this._downsamplingRatio = 0.5;
    }

    async process(file, maxImageWidth, maxImageHeight) {
        const arrayBuffer = await this._readFileToArrayBuffer(file);
        const orientation = this._readAndThenResetOrientation(arrayBuffer);
        const image = await this._loadImage(arrayBuffer, file.type);
        let canvas = await this._drawImageToCanvas(image, orientation);

        const scaleRatio = this._getScaleRatio(canvas.height, canvas.width, maxImageHeight, maxImageWidth);
        if (scaleRatio < 1) {
            /* eslint-disable-next-line require-atomic-updates */
            canvas = await this._downScaleCanvas(canvas, scaleRatio);
        }

        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.8);
        });
    }

    async _readFileToArrayBuffer(file) {
        return new Promise(resolve => {
            const fileReader = new FileReader();
            fileReader.onload = event => {
                resolve(event.target.result);
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    _readAndThenResetOrientation(arrayBuffer) {
        const dataView = new DataView(arrayBuffer);

        if (dataView.getUint16(0, false) !== START_JPEG_MARKER) {
            return null;
        }

        let byteOffset = 2;
        let currentMarker = null;
        let orientation = null;

        while (byteOffset < dataView.byteLength) {
            currentMarker = dataView.getUint16(byteOffset, false);
            byteOffset += 2;

            if ((currentMarker & START_JFIF_MARKER) !== START_JFIF_MARKER) {
                break;
            }

            if (currentMarker === EXIF_HEADER) {
                byteOffset += 2;

                if (dataView.getUint32(byteOffset, false) !== START_EXIF_MARKER) {
                    break;
                }
                byteOffset += 6;

                const littleEndian = dataView.getUint16(byteOffset, false) === INTEL_FORMAT_MARKER;
                byteOffset += dataView.getUint32(byteOffset + 4, littleEndian);

                const exifTags = dataView.getUint16(byteOffset, littleEndian);
                byteOffset += 2;

                for (let i = 0; i < exifTags; i++) {
                    if (dataView.getUint16(byteOffset + (i * 12), littleEndian) === EXIF_ORIENTATION_MARKER) {
                        orientation = dataView.getUint16(byteOffset + (i * 12) + 8, littleEndian);
                        dataView.setUint16(byteOffset + (i * 12) + 8, littleEndian, 0); // need for avoid browser rotation;
                        return orientation;
                    }
                }
            }

            byteOffset += dataView.getUint16(byteOffset, false);
        }

        return null;
    }

    _loadImage(arrayBuffer, type) {
        return new Promise(resolve => {
            const blob = new Blob([arrayBuffer],{type});
            const image = new Image();

            image.onload = () => {
                resolve(image);
            };

            image.src = URL.createObjectURL(blob);
        });
    }

    _drawImageToCanvas(image, orientation = null) {
        const sourceWidth = image.width;
        const sourceHeight = image.height;
        const canvas = document.createElement('canvas');

        if (orientation !== null && [ROTATE_90_FLIP_X, ROTATE_90, ROTATE_270_FLIP_X, ROTATE_270].indexOf(orientation) > -1) {
            canvas.width = sourceHeight;
            canvas.height = sourceWidth;
        } else {
            canvas.width = sourceWidth;
            canvas.height = sourceHeight;
        }

        switch (orientation) {
            case FLIP_X:
                canvas.getContext('2d').transform(-1, 0, 0, 1, sourceWidth, 0);
                break;
            case ROTATE_180:
                canvas.getContext('2d').transform(-1, 0, 0, -1, sourceWidth, sourceHeight);
                break;
            case ROTATE_180_FLIP_X:
                canvas.getContext('2d').transform(1, 0, 0, -1, 0, sourceHeight);
                break;
            case ROTATE_90_FLIP_X:
                canvas.getContext('2d').transform(0, 1, 1, 0, 0, 0);
                break;
            case ROTATE_90:
                canvas.getContext('2d').transform(0, 1, -1, 0, sourceHeight, 0);
                break;
            case ROTATE_270_FLIP_X:
                canvas.getContext('2d').transform(0, -1, -1, 0, sourceHeight, sourceWidth);
                break;
            case ROTATE_270:
                canvas.getContext('2d').transform(0, -1, 1, 0, 0, sourceWidth);
                break;
            default:
                canvas.getContext('2d').transform(1, 0, 0, 1, 0, 0);
        }

        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas;
    }

    _getScaleRatio(sourceHeight, sourceWidth, maxWidth, maxHeight) {
        return Math.min(
            (maxHeight || sourceHeight) / sourceHeight,
            (maxWidth || sourceWidth) / sourceWidth
        );
    }

    _downScaleCanvas(canvas, downscaleRation) {
        let sourceCanvas = canvas;
        let sourceWidth = sourceCanvas.width;
        let sourceHeight = sourceCanvas.height;

        let destinationCanvas = null;
        const destinationWidth = downscaleRation * sourceWidth;
        const destinationHeight = downscaleRation * sourceHeight;

        if (this._downsamplingRatio > 0 && this._downsamplingRatio < 1 && destinationWidth < sourceWidth && destinationHeight < sourceHeight) {
            while (sourceWidth * this._downsamplingRatio > destinationWidth) {
                destinationCanvas = document.createElement('canvas');
                destinationCanvas.width = sourceWidth * this._downsamplingRatio;
                destinationCanvas.height = sourceHeight * this._downsamplingRatio;

                destinationCanvas.getContext('2d').drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, 0, 0, destinationCanvas.width, destinationCanvas.height);

                sourceCanvas = destinationCanvas;
                sourceWidth = destinationCanvas.width;
                sourceHeight = destinationCanvas.height;
            }
        }

        destinationCanvas = document.createElement('canvas');
        destinationCanvas.width = destinationWidth;
        destinationCanvas.height = destinationHeight;

        destinationCanvas.getContext('2d').drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, 0, 0, destinationWidth, destinationHeight);

        return destinationCanvas;
    }
}

// Polyfill for IE/EDGE. Based on MDN implementation.
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            let canvas = this;
            setTimeout(function () {
                let binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
                    len = binStr.length,
                    arr = new Uint8Array(len);

                for (let i = 0; i < len; i++) {
                    arr[i] = binStr.charCodeAt(i);
                }
                callback(new Blob([arr], {type: type || 'image/png'}));
            });
        }
    });
}