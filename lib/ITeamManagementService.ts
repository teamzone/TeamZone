/// <reference path='../typings/tsd.d.ts' />

/*
*  Services for Team Management like creating teams and managing players within teams
*  @interface
**/
export interface ITeamManagementService {
    CreateClub(clubname: string, fieldname: string, suburbname: string, cityname: string, adminemail: string, callback: any);
    CreateSquad(clubname: string, cityname: string, squadname: string, season: string, agelimit: string, admin: string, callback: any);
    AddPlayerToSquad(squadname: string, season: string, playeremail: string, callback: any);
}