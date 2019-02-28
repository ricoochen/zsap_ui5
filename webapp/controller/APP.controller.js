sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function(Controller,Filter,JSONModel,ResourceModel) {
    "use strict";
	var oModel;
	var aFilters;
    var sCurrentPath; // current path
    var sCurrentUsr;  // cureent user
	
	return Controller.extend("zsap_.controller.APP", {
		inputId: "",
		
		onInit: function() {
            // var mConfig = this.getMetadata().getConfig();
            // // resource bundle
            // var oResourceModel = new ResourceModel({
            //     bundleName: mConfig.i18nBundle
            // });
            // this.setModel(oResourceModel, "i18n");           
            // // application data
            // var rModel = new JSONModel(mConfig.serviceUrl);
            // this.setModel(rModel);
            
			//sap.m.MessageToast.show("Initial");
            oModel = this.getOwnerComponent().getModel();
            oModel.setUseBatch(false);
            this.getView().setModel(oModel);
            //sap.m.MessageToast.show("End Initial");
        },
        
        onRead:function(){
 
        	var sInputValue = this.getView().byId("productInput").getSelectedKey();
        	// define filters
			
			if ( sInputValue === ""){
			aFilters = [	new Filter("Usrid", 
		            sap.ui.model.FilterOperator.Contains,
		            sInputValue) ];
			}
			else{
			aFilters = [	new Filter("Usrid", 
		            sap.ui.model.FilterOperator.EQ,
		            sInputValue)];
			}
			
			// get data using filter
			oModel.read("/ZUSERSet", {
			    filters: aFilters,     
			    success: function(oData, oResponse){
			        //window.console.log(oData);
			    }
			});
			
            var oList = this.getView().byId("idTable");
            var oBinding = oList.getBinding("items");

            oBinding.filter(aFilters);
            
        },
        
		openDialog: function() {
            var oView = this.getView();
			// Open dialog
            var oUsrDialog = oView.byId("UsrDialog");
            if (!oUsrDialog) {
                oUsrDialog = sap.ui.xmlfragment(oView.getId(),
                    "zsap_ui.view.UsrDialog");
                oView.addDependent(oUsrDialog);
            }
			oUsrDialog.open();
			// Attach press event for CancelButton
            var oCancelButton = oView.byId("CancelButton");
            oCancelButton.attachPress(function() {
                oUsrDialog.close();
            });
        },
		// onCreate event
        onCreate: function() {
        	sap.m.MessageToast.show("Create starting.");
            var oView = this.getView();
			this.openDialog();
            var oUsrDialog = oView.byId("UsrDialog");
            oUsrDialog.setTitle("Create User");
            oView.byId("Usrid").setEditable(true);
            oView.byId("SaveEdit").setVisible(false);
            oView.byId("SaveCreate").setVisible(true);
			// clear
            oView.byId("Usrid").setValue("");
            oView.byId("Usrname").setValue("");
            oView.byId("Usraddr").setValue("");
			// commit save
            oView.byId("SaveCreate").attachPress(function() {
                var oNewEntry = {
                    "Mandt": "300",
                    "Usrid": "",
                    "Usrname": "",
                    "Usraddr": ""
                };
				// populate value from form
                oNewEntry.Usrid   = oView.byId("Usrid").getValue();
                oNewEntry.Usrname = oView.byId("Usrname").getValue();
                oNewEntry.Usraddr = oView.byId("Usraddr").getValue();
                
                if(!oNewEntry.Usrid){
                	sap.m.MessageToast.show("Please input the value of Usrid");
                	return;
                }else{
					// Commit creation operation
	                oModel.create("/ZUSERSet", oNewEntry, {
	                    success: function() {
	                        sap.m.MessageToast.show("Created successfully.");
	                    },
	                    error: function(oError) {
	                        window.console.log("Error", oError);
	                    }
	                });
                }

				// close dialog
                if (oUsrDialog) {
                    oUsrDialog.close();
                }
            });
        },
        //onEdit event
		onEdit: function() {
            // no Item was selected
            if (!sCurrentUsr) {
                sap.m.MessageToast.show("No Item was selected.");
                return;
            }
			var oView = this.getView();
			this.openDialog();
            var oUsrDialog = oView.byId("UsrDialog");
            oUsrDialog.setTitle("Edit User");
            oView.byId("Usrid").setEditable(false);
            oView.byId("SaveEdit").setVisible(true);
            oView.byId("SaveCreate").setVisible(false);
			// populate fields
            oView.byId("Usrid").setValue(oModel.getProperty(sCurrentPath + "/Usrid"));
            oView.byId("Usrname").setValue(oModel.getProperty(sCurrentPath + "/Usrname"));
            oView.byId("Usraddr").setValue(oModel.getProperty(sCurrentPath + "/Usraddr"));
			// Attach save event
            oView.byId("SaveEdit").attachPress(function() {
                var oChanges = {
                    "Mandt": "300",
                    "Usrname": "",
                    "Usraddr": ""
                };
				// populate value from form
                oChanges.Usrname = oView.byId("Usrname").getValue();
                oChanges.Usraddr = oView.byId("Usraddr").getValue();
				// commit creation
                oModel.update(sCurrentPath, oChanges, {
                    success: function() {
                        sap.m.MessageToast.show("Changes were saved successfully.");
                    },
                    error: function(oError) {
                        window.console.log("Error", oError);
                    }
                });
				// close dialog
                if (oUsrDialog) {
                    oUsrDialog.close();
                }
            });
        },
		// onDelete event
        onDelete: function() {
            var that = this;
			// no Item was selected
            if (!sCurrentUsr) {
                sap.m.MessageToast.show("No Item was selected.");
                return;
            }
			var oDeleteDialog = new sap.m.Dialog();
            oDeleteDialog.setTitle("Deletion");
			var oText = new sap.m.Label({
                text: "Are you sure to delete UsrId [" + sCurrentUsr + "]?"
            });
            oDeleteDialog.addContent(oText);
			oDeleteDialog.addButton(
                new sap.m.Button({
                    text: "Confirm",
                    press: function() {
                        that.deleteUsr();
                        oDeleteDialog.close();
                    }
                })
            );
			oDeleteDialog.open();
        },
		// deletion operation
        deleteUsr: function() {
            oModel.remove(sCurrentPath, {
                success: function() {
                    sap.m.MessageToast.show("Deletion successful.");
                },
                error: function(oError) {
                    window.console.log("Error", oError);
                }
            });
        },

		onItemPress: function(evt) {
            var oContext = evt.getSource().getBindingContext();
            sCurrentPath = oContext.getPath();
            sCurrentUsr = oContext.getProperty("Usrname");
        },
        
        //Input usrid value help
        handleValueHelp : function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zsap_ui.view.InputUsridDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"Usrname",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Usrname",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId),
					//oText = this.byId('selectedKey'),
					sDescription = oSelectedItem.getDescription();

				productInput.setSelectedKey(sDescription);
				//oText.setText(sDescription);
			}
			evt.getSource().getBinding("items").filter([]);
		},
		
		suggestionItemSelected: function (evt) {
			var oItem = evt.getParameter('selectedItem'),
				//oText = this.byId('selectedKey'),
				sKey = oItem ? oItem.getKey() : '';
			//oText.setText(sKey);
		}
    });
});