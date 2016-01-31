/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

import assert = require('assert');
import _ = require('underscore');
var errTo = require('errto');

export module Service {

	/*
	*  Implementation for Services for Squad Management like like creating squads for players to be added to
	*  @class
	**/
	export class ServiceBase {

		/**
		* Enacts a series of validations on parameter values
		* 
		* @param {any} parameters - consists of an array of parameter values, names and associated validations
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		**/
		protected validateParameters(parameters: any, callback: any) {
			var validationCalls = this.flattenValidationCalls(parameters);
			var validationCallsLength = validationCalls.length;
			if (validationCallsLength === 0) return callback();
			if (validationCallsLength === 1) {
				validationCalls[0].validator(validationCalls[0].fieldcontent, validationCalls[0].fieldname, errTo(callback, callback), validationCalls[0].message);
			} else {
				// obtaining a reference to the function to enable recursive processing in javascript
				var process = this.processFlattenedValidationCalls;
				process(validationCalls, 0, validationCallsLength, process, errTo(callback, callback));
			}
		}

		/**
		* Called from validateParameters to process a list of parameters and validate their values.  Is called recursively to process values
		* and work in with errTo and callback processing
		* 
		* @param {any} validationCalls - this is a more function friendly representation of the parameters to process with the functions repeated for 
		* 		each parameter.
		* @param {number} processed - processed number of parameters. Gets incremented after each sucessful validation
		* @param {number} totalValidations - the total number of validations to process and compared with processed to check for end state
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		**/
		private processFlattenedValidationCalls(validationCalls: any, processed: number, totalValidations: number, process: any, callback: any) {
			if (processed === totalValidations) return callback();
			var parameter: any;
			parameter = validationCalls[processed];
			parameter.validator(parameter.content, parameter.name, errTo(callback, function() {
				process(validationCalls, processed + 1, totalValidations, process, errTo(callback, callback));
			}), parameter.message);
		}

		/**
		* Called from validateParameters to flatten the list of parameters so that the array is a simple linear list of parameter names, content
		* 	and validations.  This makes the processing of the validations easier for processFlattenedValidationCalls
		* 
		* @param {any} parameters - consists of an array of parameter values, names and associated validations
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		* @returns {any} a flattened array of parameter names, content and validation - names and content will be repeated if there are multiple validations for
		* 	the same parameter name/content pair.
		**/
		private flattenValidationCalls(parameters: any) {
			var calls = [];
			var parameterslength = parameters.length;
			var validationslength: number;
			var i: number;
			var j: number;
			var parameter: any;
			var validation: any;
			for (i = 0; i < parameterslength; i = i + 1) {
				parameter = parameters[i];
				validationslength = parameter.validations.length;
				for (j = 0; j < validationslength; j = j + 1) {
					validation = parameter.validations[j];
					if (validation.v !== undefined) {
						calls.push({ name: parameter.name, content: parameter.content, validator: validation.v, message: validation.m });
					} else {
						calls.push({ name: parameter.name, content: parameter.content, validator: validation, message: undefined });
					}
				}
			}
			return calls;
		}
		
		/**
		 * Checks for null or empty strings
		 * @param {string} parametervalue - the value to check
		 * @param {string} parametername - the name of the value to check
		 * @param {callback} callback - will get called with the error if it exists
		 **/
	    protected checkNotNullOrEmpty(parametervalue: string, parametername: string, callback: any, invalidMessage?: string) {
	    	if (parametervalue === undefined || parametervalue === null || parametervalue.trim().length === 0) {
	    		return callback(new Error('The argument ' + parametername + ' is a required argument'));
	    	}
	    	callback();
	    }
	    
	    /**
	     * Check validity of an email address
	     * @param {string} email - the address to check
	     * @param {string} invalidMessage - a message to include in an Error when email address is invalid
	     * @param {callback} callback - notification of an error in an email address
	     **/
	    protected checkEmailAddress(email: string, parametername: string, callback: any, invalidMessage?: string) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if (!re.test(email)) {
    			return callback(new Error(invalidMessage));
    		}
    		callback();
	    }

	}
}