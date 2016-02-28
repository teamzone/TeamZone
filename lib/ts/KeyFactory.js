/// <reference path='../../typings/tsd.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';
var KeyFactory = (function () {
    function KeyFactory() {
    }
    /**
     * Create the key value for the clubs dataset
     * @param {string} clubname - the club is the first part of the key
     * @param {string} cityname - the city is the second part of the key
     **/
    KeyFactory.clubKeyMaker = function (clubname, cityname) {
        return "".concat(clubname, "~", cityname);
    };
    /**
     * Create the key value for the squads dataset
     * @param {string} clubname - the club is the first part of the key
     * @param {string} cityname - the city is the second part of the key
     * @param {string} squadname - the squad is the second part of the key
     * @param {string} season - the season is the fourth part of the key
     **/
    KeyFactory.squadKeyMaker = function (clubname, cityname, squadname, season) {
        return this.clubKeyMaker(clubname, cityname).concat('~', squadname, '~', season);
    };
    return KeyFactory;
})();
exports.KeyFactory = KeyFactory;
//# sourceMappingURL=KeyFactory.js.map