/// <reference path="../express-session/express-session.d.ts" />

declare module Express {
    export interface Session {
        authenticated: boolean;
        user: { email: string };
    }
}