/**
 * @private
 * @desc Class contains helper functions.
 */
export default class Utils {
    /**
     * Check for undefined or empty string.
     * @param {string} value The value to be tested.
     * @return {boolean}
     */
    static isEmpty(value){
        return value === undefined || value === null || value === '';
    }

    /**
     * isEmpty or isNaN.
     * @param {string} value The value to be tested.
     * @return {boolean} true if the given value is NotNumber; otherwise, false.
     */
    static isNotANumber(value){
        return this.isEmpty(value) || isNaN(value);
    }

    /**
     * Convert to number if possible.
     * @param {string} value The value to be converted to number.
     * @return {(Number|null)}
     */
    static toNumber(value){
        return this.isNotANumber(value)? null: Number(value);
    }

    /**
     * Calculate number of fractional and decimal digits.
     * @param {string} number
     * @return {object}
     */
    static measureNumber(number) {
        let [fractionalDigits, decimalDigits = 0] = Math.abs(number).toString().split('.').map(s => s.length);
        return {fractionalDigits, decimalDigits, totalDigits: fractionalDigits + decimalDigits};
    }

	/**
	 * Check that value is a valid date.
	 * @param {string} value The value to be tested.
     * @returns {boolean}  true if the given value is Date; otherwise, false.
     */
    static isDate(value) {
        if (this.isEmpty(value))
            return false;

        let rx = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!rx.test(value))
            return false;

        let date = new Date(value);
        if(isNaN(date))
            return false;

        let parsed = date.toISOString().slice(0, 10); // check for February 31 etc
        return parsed === value;
    }
}
