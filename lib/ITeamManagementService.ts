/// <reference path='../typings/tsd.d.ts' />

/*
*  Services for Team Management like creating teams and managing players within teams
*  @interface
**/
export interface ITeamManagementService {
    CreateClub(clubname: string, fieldname: string, suburbname: string, cityname: string, adminemail: string, callback: any);
}