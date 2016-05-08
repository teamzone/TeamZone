'use strict';

var authenticationMiddleware = require('./utils/authenticationMiddleware');
var noCacheMiddleware = require('./utils/noCacheMiddleware');

var RouteConfig = function(application) {
  this.application = application;
};

var registerRoutes = function() {
  var config = loadRouteConfig();

  var routesLength = config.routes.length;

  for(var i = 0; i < routesLength; i++) {
    var routeItem = config.routes[i];

    var Controller = loadController(routeItem);
    var route = getRoute(routeItem);
    var method = getMethod(routeItem);
    var requiresAuth = getRequiresAuth(routeItem);

    registerRoute(this.application, Controller, route, method, requiresAuth);
  }
};

var loadRouteConfig = function() {
  var config;

  try {
    config = require('./route.config.json');

    if(!config.routes || config.routes.length === 0) {
      throw '"routes" not defined';
    }
  }
  catch(e) {
    throw 'Unable to parse "route.config.json": ' + e;
  }

  return config;
};

var loadController = function(routeItem) {
  var Controller;

  if(!routeItem || !routeItem.controller) {
    throw 'Undefined "controller" property in "route.config.json"';
  }

  try {
    Controller = require(routeItem.controller);
  }
  catch(e) {
    throw 'Unable to load ' + routeItem.controller + ": " + e;
  }

  return Controller;
};

var getRoute = function(routeItem) {
  if(!routeItem || !routeItem.route || routeItem.route.length === 0) {
    throw 'Undefined or empty "route" property in "route.config.json"';
  }

  return routeItem.route;
};

var getMethod = function(routeItem) {
  if(!routeItem || !routeItem.method || routeItem.method.length === 0) {
    throw 'Undefined or empty "method" property in "route.config.json"';
  }

  var method = routeItem.method.toLowerCase();

  switch(method) {
    case 'get':
    case 'put':
    case 'post':
    case 'delete':
      return method;
    default:
      throw 'Invalid REST "method" property in "route.config.json": ' + method;
  }
};

var getRequiresAuth = function(routeItem) {
    var requiresAuth = routeItem.requireAuthenticated;
    
    if(requiresAuth == null) {
      requiresAuth = true; // Default to true.
    }
    
    return requiresAuth;
}

var registerRoute = function(application, Controller, route, method, requiresAuth) {
  console.log("Registering route: " + route + " with method: " + method + " with requiresAuth = " + requiresAuth);
  if(requiresAuth) {
    application.route(route)[method](noCacheMiddleware, authenticationMiddleware, invokeController);
  } else {
    application.route(route)[method](invokeController);
  }
  
  function invokeController(req, res, next) {
    console.log('invoking controller: ' + Controller);
    var controller = req.dependencyInjector.get(Controller);
    controller[method](req, res, next);
  }
};

RouteConfig.prototype = {
  registerRoutes: registerRoutes
};

module.exports = RouteConfig;