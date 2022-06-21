/*
* JS functions for converting between UTM and geographic coordinates and
* vice versa.
*
* @author Po Shan Cheah http://mortonfox.com
*
* Based on http://www.uwgb.edu/dutchs/UsefulData/UTMFormulas.htm
* by Dr. Steve Dutch.
*
* This program is free software: you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or (at your
* option) any later version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
* FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
* License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
/*jslint vars: true, white: true */

/**
 * Adjust as necessary for desired rounding
 * @type {number} Used for rounding the latitude, longitude in DegCoords.toString(), 
 *                  convertToLatitude(), convertToLongitude() 
 */
var fractionDigits = 3;

var UTMConv = (function () {
    "use strict";

    var DatumInfo = {
        wgs84 : { eqrad : 6378137.0, flat : 298.2572236 },
        nad83 : { eqrad : 6378137.0, flat : 298.2572236 },
        grs80 : { eqrad : 6378137.0, flat : 298.2572215 },
        wgs72 : { eqrad : 6378135.0, flat : 298.2597208 },
        aust1965 : { eqrad : 6378160.0, flat : 298.2497323 },
        krasovsky1940 : { eqrad : 6378245.0, flat : 298.2997381 },
        na1927 : { eqrad : 6378206.4, flat : 294.9786982 },
        intl1924 : { eqrad : 6378388.0, flat : 296.9993621 },
        hayford1909 : { eqrad : 6378388.0, flat : 296.9993621 },
        clarke1880 : { eqrad : 6378249.1, flat : 293.4660167 },
        clarke1866 : { eqrad : 6378206.4, flat : 294.9786982 },
        airy1830 : { eqrad : 6377563.4, flat : 299.3247788 },
        bessel1841 : { eqrad : 6377397.2, flat : 299.1527052 },
        everest1830 : { eqrad : 6377276.3, flat : 300.8021499 }
    };

    /**
     * Returns a UTM Coordinates object
     * @param {number} utmz  - UTM Zone
     * @param {number} easting - Easting in meters
     * @param {number} northing - Northing in Meters
     * @constructor
     */
    function UTMCoords(utmz, easting, northing) {
        this.utmz = utmz;
        this.easting = easting;
        this.northing = northing;
    }

    
    UTMCoords.prototype.toString = function () {
        return "Zone " + this.utmz + " Easting " + this.easting + " Northing " + this.northing;
    };

    /**
     * Returns a Degree Coordinates object
     * @param {number} latd - Latitude in degrees
     * @param {number} lngd - Longitude in degrees
     * @param {string} [datum="wgs84"] - defaults to wgs84 
     * @constructor
     */
    function DegCoords(latd, lngd, datum) {
        this.latd = latd;
        this.lngd = lngd;
        this.datum = datum || "wgs84";
    }

    /**
     * Calculate the UTM Zone
     * @return {number}
     */
    DegCoords.prototype.calc_utmz = function () {
        return 1 + Math.floor((this.lngd + 180) / 6);
    };

    /**
     * Returns degree coordinates in dd.ddd, ddd.ddd, rounded as defined in fractionDigits above
     * @return {string}
     */
    DegCoords.prototype.toString = function () {
        // return this.latd + ", " + this.lngd;
        return this.latd.toFixed(fractionDigits) + ", " + this.lngd.toFixed(fractionDigits);
    };

    /**
     * Returns the latitude of a Degree Coordinate
     * @return {number}
     */
    DegCoords.prototype.toLatitude = function () {
        return this.latd;
    }

    /**
     * Returns the longitude of a Degree Coordinate
     * @return {number}
     */
    DegCoords.prototype.toLongitude = function () {
        return this.lngd;
    }

    /**
     * Converts Degree Coordinates to UTM Coordinates
     * @param {number} [utmz] - optional, calculated from longitude if undefined
     * @return {UTMCoords}
     */
    DegCoords.prototype.to_utm = function (utmz) {
        // Convert to UTM. If utmz is not supplied, calculate it during the
        // conversion.
        var a = DatumInfo[this.datum].eqrad;//equatorial radius, meters.
        var f = 1 / DatumInfo[this.datum].flat;//polar flattening.

        var drad = Math.PI/180;//Convert degrees to radians)
        var k0 = 0.9996;//scale on central meridian
        var b = a*(1-f);//polar axis.
        var e = Math.sqrt(1 - (b/a)*(b/a));//eccentricity

        var phi = this.latd*drad;//Convert latitude to radians
        // var lng = lngd*drad;//Convert longitude to radians

        utmz = utmz || this.calc_utmz();

        // var latz = 0;//Latitude zone: A-B S of -80, C-W -80 to +72, X 72-84, Y,Z N of 84
        // if (latd > -80 && latd < 72){latz = Math.floor((latd + 80)/8)+2;}
        // if (latd > 72 && latd < 84){latz = 21;}
        // if (latd > 84){latz = 23;}

        var zcm = 3 + 6*(utmz-1) - 180;//Central meridian of zone
        // var e0 = e/Math.sqrt(1 - e*e);//Called e prime in reference
        var esq = (1 - (b/a)*(b/a));//e squared for use in expansions
        var e0sq = e*e/(1-e*e);// e0 squared - always even powers

        var N = a/Math.sqrt(1-Math.pow(e*Math.sin(phi),2));
        var T = Math.pow(Math.tan(phi),2);
        var C = e0sq*Math.pow(Math.cos(phi),2);
        var A = (this.lngd-zcm)*drad*Math.cos(phi);

        var M = phi*(1 - esq*(1/4 + esq*(3/64 + 5*esq/256)));
        M = M - Math.sin(2*phi)*(esq*(3/8 + esq*(3/32 + 45*esq/1024)));
        M = M + Math.sin(4*phi)*(esq*esq*(15/256 + esq*45/1024));
        M = M - Math.sin(6*phi)*(esq*esq*esq*(35/3072));
        M = M*a;//Arc length along standard meridian

        var M0 = 0;//M0 is M for some origin latitude other than zero. Not needed for standard UTM

        var x = k0*N*A*(1 + A*A*((1-T+C)/6 + A*A*(5 - 18*T + T*T + 72*C -58*e0sq)/120));//Easting relative to CM
        x = x + 500000; //Easting standard
        var y = k0*(M - M0 + N*Math.tan(phi)*(A*A*(1/2 + A*A*((5 - T + 9*C + 4*C*C)/24 + A*A*(61 - 58*T + T*T + 600*C - 330*e0sq)/720))));//Northing from equator
        // var yg = y + 10000000;//yg = y global, from S. Pole

        // Let negative values stand for southern hemisphere.
        //if (y < 0){y = 10000000+y;}

        return new UTMCoords(utmz, x, y);
    };

    /**
     * Converts UTM Coordinates to Degrees, Minutes, Seconds
     * @param {string} [datum="wgs84"]
     * @return {DegMinCoords}
     */
    UTMCoords.prototype.to_degmin = function (datum) {
        return this.to_deg(datum).to_degmin();
    };

    /**
     * Convert UTM Coordinates to Degree coordinates
     * @param {string} [datum="wgs84"] - default to wgs84 if undefined
     * @return {DegCoords}
     */
    UTMCoords.prototype.to_deg = function (datum) {
        datum = datum || "wgs84";

        var a = DatumInfo[datum].eqrad;//equatorial radius, meters.
        var f = 1 / DatumInfo[datum].flat;//polar flattening.

        var drad = Math.PI/180;//Convert degrees to radians)
        var k0 = 0.9996;//scale on central meridian
        var b = a*(1-f);//polar axis.
        var e = Math.sqrt(1 - (b/a)*(b/a));//eccentricity
        // var e0 = e/Math.sqrt(1 - e*e);//Called e prime in reference
        var esq = (1 - (b/a)*(b/a));//e squared for use in expansions
        var e0sq = e*e/(1-e*e);// e0 squared - always even powers

        var x = this.easting;
        var y = this.northing;

        var zcm = 3 + 6*(this.utmz-1) - 180;//Central meridian of zone
        var e1 = (1 - Math.sqrt(1 - e*e))/(1 + Math.sqrt(1 - e*e));//Called e1 in USGS PP 1395 also
        var M0 = 0;//In case origin other than zero lat - not needed for standard UTM
        var M = M0 + y/k0;//Arc length along standard meridian.

        var mu = M/(a*(1 - esq*(1/4 + esq*(3/64 + 5*esq/256))));
        var phi1 = mu + e1*(3/2 - 27*e1*e1/32)*Math.sin(2*mu) + e1*e1*(21/16 -55*e1*e1/32)*Math.sin(4*mu);//Footprint Latitude
        phi1 = phi1 + e1*e1*e1*(Math.sin(6*mu)*151/96 + e1*Math.sin(8*mu)*1097/512);
        var C1 = e0sq*Math.pow(Math.cos(phi1),2);
        var T1 = Math.pow(Math.tan(phi1),2);
        var N1 = a/Math.sqrt(1-Math.pow(e*Math.sin(phi1),2));
        var R1 = N1*(1-e*e)/(1-Math.pow(e*Math.sin(phi1),2));

        var D = (x-500000)/(N1*k0);
        var phi = (D*D)*(1/2 - D*D*(5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e0sq)/24);
        phi = phi + Math.pow(D,6)*(61 + 90*T1 + 298*C1 + 45*T1*T1 -252*e0sq - 3*C1*C1)/720;
        phi = phi1 - (N1*Math.tan(phi1)/R1)*phi;

        var lng = D*(1 + D*D*((-1 -2*T1 -C1)/6 + D*D*(5 - 2*C1 + 28*T1 - 3*C1*C1 +8*e0sq + 24*T1*T1)/120))/Math.cos(phi1);
        var lngd = zcm+lng/drad;

        return new DegCoords(phi/drad, lngd, datum);
    };

    /**
     * 
     * @param {"N"|"S"} latdir - N or S
     * @param {number} latdeg
     * @param {number} latmin
     * @param {"E"|"W"} lngdir
     * @param {number} lngdeg
     * @param {number} lngmin
     * @param {string} [datum="wgs84"] 
     * @constructor
     */
    function DegMinCoords(latdir, latdeg, latmin, lngdir, lngdeg, lngmin, datum) {
        this.datum = datum || "wgs84";
        this.latdir = latdir;
        this.latdeg = latdeg;
        this.latmin = latmin;
        this.lngdir = lngdir;
        this.lngdeg = lngdeg;
        this.lngmin = lngmin;
    }

    /**
     * Convert degree format to degree and minutes format.
     * @return {DegMinCoords}
     */
    DegCoords.prototype.to_degmin = function () {
        var latd = this.latd;
        var lngd = this.lngd;

        var latdir = "N";
        if (latd < 0) {
            latdir = "S";
            latd = -latd;
        }
        var latdeg = Math.floor(latd);
        var latmin = 60.0 * (latd - latdeg);

        var lngdir = "E";
        if (lngd < 0) {
            lngdir = "W";
            lngd = -lngd;
        }
        var lngdeg = Math.floor(lngd);
        var lngmin = 60.0 * (lngd - lngdeg);

        return new DegMinCoords(latdir, latdeg, latmin, lngdir, lngdeg, lngmin, this.datum);
    };

    /**
     * 
     * @param {number} [utmz] - UTM Zone, calculated from longitude if undefined
     * @return {UTMCoords}
     */
    DegMinCoords.prototype.to_utm = function (utmz) {
        return this.to_deg().to_utm(utmz);
    };

    /**
     * Convert degree and minutes format to degree format.
     * @return {DegCoords}
     */
    DegMinCoords.prototype.to_deg = function () {
        var latd = this.latdeg + this.latmin / 60.0;
        if ("S" === this.latdir || "s" === this.latdir) {
            latd = -latd;
        }
        var lngd = this.lngdeg + this.lngmin / 60.0;
        if ("W" === this.lngdir || "w" === this.lngdir) {
            lngd = -lngd;
        }
        return new DegCoords(latd, lngd, this.datum);
    };

    DegMinCoords.prototype.toString = function () {
        return this.latdir + " " + this.latdeg + " " + this.latmin + " " + this.lngdir + " " + this.lngdeg + " " + this.lngmin;
    };

    return { UTMCoords : UTMCoords, DegCoords : DegCoords, DegMinCoords : DegMinCoords };
}());

