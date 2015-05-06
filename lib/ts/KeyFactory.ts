/// <reference path='../../typings/tsd.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

export class KeyFactory {
	/**
	 * Create the key value for the clubs dataset
	 * @param {string} clubname - the club is the first part of the key
	 * @param {string} cityname - the city is the second part of the key
	 **/
	public static clubKeyMaker(clubname: string, cityname: string) : string {
        return "".concat(clubname, "~", cityname);
    }

	/**
	 * Create the key value for the squads dataset
	 * @param {string} clubname - the club is the first part of the key
	 * @param {string} cityname - the city is the second part of the key
	 * @param {string} squadname - the squad is the second part of the key
	 * @param {string} season - the season is the fourth part of the key
	 **/
	public static squadKeyMaker(clubname: string, cityname: string, squadname: string, season: string) : string {
		return this.clubKeyMaker(clubname, cityname).concat('~', squadname, '~', season);
	}
}