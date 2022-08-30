sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel"
], function (ODataModel) {
	"use strict";

	var oDataModel = new ODataModel({
		serviceUrl: "/sap/opu/odata/sap/ZPOA_AUTH_ESC_MATRIX_PROJ_SRV/",
		defaultUpdateMethod: "PUT",
		 useBatch: false
	});

	return {
	
		get: function (sEndpoint,oParam){
			if (oParam) {
				var urlParameters = {
					$expand: oParam.expand || "",
					$filter: oParam.filter || ""
				};			
			}
			
			return new Promise(function (resolve, reject){
				oDataModel.read(sEndpoint, {
					urlParameters: urlParameters, 
					success: function (result) {
						resolve(result);
					},
					error: function (err) {
						reject(err);
					} 
				});	
			});
		},
        create: function (data) {
            var dataToSend = {
                "Role": data.role,
                "RoleDescription": data.roleDescription,
                "MaximumAmount": data.amount,
                "Currency": data.currency
            };
            var endpoint = "/Z_I_POARole";
            return new Promise(function (resolve, reject) {
                oDataModel.create(endpoint, dataToSend, {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (err) {
                        reject(err);
                    } 
                });	
            });
        },
        post: function (oData) {
            var aChildData=[];
            oData.forEach(function(obj){
                aChildData.push({
                    "Costobject" : obj.Costobject,
                    "Project" : obj.Project,
                    "Budgetpack" : obj.Budgetpack,
                    "Esicode" : obj.Esicode,
                    "Costcontroller" : obj.Costcontroller,
                    "Level1role" : obj.Level1role,
                    "Level2role" : obj.Level2role,
                    "Level3role" : obj.Level3role,
                    "Level4role":  obj.Level4role,
                    "Level5role":  obj.Level5role,
                    "Authorizationtype":  obj.Authorizationtype

                })

            })
            var dataToSend = {
                "MatrixHDToMatrixNav": aChildData || [],
                "Comment": "",
                "Requester": ""
            };
            var endpoint = "/POAAuthEscMatrixCostHDSet";
            return new Promise(function (resolve, reject) {
                oDataModel.create(endpoint, dataToSend, {
                    success: function (result) {
                        resolve(result);
                    },
                    error: function (err) {
                        reject(err);
                    } 
                });	
            });
        }

	};
});