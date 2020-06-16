export default class ImageProcessor {
    constructor() {
        this._downsamplingRatio = 0.5;
    }

    async process(file, maxImageWidth, maxImageHeight) {
        let canvas = await this._drawToCanvas(file);

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

    async _getOrientation(file) {
        const buffer = await this._readFileToArrayBuffer(file);
        const dataView = new DataView(buffer);

        if (dataView.getUint16(0, false) !== 0xFFD8) {
            return null;
        }

        let offset = 2;
        let marker = null;
        let little = null;
        let tags = null;

        while (offset < dataView.byteLength) {
            marker = dataView.getUint16(offset, false);
            offset += 2;

            if (marker === 0xFFE1) {
                if (dataView.getUint32(offset += 2, false) !== 0x45786966) {
                    break;
                }

                little = dataView.getUint16(offset += 6, false) === 0x4949;
                offset += dataView.getUint32(offset + 4, little);

                tags = dataView.getUint16(offset, little);
                offset += 2;

                for (let i = 0; i < tags; i++) {
                    if (dataView.getUint16(offset + (i * 12), little) === 0x0112) {
                        return dataView.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            }
            else if ((marker & 0xFF00) !== 0xFF00) {
                break;
            } else {
                offset += dataView.getUint16(offset, false);
            }
        }

        return null;
    }

    async _loadImage(file) {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.src = URL.createObjectURL(file);
        });
    }

    async _drawToCanvas(file) {
        const orientation = await this._getOrientation(file);
        const image = await this._loadImage(file);

        const sourceWidth = image.width;
        const sourceHeight = image.height;
        const canvas = document.createElement('canvas');

        if (orientation !== null && [5, 6, 7, 8].indexOf(orientation) > -1) {
            canvas.width = sourceHeight;
            canvas.height = sourceWidth;
        } else {
            canvas.width = sourceWidth;
            canvas.height = sourceHeight;
        }

        switch (orientation) {
            case 2:
                canvas.getContext("2d").transform(-1, 0, 0, 1, sourceWidth, 0);
                break;
            case 3:
                canvas.getContext("2d").transform(-1, 0, 0, -1, sourceWidth, sourceHeight);
                break;
            case 4:
                canvas.getContext("2d").transform(1, 0, 0, -1, 0, sourceHeight);
                break;
            case 5:
                canvas.getContext("2d").transform(0, 1, 1, 0, 0, 0);
                break;
            case 6:
                canvas.getContext("2d").transform(0, 1, -1, 0, sourceHeight, 0);
                break;
            case 7:
                canvas.getContext("2d").transform(0, -1, -1, 0, sourceHeight, sourceWidth);
                break;
            case 8:
                canvas.getContext("2d").transform(0, -1, 1, 0, 0, sourceWidth);
                break;
            default:
                canvas.getContext("2d").transform(1, 0, 0, 1, 0, 0);
        }

        canvas.getContext("2d").drawImage(image, 0, 0);
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
            setTimeout(function() {
                let binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
                    len = binStr.length,
                    arr = new Uint8Array(len);

                for (let i = 0; i < len; i++ ) {
                    arr[i] = binStr.charCodeAt(i);
                }
                callback( new Blob( [arr], {type: type || 'image/png'} ) );
            });
        }
    });
}