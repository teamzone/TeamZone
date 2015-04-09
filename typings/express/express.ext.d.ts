/// <reference path="../express-session/express-session.d.ts" />
/// <reference path='../express-validator/express-validator.d.ts' />

/*
* Merge declarations so typescript can compile correctly
*/
declare module Express {
    export interface Session {
        authenticated: boolean;
        user: { email: string };
    }
    
    export interface Request {
        checkBody(field:string, message:string): any;
        validationErrors() : any;
    }
}