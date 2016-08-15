/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express/express.ext.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';
/*
*  Handles web requests for the dashboard view
*  @class
**/
var Dashboard = (function () {
    function Dashboard() {
        /**
        * not needed
        * @constructor
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.post = function (req, res) {
        };
        /**
        * Renders the dashboard view
        * @constructor
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.get = function (req, res) {
            res.render('dashboard', { user: req.session.user });
        };
    }
    return Dashboard;
}());
exports.Dashboard = Dashboard;
module.exports = Dashboard;
//# sourceMappingURL=dashboard.js.map