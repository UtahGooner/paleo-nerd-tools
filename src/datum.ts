export type DatumID = 'wgs84'|'nad83'|'grs80'|'wgs72'|'aust1965'|'krasovsky1940'|'na1927'|'intl1924'|'hayford1909'|'clarke1880'|'clarke1866'|'airy1830'|'bessel1841'|'everest1830';
export interface DatumRecord {
    eqrad: number,
    flat: number,
}

export type DatumList = {
    [key in DatumID]: DatumRecord;
};

export const DatumInfo:DatumList = {
    wgs84         : { eqrad : 6378137.0, flat : 298.2572236 },
    nad83         : { eqrad : 6378137.0, flat : 298.2572236 },
    grs80         : { eqrad : 6378137.0, flat : 298.2572215 },
    wgs72         : { eqrad : 6378135.0, flat : 298.2597208 },
    aust1965      : { eqrad : 6378160.0, flat : 298.2497323 },
    krasovsky1940 : { eqrad : 6378245.0, flat : 298.2997381 },
    na1927        : { eqrad : 6378206.4, flat : 294.9786982 },
    intl1924      : { eqrad : 6378388.0, flat : 296.9993621 },
    hayford1909   : { eqrad : 6378388.0, flat : 296.9993621 },
    clarke1880    : { eqrad : 6378249.1, flat : 293.4660167 },
    clarke1866    : { eqrad : 6378206.4, flat : 294.9786982 },
    airy1830      : { eqrad : 6377563.4, flat : 299.3247788 },
    bessel1841    : { eqrad : 6377397.2, flat : 299.1527052 },
    everest1830   : { eqrad : 6377276.3, flat : 300.8021499 }
};
