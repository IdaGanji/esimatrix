sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel",
    "zescesiproject/utils/service",
    "zescesiproject/utils/errorHandler",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Fragment,DateFormat,JSONModel,service,errorHandler,MessageBox,UIComponent,MessageToast,Filter,FilterOperator) {
        "use strict";

        return Controller.extend("zescesiproject.controller.View2", {
            onInit: function () {
                var oRouter = this.getRouter();
			    oRouter.getRoute("RouteChangeView").attachMatched(this._onRouteMatched, this);
               // this.initOwnerInputModel();
            },
            initValuehelpModels:function(){
                this.initValueHelpModel("/Z_I_POARole","RoleValueHelpModel");
            },
            initValueHelpModel: function(path,sName){
                service.get(path).then(
                    function(oData) {
                        var oModel = new JSONModel();
                        oModel.setData(oData);
                      this.getView().setModel(oModel, sName);
                    }.bind(this)).then(undefined,
                    function(oError) {
                    var errorDetails = errorHandler.parseError(oError);
                MessageBox.error(errorDetails.message, {
                    icon:		MessageBox.Icon.ERROR,
                     title:		"Error",
                    details:	errorDetails.details,
                    actions:	MessageBox.Action.CLOSE
                });
                    }.bind(this));
            },
            initOwnerInputModel:function(){
                var oView= this.getView();
                var oData= {
                    ownerInputValue: ""
                };
                var oModel= new JSONModel();
                oModel.setData(oData);
                oView.setModel(oModel,"ownerInputModel");

                
            },

            initModel:function(){
             var oView= this.getView(); 
             var oModel= this.getOwnerComponent().getModel("mainModel");
             var arrData= oModel.getData().results;
             var arrChangeData= [];
             arrData.forEach(function(obj){
                 if(obj.Selected===true){
                    arrChangeData.push(obj);
                 }

             });

             var oChangeDataModel = new JSONModel();
             oChangeDataModel.setData(arrChangeData);
             oView.setModel(oChangeDataModel, "changeModel");
             
            },
            
            
            getRouter : function () {
                return UIComponent.getRouterFor(this);
            },
            _onRouteMatched:function(){
                this.initModel(); 
                this.initValuehelpModels();
            },

            onValueHelpRequest:function(oEvent){
                var oView= this.getView();
                var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
                this._toBeUpdated= oView.getModel("changeModel").getProperty(sPath);
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        name: "zfiauthomatrix.view.SelectDialog",
                        controller: this
                    }).then(function (oDialog){
                        oView.addDependent(oDialog);                        
                        return oDialog;
                    });
                }
    
                this._pDialog.then(function(oDialog){
                    oDialog.open();
                }.bind(this));

            },
            onSelectDialogSearch:function(oEvent){
            var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Roleowner", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

            },
            onSelectDialogClose:function(oEvent){
                
             var oSelectedItem = oEvent.getParameter("selectedItem");
             var oView= this.getView(),
             oModel= oView.getModel("changeModel");

             this._toBeUpdated.Roleowner= oSelectedItem.getTitle();
             this._toBeUpdated.RoleownerName= oSelectedItem.getDescription();
             oModel.refresh();             


            
		},
        onChangeValue:function(oEvent){
           var oControl= oEvent.getSource();
           console.log(oControl);
           var sValue= oEvent.getParameter("value");
           console.log(sValue);
        },
        onItemsSelected:function(oEvent){
           var oCtr= oEvent.getParameters("listItem");
           console.log(oCtr);

        },
            setBusy: function(sId, busy) {
                if (this.getView().byId(sId)) {
                    this.getView().byId(sId).setBusyIndicatorDelay(0);
                    this.getView().byId(sId).setBusy(busy);
                } else if (sap.ui.getCore().byId(sId)) {
                    sap.ui.getCore().byId(sId).setBusyIndicatorDelay(0);
                    sap.ui.getCore().byId(sId).setBusy(busy);
                }
            },
            emptyTable:function(){
                var oModel= this.getView().getModel("mainModel");
                var oData= oModel.getData();
                var oResults= oData.results;
                oResults.forEach(function(oItem){
                    if(oItem.Selected===true){
                        oItem.Selected=false;

                    }
                });
                oModel.setData(oData);

            },
            
     _parseDate: function (oDate) {
        var oFormat = DateFormat.getDateInstance({
            pattern: "yyyy-MM-ddTHH:mm:ss"
        });
        return oFormat.format(oDate);
    },
            
            
            rebindTable: function(sPath,oTemplate, sKeyboardMode) {

            },
            onPressSubmit:function(){
                var oRouter= this.getRouter();
                var oTable=this.getView().byId("idChangeTable") ;
                var aTableItems = oTable.getAggregation("items");
                
                var aTableRows = [];
                aTableItems.forEach(function(row){
                    var rowCell=row.getAggregation("cells");
                    aTableRows.push(rowCell);
                });
                var aDataToSend=[];
                aTableRows.forEach(function(rowArray){
                    aDataToSend.push(
                        {
                            Role : rowArray[0].getProperty("text"),
                            Roledescription : rowArray[1].getProperty("value"),
                            Roleowner : rowArray[2].getProperty("value"),
                            RoleownerName : rowArray[3].getProperty("value"),
                            Maxamount : rowArray[4].getProperty("value"),
                            Startdate : new Date(rowArray[5].getProperty("value"))  ,
                            Enddate : new Date (rowArray[6].getProperty("value")) ,
                            OrgRole : rowArray[8].getProperty("text"),
                            OrgRoleowner : rowArray[9].getProperty("text"),
                            OrgStartdate : new Date(rowArray[10].getProperty("text")) 

                        }
                    );

                });
                
                service.post(aDataToSend).then(function (oData) {
                         this.setBusy("idChangeTable", true);
                         var msg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("messageForChangeRole");
                         MessageToast.show(msg);
                         this.setBusy("idChangeTable", false);
                         var navFunction= function(){
                            oRouter.navTo("RouteRootView");

                        };
                        window.setTimeout(navFunction,2000);
                        this.emptyTable();
                         
                      
                     }.bind(this)).then(undefined, function(oError) {

                        this.showErrorMessage(oError);

                     }.bind(this));

     
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
            emptyTable:function(){
                var oView= this.getView();
                var oModel= this.getOwnerComponent().getModel("mainModel");
                oModel.getData().results.forEach(function(line){
                    if(line.Selected===true){
                        line.Selected=false;
                    }

                });
                oModel.refresh();
            },
        onRole1ValueHelpRequest: function(oEvent) {
            var oModel=this.getView().getModel("RoleValueHelpModel");
            var oView= this.getView();
            var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
            this._previousRole1= oView.getModel("changeModel").getProperty(sPath);
            Fragment.load({
                name: "zescesiproject.view.Dialogs.Roles1",
                controller:this
            }).then(function(oValueHelpDialog) {
                this._RolesValueHelpDialog = oValueHelpDialog;
                this.getView().addDependent(this._RolesValueHelpDialog);
                this._RolesValueHelpDialog.setModel(oModel);
                this._RolesValueHelpDialog.open();    
                
            }.bind(this));
            
        },
        onRole2ValueHelpRequest: function(oEvent) {
            var oModel=this.getView().getModel("RoleValueHelpModel");
            var oView= this.getView();
            var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
            this._previousRole2= oView.getModel("changeModel").getProperty(sPath);
            console.log(this._previousRole);
            Fragment.load({
                name: "zescesiproject.view.Dialogs.Roles2",
                controller:this
            }).then(function(oValueHelpDialog) {
                this._RolesValueHelpDialog = oValueHelpDialog;
                this.getView().addDependent(this._RolesValueHelpDialog);
                this._RolesValueHelpDialog.setModel(oModel);
                this._RolesValueHelpDialog.open();    
                
            }.bind(this));
            
        },
        onRole3ValueHelpRequest: function(oEvent) {
            var oModel=this.getView().getModel("RoleValueHelpModel");
            var oView= this.getView();
            var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
            this._previousRole3= oView.getModel("changeModel").getProperty(sPath);
            console.log(this._previousRole);
            Fragment.load({
                name: "zescesiproject.view.Dialogs.Roles3",
                controller:this
            }).then(function(oValueHelpDialog) {
                this._RolesValueHelpDialog = oValueHelpDialog;
                this.getView().addDependent(this._RolesValueHelpDialog);
                this._RolesValueHelpDialog.setModel(oModel);
                this._RolesValueHelpDialog.open();    
                
            }.bind(this));
            
        },
        onRole4ValueHelpRequest: function(oEvent) {
            var oModel=this.getView().getModel("RoleValueHelpModel");
            var oView= this.getView();
            var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
            this._previousRole4= oView.getModel("changeModel").getProperty(sPath);
            console.log(this._previousRole);
            Fragment.load({
                name: "zescesiproject.view.Dialogs.Roles4",
                controller:this
            }).then(function(oValueHelpDialog) {
                this._RolesValueHelpDialog = oValueHelpDialog;
                this.getView().addDependent(this._RolesValueHelpDialog);
                this._RolesValueHelpDialog.setModel(oModel);
                this._RolesValueHelpDialog.open();    
                
            }.bind(this));
            
        },
        onRole5ValueHelpRequest: function(oEvent) {
            var oModel=this.getView().getModel("RoleValueHelpModel");
            var oView= this.getView();
            var sPath= oEvent.getSource().getBindingInfo("value").binding.getContext().getPath();
            this._previousRole5= oView.getModel("changeModel").getProperty(sPath);
            console.log(this._previousRole);
            Fragment.load({
                name: "zescesiproject.view.Dialogs.Roles5",
                controller:this
            }).then(function(oValueHelpDialog) {
                this._RolesValueHelpDialog = oValueHelpDialog;
                this.getView().addDependent(this._RolesValueHelpDialog);
                this._RolesValueHelpDialog.setModel(oModel);
                this._RolesValueHelpDialog.open();    
                
            }.bind(this));
            
        },
        onRoleSearch:function(oEvent){
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Role", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);

        },
        onRole1ValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameter("selectedItem");
         var oView= this.getView(),
         oModel= oView.getModel("changeModel");

         this._previousRole1.Level1role= oSelectedItem.getTitle();
         oModel.refresh();
        
        },
        onRole2ValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameter("selectedItem");
         var oView= this.getView(),
         oModel= oView.getModel("changeModel");

         this._previousRole2.Level2role= oSelectedItem.getTitle();
         oModel.refresh();
        
        },
        onRole3ValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameter("selectedItem");
         var oView= this.getView(),
         oModel= oView.getModel("changeModel");

         this._previousRole3.Level3role= oSelectedItem.getTitle();
         oModel.refresh();
        
        },
        onRole4ValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameter("selectedItem");
         var oView= this.getView(),
         oModel= oView.getModel("changeModel");

         this._previousRole4.Level4role= oSelectedItem.getTitle();
         oModel.refresh();
        
        },
        onRole5ValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameter("selectedItem");
         var oView= this.getView(),
         oModel= oView.getModel("changeModel");

         this._previousRole5.Level5role= oSelectedItem.getTitle();
         oModel.refresh();
        
        },
        onPressSubmit:function(){
            var oRouter= this.getRouter();
            var oTable=this.getView().byId("idChangeTable") ;
            var aTableItems = oTable.getAggregation("items");
            
            var aTableRows = [];
            aTableItems.forEach(function(row){
                var rowCell=row.getAggregation("cells");
                aTableRows.push(rowCell);
            });
            var aDataToSend=[];
            aTableRows.forEach(function(rowArray){
                aDataToSend.push(
                    {
                        Costobject : rowArray[0].getAggregation("items")[0].getAggregation("items")[0].getProperty("text"),
                        Project: rowArray[1].getProperty("text"),
                        Budgetpack: rowArray[2].getProperty("text"),
                        Esicode: rowArray[3].getProperty("number"),
                        Costcontroller: rowArray[4].getProperty("value"),
                        Level1role: rowArray[5].getAggregation("items")[0].getAggregation("items")[0].getProperty("value"),
                        Level2role: rowArray[6].getAggregation("items")[0].getAggregation("items")[0].getProperty("value"),
                        Level3role: rowArray[7].getAggregation("items")[0].getAggregation("items")[0].getProperty("value"),
                        Level4role: rowArray[8].getAggregation("items")[0].getAggregation("items")[0].getProperty("value"),
                        Level5role: rowArray[9].getAggregation("items")[0].getAggregation("items")[0].getProperty("value"),
                        Authorizationtype: rowArray[10].getProperty("text")
                    }
                );

            });
            
            service.post(aDataToSend).then(function (oData) {
                     this.setBusy("idChangeTable", true);
                     var msg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("messageForChangeRole");
                     MessageToast.show(msg);
                     this.setBusy("idChangeTable", false);
                     var navFunction= function(){
                        oRouter.navTo("RouteRootView");

                    };
                    window.setTimeout(navFunction,2000);
                    this.emptyTable();
                     
                  
                 }.bind(this)).then(undefined, function(oError) {

                    this.showErrorMessage(oError);

                 }.bind(this));

 
        }
    
        });
    });