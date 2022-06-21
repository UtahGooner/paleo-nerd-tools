import {UTMCoords} from "./coord-systems";


/**
 * @var {number} fractionDigits - used to determine the number of digits used it
 */
const fractionDigits:number = 3;

/**
 * Converts UTM Zone, Easting, Northing to degrees (wgs84) and returns the latitude
 *      rounded to value of fractionDigits (defiend above)
 * @param {number} zone
 * @param {number} easting
 * @param {number} northing
 * @return {string|string|*}
 */
function convertToLatitude(zone, easting, northing) {
    const location = new UTMCoords(zone, easting, northing);
    // if rounding is not desired, uncomment the following line
    // return location.toDegCoords('wgs84').toLatitude();

    return location.toDegCoords('wgs84').toLatitude().toFixed(fractionDigits);
}

/**
 * Converts UTM Zone, Easting, Northing to degrees (wgs84) and returns the longitude
 *      rounded to value of fractionDigits (defiend above)
 * @param {number} zone
 * @param {number} easting
 * @param {number} northing
 * @return {string|string|*}
 */
function convertToLongitude(zone, easting, northing) {
    const location = new UTMCoords(zone, easting, northing);
    // if rounding is not desired, uncomment the following line
    // return location.toDegCoords('wgs84').toLongitude();

    return location.toDegCoords('wgs84').toLongitude().toFixed(fractionDigits);
}
