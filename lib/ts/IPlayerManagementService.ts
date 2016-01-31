/// <reference path='../../typings/tsd.d.ts' />

/*
*  Services for Player Management like adding and retrieving players for clubs
*  @interface
**/
export interface IPlayerManagementService {
    AddPlayer(clubname: string, cityname: string, firstname: string, surname: string, dob: string, address: string, 
              suburb: string, postcode: string, phone: string, email: string, callback: any);
    GetPlayer(clubname: string, cityname: string, email: string, callback: any);
}