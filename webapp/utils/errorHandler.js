sap.ui.define([
	"sap/ui/model/json/JSONModel"
	], function(JSONModel) {
	"use strict";

	return {
		extractErrorMsgFromDetails: function(sDetails) {
			var result;
			
			if (sDetails && sDetails.indexOf("{\"error\":") === 0) {
				var errorModel = new JSONModel();
				errorModel.setJSON(sDetails);
				
				result = errorModel.getProperty("/error/message/value" || "Error");
			}
			
			return result;
		},
		
		parseError: function(oError) {
			var params		= null;
			var response	= null;
			var error		= {};
			
			// "getParameters": for the case of catching oDataModel "requestFailed" event
			params			= oError.getParameters ? oError.getParameters() : null;
		
			// "params.response": V2 interface, response object is under the getParameters()
			// "params": V1 interface, response is directly in the getParameters()
			// "oError" for the case of catching request "onError" event
			response		= params ? (params.response || params) : oError;
			error.details	= response.responseText || response.body || (response.response && response.response.body) || ""; //"onError" Event: V1 uses response and response.body
			error.message	= this.extractErrorMsgFromDetails(error.details) || response.message || (params && params.message) || response;
			
			return error;
		}
	};
});