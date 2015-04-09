/// <reference path='../../typings/tsd.d.ts' />

/*
*  Services for User Management like registering and logging in users
*  @interface
**/
export interface IUserManagementService {
  LoginUser(email: string, password: string, callback: any);
  RegisterUser(email: string, password: string, callback: any);
  ConfirmRegisterUser(email: string, token: string, callback);
}
	