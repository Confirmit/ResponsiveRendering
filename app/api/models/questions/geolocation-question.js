import Question from './../base/question.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {Question}
 */
export default class GeolocationQuestion extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model){
        super(model);

        this._loadInitialState(model);
    }

    /**
     * String representation of geolocation: (lat long)
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * Set geolocation coordinates
     * @param {numeric} lat - Latitude.
     * @param {numeric} long - Longitude.
     * @example model.setValue(37.3229978, -122.0321823);
     */
    setValue(lat, long) {
        this._value = lat + " " + long;
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        let form = {};
        if(!Utils.isEmpty(this.value)){
            form[this.id] = this.value;
        }

        return form;
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Geolocation:
                return this._validateCoordinates();
        }
    }

    _loadInitialState(model) {
        this._value = model.value;
    }

    _validateCoordinates() {
        if (Utils.isEmpty(this.value)) {
            return new RuleValidationResult(true);
        }

        let [lat, long] = this._value.split(' ');
        let isValid = lat >= -90 && lat <= 90 && long >= -180 && long <= 180;
        return new RuleValidationResult(isValid);
    }

}
