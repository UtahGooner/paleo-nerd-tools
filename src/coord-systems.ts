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
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Typescript rewrite
 * @author Steve Montgomery https://github.com/UtahGooner
 */


import {DatumID, DatumInfo} from "./datum";

export type LatitudeDirection = 'N' | 'S' | 'n' | 's';
export type LongitudeDirection = 'E' | 'W' | 'e' | 'w';

export class UTMCoords {
    zone: number;
    easting: number;
    northing: number;

    constructor(zone: number, easting: number, northing: number) {
        this.zone = zone;
        this.easting = easting;
        this.northing = northing;
    }

    toString(): string {
        return `Zone ${this.zone} Easting ${this.easting} Northing ${this.northing}`;
    }

    toDegMinCoords(datum: DatumID): DegMinCoords {
        return this.toDegCoords(datum).toDegMinCoords();
    };

    toDegCoords(datum: DatumID = 'wgs84'): DegCoords {
        // Convert UTM coords to Deg coords. If datum is unspecified,
        // default to wgs84.

        datum = datum || "wgs84";
        if (!DatumInfo[datum]) {
            throw new Error('Invalid datum');
        }

        const eqrad = DatumInfo[datum].eqrad;//equatorial radius, meters.
        const flat = 1 / DatumInfo[datum].flat;//polar flattening.

        const drad = Math.PI / 180;//Convert degrees to radians)
        const k0 = 0.9996;//scale on central meridian
        const polarAxis = eqrad * (1 - flat);//polar axis.
        const eccentricity = Math.sqrt(1 - (polarAxis / eqrad) * (polarAxis / eqrad));//eccentricity
        // var e0 = e/Math.sqrt(1 - e*e);//Called e prime in reference
        const esq = (1 - (polarAxis / eqrad) * (polarAxis / eqrad));//e squared for use in expansions
        const e0sq = eccentricity * eccentricity / (1 - eccentricity * eccentricity);// e0 squared - always even powers

        const easting = this.easting;
        const northing = this.northing;

        const zcm = 3 + 6 * (this.zone - 1) - 180;//Central meridian of zone
        const e1 = (1 - Math.sqrt(1 - eccentricity * eccentricity)) / (1 + Math.sqrt(1 - eccentricity * eccentricity));//Called e1 in USGS PP 1395 also
        const M0 = 0;//In case origin other than zero lat - not needed for standard UTM
        const M = M0 + northing / k0;//Arc length along standard meridian.

        const mu = M / (eqrad * (1 - esq * (1 / 4 + esq * (3 / 64 + 5 * esq / 256))));
        let phi1 = mu + e1 * (3 / 2 - 27 * e1 * e1 / 32) * Math.sin(2 * mu) + e1 * e1 * (21 / 16 - 55 * e1 * e1 / 32) * Math.sin(4 * mu);//Footprint Latitude
        phi1 = phi1 + e1 * e1 * e1 * (Math.sin(6 * mu) * 151 / 96 + e1 * Math.sin(8 * mu) * 1097 / 512);
        const C1 = e0sq * Math.pow(Math.cos(phi1), 2);
        const T1 = Math.pow(Math.tan(phi1), 2);
        const N1 = eqrad / Math.sqrt(1 - Math.pow(eccentricity * Math.sin(phi1), 2));
        const R1 = N1 * (1 - eccentricity * eccentricity) / (1 - Math.pow(eccentricity * Math.sin(phi1), 2));

        const D = (easting - 500000) / (N1 * k0);
        let phi: number;
        phi = (D * D) * (1 / 2 - D * D * (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e0sq) / 24);
        phi = phi + Math.pow(D, 6) * (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e0sq - 3 * C1 * C1) / 720;
        phi = phi1 - (N1 * Math.tan(phi1) / R1) * phi;

        const lng = D * (1 + D * D * ((-1 - 2 * T1 - C1) / 6 + D * D * (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e0sq + 24 * T1 * T1) / 120)) / Math.cos(phi1);
        const lngd = zcm + lng / drad;

        return new DegCoords(phi / drad, lngd, datum);
    };
}

export class DegCoords {
    latitude: number;
    longitude: number;
    datum: DatumID = 'wgs84';

    constructor(latitude: number, longitude: number, datum: DatumID = 'wgs84') {
        this.latitude = latitude;
        this.longitude = longitude;
        this.datum = datum || "wgs84";
    }

    calcUTMZone(): number {
        // Calculate utm zone.
        return 1 + Math.floor((this.longitude + 180) / 6);
    }

    toLatitude():number {
        return this.latitude || 0;
    }

    toLongitude():number {
        return this.longitude || 0;
    }

    toString(): string {
        return `${this.latitude}, ${this.longitude}`;
    }

