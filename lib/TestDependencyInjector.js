'use strict';

var testDependencyInjector = function(di, dependencyBinder) {
  this.di = di;
  this.dependencyBinder = dependencyBinder;
};

var initializeInjectors = function(testClass) {
  if(!testClass) {
    throw 'Express request object must be passed to initialize() and cannot be null or undefined';
  }

  if(!global.dependencyInjector) {
    var parentInjectorItems = this.dependencyBinder.parentInjectorItems();
    global.dependencyInjector = new this.di.Injector(parentInjectorItems);
  }

  var childInjectorItems = this.dependencyBinder.childInjectorItems();
  testClass.dependencyInjector = global.dependencyInjector.createChild(childInjectorItems);
};


testDependencyInjector.prototype = {
  initialize: initializeInjectors
};

module.exports = testDependencyInjector;