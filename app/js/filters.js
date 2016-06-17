'use strict';

(function (window, angular) {

    var imFilters = angular.module('imFilters', []);

    imFilters.filter('weight', function () {
        return function (w, unit) {
            if (isNaN(w) || w < 0) {
                return w;
            } else {
                if (unit === undefined) unit = 'g';
                return w + unit;
            }
        }
    });

    imFilters.filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });

    /**
     * Build our own custom currency filter supports the ability to choose what side the currency symbol goes on.
     * For our custom filter, we will allow the user to pass two parameters.
     * The first will be the symbol or string they want to use to denote the currency,
     * and second a true or false boolean value that will determine whether the symbol is added before or after the amount.
     *
     * Usage: {{ 25 | customCurrency:'$':false }}
     */
    imFilters.filter('customCurrency', function () {

        // Create the return function and set the required parameter name to **input**
        // setup optional parameters for the currency symbol and location (left or right of the amount)
        return function (input, symbol, place) {

            // Ensure that we are working with a number
            if (isNaN(input)) {
                return input;
            } else {

                // Check if optional parameters are passed, if not, use the defaults
                symbol = symbol || '$';
                place = place === undefined ? true : place;

                // Perform the operation to set the symbol in the right location
                if (place === true) {
                    return symbol + input;
                } else {
                    return input + symbol;
                }
            }
        }
    });

})(window, window.angular);
