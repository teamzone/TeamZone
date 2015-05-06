/// <reference path='../../typings/tsd.d.ts' />

/*
*  Services for Squad Management like creating squads and managing players within squads
*  @interface
**/
export interface ISquadManagementService {
    CreateSquad(clubname: string, cityname: string, squadname: string, season: string, agelimit: string, admin: string, callback: any);
    AddPlayerToSquad(clubname: string, cityname: string, squadname: string, season: string, playeremail: string, callback: any, targetyear?: number);
    GetPlayersForSquad(clubname: string, cityname: string, squadname: string, season: string, callback: any);
    GetPlayersForClubNotInSquad(clubname: string, cityname: string, squadname: string, season: string, callback: any);
}