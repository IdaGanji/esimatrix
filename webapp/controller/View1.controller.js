sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "zescesiproject/utils/service",
    "sap/m/MessageBox",
    "zescesiproject/utils/errorHandler",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Fragment,JSONModel,service,MessageBox,errorHandler,Filter,FilterOperator) {
        "use strict";

        return Controller.extend("zescesiproject.controller.View1", {
            onInit: function () {
                 this.initFilterModel();
                 this.initValueHelpModels();
            },
            initValueHelpModel: function(path,name){
                service.get(path).then(
                    function(oData) {
                         this.setJSONModel(oData, name);
                    }.bind(this)).then(undefined,
                    function(oError) {
                        this.showErrorMessage(oError);
                    }.bind(this));
            },
            initValueHelpModels: function(){
                this.initValueHelpModel("/ZIFI_ESIFIPROJECT_CODE","CodeValueHelpModel");
                this.initValueHelpModel("/ESIPROJECTVH","ProjectValueHelpModel");
                this.initValueHelpModel("/ZBudgetPackVH","BudgetPackValueHelpModel");
                this.initValueHelpModel("/Z_I_POARole","RoleValueHelpModel");
                this.initValueHelpModel("/ESIPprojectManagerVH","PMValueHelpModel");
            },
            setJSONModel: function (oData, sName) {
                var oModel = new JSONModel();
                oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                oModel.setData(oData);
                return this.getView().setModel(oModel, sName);
            },
            showErrorMessage: function(oError) {
                var errorDetails = errorHandler.parseError(oError);
                
                MessageBox.error(errorDetails.message, {
                    icon:		MessageBox.Icon.ERROR,
                     title:		this.geti18nString("error"),
                    details:	errorDetails.details,
                    actions:	MessageBox.Action.CLOSE
                });
            },
            geti18nString: function(sKey, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
            },
            initFilterModel:function(){
                var filter={
                    project:[],
                    projectManagaer:[],
                    budgetPack:[],
                    code:[],
                    role:[]
                };
                var oModel = new JSONModel();
                oModel.setData(filter);
                oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                this.getView().setModel(oModel, "filterModel");
                
            },
            setColomnsModel:function(label1,template1,label2,template2){
                var oColumns={
                   "cols": [
                       {
                           "label": label1,
                           "template": template1,
                           "width": "15rem"
                       
                       },
                       {
                           "label": label2,
                           "template": template2
                       }
                   ]
               };
               this.ColumnModel = new JSONModel(oColumns);
               },
            onPressChange:function(){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteChangeView");
            },
            onRoleValueHelpRequest: function() {
                this.setColomnsModel("Role","Role","Role Description","RoleDescription");
                var aCols = this.ColumnModel.getData().cols,
                 oModel=this.getView().getModel("RoleValueHelpModel"),
                 oMultiInput=this.getView().byId("roleInput");
        
                Fragment.load({
                    name: "zescesiproject.view.Dialogs.Roles",
                    controller:this
                }).then(function(oValueHelpDialog) {
                    this._RoleValueHelpDialog = oValueHelpDialog;
                    this.getView().addDependent(this._RoleValueHelpDialog);
        
                    this._RoleValueHelpDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(oModel);
                        oTable.setModel(this.ColumnModel, "columns");
        
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", "/results");
                        }
        
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/results", function () {
                                return new ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new Label({ text: "{" + column.template + "}" });
                                    })
                                });
                            });
                        }
                        this._RoleValueHelpDialog.update();
                    }.bind(this));
        
                    this._RoleValueHelpDialog.setTokens(oMultiInput.getTokens());
                    this._RoleValueHelpDialog.open();
                }.bind(this));
            },
            onRoleValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                var oModel= this.getView().getModel("filterModel"),
                oData= oModel.getData();
                oData.role=[];
                oData.role= aTokens.map(function(oToken){
                    return {key:oToken.getKey(),text:oToken.getText()};

                });
                oModel.setData(oData);
                this._RoleValueHelpDialog.close();
            },
            onRoleValueHelpCancelPress: function () {
                this._RoleValueHelpDialog.close();
            },
        
            onRoleValueHelpAfterClose: function () {
                this._RoleValueHelpDialog.destroy();
            },
            onProjectValueHelpRequest: function() {
                var oModel=this.getView().getModel("ProjectValueHelpModel"),
                oMultiInput = this.getView().byId("projectInput");
                
                Fragment.load({
                    name: "zescesiproject.view.Dialogs.Projects",
                    controller:this
                }).then(function(oValueHelpDialog) {
                    this._ProjectValueHelpDialog = oValueHelpDialog;
                    this.getView().addDependent(this._ProjectValueHelpDialog);
                    this._ProjectValueHelpDialog.setModel(oModel);
                    this._ProjectValueHelpDialog.open();    
                    
                }.bind(this));
            },
            onProjectSearch:function(oEvent){
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("ESIProject", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);

            },
            onProjectValueHelpDialogClose:function(oEvent){
                var oModel= this.getView().getModel("ProjectValueHelpModel"),
                 aSelectedContexts = oEvent.getParameter("selectedContexts"),
                 aSelectedItems=  aSelectedContexts.map(function (oContext) { return  oModel.getProperty(oContext.getPath()).ESIProject });
                var oFilterModel= this.getView().getModel("filterModel"),
                oData= oFilterModel.getData();
                oData.project=[];

			if (aSelectedItems && aSelectedItems.length > 0) {
                oData.project= aSelectedItems.map(function(oItem){
                    return {key:oItem};

                });
                oFilterModel.setData(oData);
				
			}
            },
            onPMValueHelpRequest: function() {
                var oModel=this.getView().getModel("PMValueHelpModel");
                
                Fragment.load({
                    name: "zescesiproject.view.Dialogs.ProjectManager",
                    controller:this
                }).then(function(oValueHelpDialog) {
                    this._PMValueHelpDialog = oValueHelpDialog;
                    this.getView().addDependent(this._PMValueHelpDialog);
                    this._PMValueHelpDialog.setModel(oModel);
                    this._PMValueHelpDialog.open();    
                    
                }.bind(this));
            },
            onPMSearch:function(oEvent){
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("ESIProjectManager", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);

            },
            onPMValueHelpDialogClose:function(oEvent){
                var oModel= this.getView().getModel("PMValueHelpModel"),
                 aSelectedContexts = oEvent.getParameter("selectedContexts"),
                 aSelectedItems=  aSelectedContexts.map(function (oContext) { return  oModel.getProperty(oContext.getPath()).ESIProjectManager });
                var oFilterModel= this.getView().getModel("filterModel"),
                oData= oFilterModel.getData();
                oData.projectManagaer=[];

			if (aSelectedItems && aSelectedItems.length > 0) {
                oData.projectManagaer= aSelectedItems.map(function(oItem){
                    return {key:oItem};

                });
                oFilterModel.setData(oData);
				
			}
            },
            onBudgetPackValueHelpRequest: function() {
                this.setColomnsModel("Budget Pack","name","Project","prjct");
                var aCols = this.ColumnModel.getData().cols,
                 oModel=this.getView().getModel("BudgetPackValueHelpModel"),
                 oMultiInput=this.getView().byId("budgetPackInput");
        
                Fragment.load({
                    name: "zescesiproject.view.Dialogs.BudgetPack",
                    controller:this
                }).then(function(oValueHelpDialog) {
                    this._BudgetPackValueHelpDialog = oValueHelpDialog;
                    this.getView().addDependent(this._BudgetPackValueHelpDialog);
        
                    this._BudgetPackValueHelpDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(oModel);
                        oTable.setModel(this.ColumnModel, "columns");
        
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", "/results");
                        }
        
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/results", function () {
                                return new ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new Label({ text: "{" + column.template + "}" });
                                    })
                                });
                            });
                        }
                        this._BudgetPackValueHelpDialog.update();
                    }.bind(this));
        
                    this._BudgetPackValueHelpDialog.setTokens(oMultiInput.getTokens());
                    this._BudgetPackValueHelpDialog.open();
                }.bind(this));
            },
            onBudgetPackValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                var oModel= this.getView().getModel("filterModel"),
                oData= oModel.getData();
                oData.budgetPack=[];
                oData.budgetPack= aTokens.map(function(oToken){
                    return {key:oToken.getKey(),text:oToken.getText()};

                });
                oModel.setData(oData);
                this._BudgetPackValueHelpDialog.close();
            },
            onBudgetPackValueHelpCancelPress: function () {
                this._BudgetPackValueHelpDialog.close();
            },
        
            onBudgetPackValueHelpafterClose: function () {
                this._BudgetPackValueHelpDialog.destroy();
            },
            onCodeValueHelpRequest: function() {
                var oModel=this.getView().getModel("CodeValueHelpModel");
                Fragment.load({
                    name: "zescesiproject.view.Dialogs.Code",
                    controller:this
                }).then(function(oValueHelpDialog) {
                    this._ESIValueHelpDialog = oValueHelpDialog;
                    this.getView().addDependent(this._ESIValueHelpDialog);
                    this._ESIValueHelpDialog.setModel(oModel);
                    this._ESIValueHelpDialog.open();    
                    
                }.bind(this));
                
            },
            onESISearch:function(oEvent){
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("zzesipro", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);

            },
            onESIValueHelpDialogClose:function(oEvent){
                var oModel= this.getView().getModel("CodeValueHelpModel"),
                 aSelectedContexts = oEvent.getParameter("selectedContexts"),
                 aSelectedItems= aSelectedContexts && aSelectedContexts.map(function (oContext) { return  oModel.getProperty(oContext.getPath()).zzesipro });
                var oFilterModel= this.getView().getModel("filterModel"),
                oData= oFilterModel.getData();
                oData.code=[];

			if (aSelectedItems && aSelectedItems.length > 0) {
                oData.code= aSelectedItems.map(function(oItem){
                    return {key:oItem};

                });
                oFilterModel.setData(oData);
				
			};
        },

    onGO:function(oEvent){
        var filterModel = this.getView().getModel("filterModel").getData();
        var oTable = this.getView().byId("idTable");
	    var oBinding = oTable.getBinding("items");
        var arrFilters=[];
        var arrayFinalFilter=[];
        let aFilter;        
        var{authType,costController,costObject,costObjectType,esiCode,project,role,budgetPack}=filterModel;
        var filterize= function(filterName,sPath){

            if(  filterName.length>0){
                arrFilters= filterName.map(function(oItem){
                 return  new Filter({
                                  path: sPath,
                                 operator: FilterOperator.Contains,
                                 value1: oItem.key
                                          });

                });
                aFilter= new Filter({
                    filters:arrFilters,
                     and: false
                    });
                    
                    arrayFinalFilter.push(aFilter);
            };
            
        };
        var sfilterize= function(filterName,sPath){
            if ( filterName) {
                arrayFinalFilter.push(new Filter({
                       path: sPath,
                       operator: FilterOperator.Contains,
                       value1: filterName,
                      
               }));
            };
            
        };


        filterize(costController,'Costcontroller');
        sfilterize(authType,'Authorizationtype');
        sfilterize(costObject,'Costobject');
        sfilterize(costObjectType,'CostObjectType');
        filterize(esiCode,'Esicode');
        filterize(project,'Project');
        filterize(role,'Level1role');
        filterize(role,'Level2role');
        filterize(role,'Level3role');
        filterize(role,'Level4role');
        filterize(role,'Level5role');
        filterize(budgetPack,'Budgetpack');        
        oBinding.filter(new Filter({
                filters:arrayFinalFilter,
                and: true
           }));
     }
            

            
        });
    });