    toUTMCoords(utmZone?: number): UTMCoords {
        const eqrad = DatumInfo[this.datum].eqrad;//equatorial radius, meters.
        const flat = 1 / DatumInfo[this.datum].flat;//polar flattening.

        const drad = Math.PI / 180;//Convert degrees to radians)
        const k0 = 0.9996;//scale on central meridian
        const polarAxis = eqrad * (1 - flat);//polar axis.
        const eccentricity = Math.sqrt(1 - (polarAxis / eqrad) * (polarAxis / eqrad));//eccentricity

        const phi = this.latitude * drad;//Convert latitude to radians
        // var lng = lngd*drad;//Convert longitude to radians

        utmZone = utmZone || this.calcUTMZone();

        const zcm = 3 + 6 * (utmZone - 1) - 180;//Central meridian of zone
        // var e0 = e/Math.sqrt(1 - e*e);//Called e prime in reference
        const esq = (1 - (polarAxis / eqrad) * (polarAxis / eqrad));//e squared for use in expansions
        const e0sq = eccentricity * eccentricity / (1 - eccentricity * eccentricity);// e0 squared - always even powers

        const N = eqrad / Math.sqrt(1 - Math.pow(eccentricity * Math.sin(phi), 2));
        const T = Math.pow(Math.tan(phi), 2);
        const C = e0sq * Math.pow(Math.cos(phi), 2);
        const A = (this.longitude - zcm) * drad * Math.cos(phi);

        let M: number;
        M = phi * (1 - esq * (1 / 4 + esq * (3 / 64 + 5 * esq / 256)));
        M = M - Math.sin(2 * phi) * (esq * (3 / 8 + esq * (3 / 32 + 45 * esq / 1024)));
        M = M + Math.sin(4 * phi) * (esq * esq * (15 / 256 + esq * 45 / 1024));
        M = M - Math.sin(6 * phi) * (esq * esq * esq * (35 / 3072));
        M = M * eqrad;//Arc length along standard meridian

        const M0 = 0;//M0 is M for some origin latitude other than zero. Not needed for standard UTM

        let easting = k0 * N * A * (1 + A * A * ((1 - T + C) / 6 + A * A * (5 - 18 * T + T * T + 72 * C - 58 * e0sq) / 120));//Easting relative to CM
        easting = easting + 500000; //Easting standard
        let northing = k0 * (M - M0 + N * Math.tan(phi) * (A * A * (1 / 2 + A * A * ((5 - T + 9 * C + 4 * C * C) / 24 + A * A * (61 - 58 * T + T * T + 600 * C - 330 * e0sq) / 720))));//Northing from equator
        // var yg = y + 10000000;//yg = y global, from S. Pole

        // Let negative values stand for southern hemisphere.
        //if (y < 0){y = 10000000+y;}

        return new UTMCoords(utmZone, easting, northing);
    }

    toDegMinCoords(): DegMinCoords {
        // Convert degree format to degree and minutes format.

        let latitude = this.latitude;
        let longitude = this.longitude;

        let latitudeDirection: LatitudeDirection = "N";
        if (latitude < 0) {
            latitudeDirection = "S";
            latitude = -latitude;
        }
        const latitudeDegrees = Math.floor(latitude);
        const latitudeMinutes = 60.0 * (latitude - latitudeDegrees);

        let longitudeDirection: LongitudeDirection = "E";
        if (longitude < 0) {
            longitudeDirection = "W";
            longitude = -longitude;
        }
        const longitudeDegrees = Math.floor(longitude);
        const longitudeMinutes = 60.0 * (longitude - longitudeDegrees);

        return new DegMinCoords(latitudeDirection, latitudeDegrees, latitudeMinutes,
            longitudeDirection, longitudeDegrees, longitudeMinutes, this.datum);
    };
}

export class DegMinCoords {
    datum: DatumID = 'wgs84';
    latitudeDirection: LatitudeDirection;
    latitudeDegrees: number;
    latitudeMinutes: number;
    longitudeDirection: LongitudeDirection;
    longitudeDegrees: number;
    longitudeMinutes: number

    constructor(latitudeDirection: LatitudeDirection, latitudeDegrees: number, latitudeMinutes: number,
                longitudeDirection: LongitudeDirection, longitudeDegrees: number, longitudeMinutes: number,
                datum: DatumID) {
        this.datum = datum || "wgs84";
        this.latitudeDirection = latitudeDirection;
        this.latitudeDegrees = latitudeDegrees;
        this.latitudeMinutes = latitudeMinutes;
        this.longitudeDirection = longitudeDirection;
        this.longitudeDegrees = longitudeDegrees;
        this.longitudeMinutes = longitudeMinutes;
    }

    toUTMCoords(utmZone: number):UTMCoords {
        return this.toDegCoords().toUTMCoords(utmZone);
    };

    toDegCoords(): DegCoords {
        // Convert degree and minutes format to degree format.

        let latitude = this.latitudeDegrees + this.latitudeMinutes / 60.0;
        if ("S" === this.latitudeDirection.toUpperCase()) {
            latitude = -latitude;
        }
        let longitude = this.longitudeDegrees + this.longitudeMinutes / 60.0;
        if ("W" === this.longitudeDirection.toUpperCase()) {
            longitude = -longitude;
        }
        return new DegCoords(latitude, longitude, this.datum);
    };

    toString(): string {
        return `${this.latitudeDirection.toUpperCase()} ${this.latitudeDegrees} ${this.latitudeMinutes} ${this.longitudeDirection.toUpperCase()} ${this.longitudeDegrees} ${this.longitudeMinutes}`;
    };
}
