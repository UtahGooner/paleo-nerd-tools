import {UTMCoords} from "./coord-systems";




/**
 * Convert decimal degrees to degrees, minutes, seconds
 */
function degToDMS(value):string {
    const degrees = Math.floor(value);
    const minutes = (value - degrees) * 60;
    const seconds = (minutes - Math.floor(minutes)) * 60;
    return degrees + ' ' + Math.floor(minutes) + "' " + seconds.toFixed(2) + '"';
}

function toNumber(str:string):number {
    return Number(String(str).trim());
}

/**
 * Convert UTM Zone, Easting & Northing to degrees (wgs84)
 */
function convertToDMS(zone:number, easting:number, northing:number):string {
    return new UTMCoords(zone, easting, northing)
        .toDegCoords('wgs84')
        .toString();
}