/**
 * Convert decimal degrees to degrees, minutes, seconds
 * @param {number} value
 * @return {string}
 */
function degToDMS(value) {
    var degrees = Math.floor(value);
    var minutes = (value - degrees) * 60;
    var seconds = (minutes - Math.floor(minutes)) * 60;
    return degrees + ' ' + Math.floor(minutes) + "' " + seconds.toFixed(2) + '"';
}

/**
 * 
 * @param {string} str
 * @return {number}
 */
function toNumber(str) {
    return Number(String(str).trim());
}

/**
 * Convert UTM Zone, Easting & Northing to degrees (wgs84)
 * @param {number} zone
 * @param {number} easting
 * @param {number} northing
 * @return {string}
 */
function convertToDMS(zone, easting, northing) {
    var location = new UTMConv.UTMCoords(zone, easting, northing);
    return location.to_deg('wgs84').toString();
}

function test(zone, easting, northing) {
    return convertToDMS(zone, easting, northing).join('/');
}

/**
 * Converts UTM Zone, Easting, Northing to degrees (wgs84) and returns the latitude
 *      rounded to value of fractionDigits (defiend above)
 * @param {number} zone
 * @param {number} easting
 * @param {number} northing
 * @return {string|string|*}
 */
function convertToLatitude(zone, easting, northing) {
    var location = new UTMConv.UTMCoords(zone, easting, northing);
    // if rounding is not desired, uncomment the following line
    // return location.to_deg('wgs84').toLatitude();

    return location.to_deg('wgs84').toLatitude().toFixed(fractionDigits);
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
    var location = new UTMConv.UTMCoords(zone, easting, northing);
    // if rounding is not desired, uncomment the following line
    // return location.to_deg('wgs84').toLongitude();

    return location.to_deg('wgs84').toLongitude().toFixed(fractionDigits);
}
