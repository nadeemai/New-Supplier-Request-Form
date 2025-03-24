sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("com.tableentry.tablestructure.controller.Table_Entry", {
        onInit: function () {
            var oData = {
                items: [
                    { supplierRequestId: "R35", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-01-2024", requestAging: "10 Days", lastActionDate: "11-10-2024", lastActionAging: "15 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R18", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-02-2024", requestAging: "20 Days", lastActionDate: "12-10-2024", lastActionAging: "20 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R17", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-03-2024", requestAging: "30 Days", lastActionDate: "13-10-2024", lastActionAging: "30 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R16", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-04-2024", requestAging: "40 Days", lastActionDate: "14-10-2024", lastActionAging: "40 Days", stage: "BUYER", status: "CANCELLED" },
                    { supplierRequestId: "R15", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-05-2024", requestAging: "50 Days", lastActionDate: "15-10-2024", lastActionAging: "50 Days", stage: "ON BOARDING", status: "VENDOR CREATED" },
                    { supplierRequestId: "R14", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-06-2024", requestAging: "60 Days", lastActionDate: "16-10-2024", lastActionAging: "25 Days", stage: "ON BOARDING", status: "CMDM UPDATE PENDING" },
                    { supplierRequestId: "R13", supplierName: "ABC Pvt Ltd", type: "Indirect", requestCreationDate: "12-07-2024", requestAging: "70 Days", lastActionDate: "17-10-2024", lastActionAging: "35 Days", stage: "ON BOARDING", status: "FINANCE UPDATE PENDING" },
                    { supplierRequestId: "R12", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-08-2024", requestAging: "80 Days", lastActionDate: "18-10-2024", lastActionAging: "55 Days", stage: "ON BOARDING", status: "PURCHASE APPROVAL PENDING" },
                    { supplierRequestId: "R11", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-09-2024", requestAging: "90 Days", lastActionDate: "19-10-2024", lastActionAging: "45 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R13", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R10", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R9", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-11-2024", requestAging: "110 Days", lastActionDate: "21-10-2024", lastActionAging: "65 Days", stage: "BUYER", status: "DRAFT" }
                ],
                draftCount: 0,
                myPendingCount: 0,
                pendingWithSupplierCount: 0,
                onBoardingCount: 0,
                allCount: 0
            };

            this._sortStates = {
                supplierRequestId: false,
                supplierName: false,
                type: false,
                requestCreationDate: false,
                requestAging: false,
                lastActionDate: false,
                lastActionAging: false,
                stage: false,
                status: false
            };
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._updateTileCounts(oData);
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "products");

            // Initialize the new supplier form model
            var oNewSupplierData = {
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                duns: "",
                address: "",
                isVerified: false,
                currentStep: 1
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            var sStyle = `
                .centeredGrid {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .tileLayout {
                    min-width: 150px;
                    text-align: center;
                }
                #_IDGenToolbar {
                    background-color: #f7f7f7;
                    padding: 5px 10px;
                    border-bottom: 1px solid #d9d9d9;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                #_IDGenToolbar .sapMLabel {
                    font-weight: bold;
                    color: #333;
                    margin-right: 5px;
                    white-space: nowrap;
                    overflow: visible;
                    text-overflow: clip;
                    min-width: 120px;
                }
                #_IDGenToolbar .sapMInputBaseInner {
                    padding: 0 5px;
                    width: 100%;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMComboBox {
                    padding: 0 5px;
                    width: 100%;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMBtn {
                    margin-left: 5px;
                    padding: 5px 10px;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMTBSpacer {
                    flex-grow: 1;
                }
                #actionToolbar {
                    background-color: #f7f7f7;
                    padding: 5px 10px;
                    border-bottom: 1px solid #d9d9d9;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                #actionToolbar .sapMBtn {
                    margin-left: 5px;
                    padding: 5px 10px;
                    min-width: 150px;
                }
                .sapMText {
                    visibility: visible !important;
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                }
                .sapMListTblHeader .sapMText {
                    font-weight: bold;
                    color: #333;
                    padding: 5px;
                }
                .sapMListTblCell {
                    min-width: 120px;
                }
                .sapUiIcon {
                    margin-left: 5px;
                    cursor: pointer;
                }
                .sapUiIcon[id*="sortIcon_"] {
                    color: #ff0000 !important;
                }
                .stepNumber {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 20px;
                    font-size: 12px;
                }
                .stepText {
                    font-size: 12px;
                    line-height: 20px;
                }
                .inactiveStep {
                    background-color: #d3d3d3;
                    color: #666;
                }
                .activeStep {
                    background-color: #ff0000;
                    color: #fff;
                }
                .activeStep.stepText {
                    background-color: transparent;
                    color: #000;
                    font-weight: bold;
                }
                .form-container {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    border: 1px solid #d9d9d9;
                    border-radius: 8px;
                    background-color: #fff;
                }
                .header {
                    background-color: #ff0000;
                    color: #fff;
                    padding: 10px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .step-indicator {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .form-field {
                    margin-bottom: 15px;
                }
                .form-field label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .form-field input, .form-field textarea, .form-field select {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                }
                .form-field button {
                    padding: 8px 16px;
                    margin-left: 10px;
                    background-color: #0070f0;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .form-field button:disabled {
                    background-color: #d3d3d3;
                    cursor: not-allowed;
                }
                .form-field .verified {
                    background-color: #28a745;
                }
                .buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .buttons button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .buttons .proceed {
                    background-color: #0070f0;
                    color: #fff;
                    border: none;
                }
                .buttons .cancel {
                    background-color: #fff;
                    color: #ff0000;
                    border: 1px solid #ff0000;
                }
                .buttons .previous {
                    background-color: #fff;
                    color: #000;
                    border: 1px solid #d9d9d9;
                }
                .error {
                    border-color: #ff0000 !important;
                }
                .error-message {
                    color: #ff0000;
                    font-size: 12px;
                    margin-top: 5px;
                }
                .duplicate-warning {
                    color: #ff0000;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                .duplicate-warning::before {
                    content: "⚠️";
                    margin-right: 5px;
                }
                .duplicate-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                .duplicate-table th, .duplicate-table td {
                    border: 1px solid #d9d9d9;
                    padding: 8px;
                    text-align: left;
                }
                .duplicate-table th {
                    background-color: #f7f7f7;
                }
                .duplicate-table input[type="radio"] {
                    margin-right: 5px;
                }
                .reason-field {
                    margin-top: 10px;
                }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        _updateTileCounts: function (oData) {
            var aItems = oData.items;
            oData.draftCount = aItems.filter(item => item.status === "DRAFT").length;
            oData.myPendingCount = aItems.filter(item => item.stage === "BUYER").length;
            oData.pendingWithSupplierCount = aItems.filter(item => item.stage === "SUPPLIER").length;
            oData.onBoardingCount = aItems.filter(item => item.stage === "ON BOARDING").length;
            oData.allCount = aItems.length;
        },

        _applyFilters: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sSupplierId = this.byId("supplierIdInput").getValue();
            if (sSupplierId) {
                aFilters.push(new Filter("supplierRequestId", FilterOperator.Contains, sSupplierId));
            }

            var sSupplierType = this.byId("supplierTypeComboBox").getSelectedKey();
            if (sSupplierType && sSupplierType !== "All") {
                aFilters.push(new Filter("type", FilterOperator.EQ, sSupplierType));
            }

            var sStage = this.byId("stageComboBox").getSelectedKey();
            if (sStage && sStage !== "All") {
                aFilters.push(new Filter("stage", FilterOperator.EQ, sStage));
            }

            var sStatus = this.byId("statusComboBox").getSelectedKey();
            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            if (aFilters.length > 0) {
                oBinding.filter(new Filter({
                    filters: aFilters,
                    and: true
                }));
            } else {
                oBinding.filter([]);
            }
        },

        onSupplierIdChange: function (oEvent) {
            this._applyFilters();
        },

        onSupplierTypeChange: function (oEvent) {
            this._applyFilters();
        },

        onStageChange: function (oEvent) {
            this._applyFilters();
        },

        onStatusChange: function (oEvent) {
            this._applyFilters();
        },

        _refreshTable: function () {
            var oTable = this.byId("productsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh(true);
                }
            }
        },

        _centerTiles: function () {
            var oGrid = this.byId("tileGrid");
            if (oGrid) {
                oGrid.addStyleClass("centeredGrid");
            }
        },

        _parseDate: function (sDate) {
            if (!sDate) return new Date(0);
            var [day, month, year] = sDate.split("-").map(Number);
            return new Date(year, month - 1, day);
        },

        _updateSortIcon: function (sColumnKey, bDescending) {
            var sIconId = "sortIcon_" + sColumnKey;
            var oIcon = this.byId(sIconId);
            if (oIcon) {
                oIcon.setSrc(bDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
            }
        },

        onSortSupplierRequestId: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.supplierRequestId = !this._sortStates.supplierRequestId;
            var bDescending = this._sortStates.supplierRequestId;

            try {
                var aSupplierRequestIds = aItems.map(item => item.supplierRequestId);
                aSupplierRequestIds.sort((a, b) => {
                    var aNum = parseInt(a.replace("R", ""), 10) || 0;
                    var bNum = parseInt(b.replace("R", ""), 10) || 0;
                    return bDescending ? bNum - aNum : aNum - bNum;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.supplierRequestId = aSupplierRequestIds[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("supplierRequestId", bDescending);
                MessageToast.show(`Sorted Supplier Request ID column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Supplier Request ID: " + e.message);
            }
        },

        onSortSupplierName: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.supplierName = !this._sortStates.supplierName;
            var bDescending = this._sortStates.supplierName;

            try {
                var aSupplierNames = aItems.map(item => item.supplierName);
                aSupplierNames.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.supplierName = aSupplierNames[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("supplierName", bDescending);
                MessageToast.show(`Sorted Supplier Name column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Supplier Name: " + e.message);
            }
        },

        onSortType: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.type = !this._sortStates.type;
            var bDescending = this._sortStates.type;

            try {
                var aTypes = aItems.map(item => item.type);
                aTypes.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.type = aTypes[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("type", bDescending);
                MessageToast.show(`Sorted Type column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Type: " + e.message);
            }
        },

        onSortRequestCreationDate: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.requestCreationDate = !this._sortStates.requestCreationDate;
            var bDescending = this._sortStates.requestCreationDate;

            try {
                var aRequestCreationDates = aItems.map(item => item.requestCreationDate);
                aRequestCreationDates.sort((a, b) => {
                    var aDate = this._parseDate(a);
                    var bDate = this._parseDate(b);
                    return bDescending ? bDate - aDate : aDate - bDate;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.requestCreationDate = aRequestCreationDates[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("requestCreationDate", bDescending);
                MessageToast.show(`Sorted Request Creation Date column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Request Creation Date: " + e.message);
            }
        },

        onSortRequestAging: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.requestAging = !this._sortStates.requestAging;
            var bDescending = this._sortStates.requestAging;

            try {
                var aRequestAgings = aItems.map(item => item.requestAging);
                aRequestAgings.sort((a, b) => {
                    var aDays = parseInt(a.split(" ")[0], 10) || 0;
                    var bDays = parseInt(b.split(" ")[0], 10) || 0;
                    return bDescending ? bDays - aDays : aDays - bDays;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.requestAging = aRequestAgings[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("requestAging", bDescending);
                MessageToast.show(`Sorted Request Aging column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Request Aging: " + e.message);
            }
        },

        onSortLastActionDate: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.lastActionDate = !this._sortStates.lastActionDate;
            var bDescending = this._sortStates.lastActionDate;

            try {
                var aLastActionDates = aItems.map(item => item.lastActionDate);
                aLastActionDates.sort((a, b) => {
                    var aDate = this._parseDate(a);
                    var bDate = this._parseDate(b);
                    return bDescending ? bDate - aDate : aDate - bDate;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.lastActionDate = aLastActionDates[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("lastActionDate", bDescending);
                MessageToast.show(`Sorted Last Action Date column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Last Action Date: " + e.message);
            }
        },

        onSortLastActionAging: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.lastActionAging = !this._sortStates.lastActionAging;
            var bDescending = this._sortStates.lastActionAging;

            try {
                var aLastActionAgings = aItems.map(item => item.lastActionAging);
                aLastActionAgings.sort((a, b) => {
                    var aDays = parseInt(a.split(" ")[0], 10) || 0;
                    var bDays = parseInt(b.split(" ")[0], 10) || 0;
                    return bDescending ? bDays - aDays : aDays - bDays;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.lastActionAging = aLastActionAgings[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("lastActionAging", bDescending);
                MessageToast.show(`Sorted Last Action Aging column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Last Action Aging: " + e.message);
            }
        },

        onSortStage: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.stage = !this._sortStates.stage;
            var bDescending = this._sortStates.stage;

            try {
                var aStages = aItems.map(item => item.stage);
                aStages.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.stage = aStages[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("stage", bDescending);
                MessageToast.show(`Sorted Stage column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Stage: " + e.message);
            }
        },

        onSortStatus: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.status = !this._sortStates.status;
            var bDescending = this._sortStates.status;

            try {
                var aStatuses = aItems.map(item => item.status);
                aStatuses.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.status = aStatuses[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("status", bDescending);
                MessageToast.show(`Sorted Status column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Status: " + e.message);
            }
        },

        onTilePress: function (oEvent) {
            var oTile = oEvent.getSource();
            var sTileId = oTile.getId();
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sTileId.includes("draftTile")) {
                aFilters.push(new Filter("status", FilterOperator.EQ, "DRAFT"));
            } else if (sTileId.includes("myPendingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "BUYER"));
            } else if (sTileId.includes("pendingWithSupplierTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "SUPPLIER"));
            } else if (sTileId.includes("onBoardingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "ON BOARDING"));
            } else if (sTileId.includes("allTile")) {
                oBinding.filter([]);
                this.byId("supplierIdInput").setValue("");
                this.byId("supplierTypeComboBox").setSelectedKey("All");
                this.byId("stageComboBox").setSelectedKey("All");
                this.byId("statusComboBox").setSelectedKey("All");
                return;
            }

            oBinding.filter(aFilters);
            this.byId("supplierIdInput").setValue("");
            this.byId("supplierTypeComboBox").setSelectedKey("All");
            this.byId("stageComboBox").setSelectedKey("All");
            this.byId("statusComboBox").setSelectedKey("All");
        },

        onOrderPress: function () {
            // Open the new supplier form in a new tab
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setProperty("/currentStep", 1);
            oNewSupplierModel.setProperty("/spendType", "");
            oNewSupplierModel.setProperty("/supplierType", "");
            oNewSupplierModel.setProperty("/gstin", "");
            oNewSupplierModel.setProperty("/pan", "");
            oNewSupplierModel.setProperty("/duns", "");
            oNewSupplierModel.setProperty("/address", "");
            oNewSupplierModel.setProperty("/isVerified", false);

            // Generate the HTML content for the new tab
            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .form-container {
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            background-color: #fff;
        }
        .header {
            background-color: #ff0000;
            color: #fff;
            padding: 10px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .step-indicator {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .step-number {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            margin-right: 5px;
        }
        .step-text {
            font-size: 12px;
            line-height: 20px;
            margin-right: 10px;
        }
        .inactive-step {
            background-color: #d3d3d3;
            color: #666;
        }
        .active-step {
            background-color: #ff0000;
            color: #fff;
        }
        .active-step.step-text {
            background-color: transparent;
            color: #000;
            font-weight: bold;
        }
        .form-field {
            margin-bottom: 15px;
        }
        .form-field label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .form-field input, .form-field textarea, .form-field select {
            width: 100%;
            padding: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .form-field button {
            padding: 8px 16px;
            margin-left: 10px;
            background-color: #0070f0;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .form-field button:disabled {
            background-color: #d3d3d3;
            cursor: not-allowed;
        }
        .form-field .verified {
            background-color: #28a745;
        }
        .buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        .buttons button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .buttons .proceed {
            background-color: #0070f0;
            color: #fff;
            border: none;
        }
        .buttons .cancel {
            background-color: #fff;
            color: #ff0000;
            border: 1px solid #ff0000;
        }
        .buttons .previous {
            background-color: #fff;
            color: #000;
            border: 1px solid #d9d9d9;
        }
        .error {
            border-color: #ff0000 !important;
        }
        .error-message {
            color: #ff0000;
            font-size: 12px;
            margin-top: 5px;
        }
        .duplicate-warning {
            color: #ff0000;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .duplicate-warning::before {
            content: "⚠️";
            margin-right: 5px;
        }
        .duplicate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .duplicate-table th, .duplicate-table td {
            border: 1px solid #d9d9d9;
            padding: 8px;
            text-align: left;
        }
        .duplicate-table th {
            background-color: #f7f7f7;
        }
        .duplicate-table input[type="radio"] {
            margin-right: 5px;
        }
        .reason-field {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">NEW SUPPLIER REQUEST FORM</div>
        <div id="stepIndicator" class="step-indicator">
            <div id="step1Number" class="step-number active-step">1</div>
            <div id="step1Text" class="step-text active-step">SUPPLIER SPEND TYPE</div>
            <div id="step2Number" class="step-number inactive-step">2</div>
            <div id="step2Text" class="step-text inactive-step">SUPPLIER TYPE</div>
            <div id="step3Number" class="step-number inactive-step">3</div>
            <div id="step3Text" class="step-text inactive-step">GST & PAN VERIFICATION</div>
        </div>
        <div id="formContent">
            <!-- Step 1: Supplier Spend Type -->
            <div id="step1" class="step-content">
                <div class="form-field">
                    <label for="spendType">SUPPLIER SPEND TYPE: <span style="color: #ff0000;">*</span></label>
                    <select id="spendType">
                        <option value="">Select Spend Type</option>
                        <option value="Direct">Direct</option>
                        <option value="Indirect">Indirect</option>
                        <option value="Capital">Capital</option>
                        <option value="Value Fit">Value Fit</option>
                        <option value="Proto">Proto</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                    <div id="spendTypeError" class="error-message" style="display: none;">Please select a spend type.</div>
                </div>
            </div>
            <!-- Step 2: Supplier Type -->
            <div id="step2" class="step-content" style="display: none;">
                <div class="form-field">
                    <label for="supplierType">SUPPLIER TYPE: <span style="color: #ff0000;">*</span></label>
                    <select id="supplierType">
                        <option value="">Select Supplier Type</option>
                        <option value="LOCAL GST">LOCAL GST</option>
                        <option value="LOCAL NON-GST">LOCAL NON-GST</option>
                        <option value="IMPORT">IMPORT</option>
                    </select>
                    <div id="supplierTypeError" class="error-message" style="display: none;">Please select a supplier type.</div>
                </div>
            </div>
            <!-- Step 3: GST & PAN Verification -->
            <div id="step3" class="step-content" style="display: none;">
                <div id="duplicateWarning" class="duplicate-warning" style="display: none;">
                    Duplicate Found: Vendor already exists with same GSTIN/PAN
                </div>
                <table id="duplicateTable" class="duplicate-table" style="display: none;">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Vendor Code</th>
                            <th>Spend Type</th>
                            <th>Postal Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0001"></td>
                            <td>V0001</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0002"></td>
                            <td>V0002</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0003"></td>
                            <td>V0003</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                    </tbody>
                </table>
                <div id="reasonField" class="reason-field" style="display: none;">
                    <div class="form-field">
                        <label for="duplicateReason">PROVIDE REASON for creating Duplicate Vendor Code:</label>
                        <input type="text" id="duplicateReason" placeholder="Enter reason">
                        <div id="duplicateReasonError" class="error-message" style="display: none;">Please provide a reason for creating a duplicate vendor.</div>
                    </div>
                    <div class="form-field">
                        <label>DIFFERENT ADDRESS</label>
                        <input type="radio" name="differentAddress" value="Yes" onclick="updateProceedButton()"> Yes
                        <input type="radio" name="differentAddress" value="No" onclick="updateProceedButton()"> No
                    </div>
                </div>
                <div class="form-field">
                    <label for="gstin">GSTIN No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                    <button id="verifyButton" onclick="verifyGSTINAndPAN()">Verify</button>
                    <div id="gstinError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="pan" placeholder="Enter PAN Card No.">
                    <div id="panError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="duns">DUNS NUMBER</label>
                    <input type="text" id="duns" placeholder="Enter DUNS Number">
                </div>
                <div class="form-field">
                    <label for="address">Address</label>
                    <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
                </div>
            </div>
        </div>
        <div class="buttons">
            <button id="previousButton" class="previous" onclick="previousStep()" style="display: none;">Previous Step</button>
            <button id="nextButton" class="proceed" onclick="nextStep()">Next Step</button>
            <button id="proceedButton" class="proceed" onclick="proceed()" style="display: none;">Proceed</button>
            <button class="cancel" onclick="cancel()">Cancel</button>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let isVerified = false;
        let formData = {
            spendType: "",
            supplierType: "",
            gstin: "",
            pan: "",
            duns: "",
            address: "",
            isVerified: false,
            duplicateVendor: "",
            duplicateReason: "",
            differentAddress: ""
        };

        function updateStepIndicator() {
            document.getElementById("step1Number").className = "step-number " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step1Text").className = "step-text " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step2Number").className = "step-number " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step2Text").className = "step-text " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step3Number").className = "step-number " + (currentStep === 3 ? "active-step" : "inactive-step");
            document.getElementById("step3Text").className = "step-text " + (currentStep === 3 ? "active-step" : "inactive-step");

            document.getElementById("step1").style.display = currentStep === 1 ? "block" : "none";
            document.getElementById("step2").style.display = currentStep === 2 ? "block" : "none";
            document.getElementById("step3").style.display = currentStep === 3 ? "block" : "none";

            document.getElementById("previousButton").style.display = currentStep === 1 ? "none" : "inline-block";
            document.getElementById("nextButton").style.display = currentStep < 3 ? "inline-block" : "none";
            document.getElementById("proceedButton").style.display = currentStep === 3 ? "inline-block" : "none";
        }

        function nextStep() {
            if (currentStep === 1) {
                formData.spendType = document.getElementById("spendType").value;
                if (!formData.spendType) {
                    document.getElementById("spendType").classList.add("error");
                    document.getElementById("spendTypeError").style.display = "block";
                    return;
                }
                document.getElementById("spendType").classList.remove("error");
                document.getElementById("spendTypeError").style.display = "none";
                currentStep++;
            } else if (currentStep === 2) {
                formData.supplierType = document.getElementById("supplierType").value;
                if (!formData.supplierType) {
                    document.getElementById("supplierType").classList.add("error");
                    document.getElementById("supplierTypeError").style.display = "block";
                    return;
                }
                document.getElementById("supplierType").classList.remove("error");
                document.getElementById("supplierTypeError").style.display = "none";
                currentStep++;
                checkForDuplicates();
            }
            updateStepIndicator();
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                updateStepIndicator();
            }
        }

        function verifyGSTINAndPAN() {
            formData.gstin = document.getElementById("gstin").value.trim();
            formData.pan = document.getElementById("pan").value.trim();

            // Validate GSTIN format
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstin) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "GSTIN No. is required.";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else if (!gstinRegex.test(formData.gstin)) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "Invalid GSTIN format. It should be 15 characters (e.g., 27AICR9957Q1ZC).";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else {
                document.getElementById("gstin").classList.remove("error");
                document.getElementById("gstinError").style.display = "none";
            }

            // Validate PAN format
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!formData.pan) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "PAN Card No. is required.";
                document.getElementById("panError").style.display = "block";
                return;
            } else if (!panRegex.test(formData.pan)) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "Invalid PAN format. It should be 10 characters (e.g., AAICR9957Q).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }

            // Mock verification logic
            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                document.getElementById("verifyButton").textContent = "Verified";
                document.getElementById("verifyButton").classList.add("verified");
                document.getElementById("verifyButton").disabled = true;
                isVerified = true;
                formData.isVerified = true;
                checkForDuplicates();
                alert("GSTIN and PAN verified successfully!");
            } else {
                document.getElementById("verifyButton").textContent = "Verify";
                document.getElementById("verifyButton").classList.remove("verified");
                document.getElementById("verifyButton").disabled = false;
                isVerified = false;
                formData.isVerified = false;
                alert("Verification failed. Please check the GSTIN and PAN Card No.");
            }
        }

        function checkForDuplicates() {
            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                document.getElementById("duplicateWarning").style.display = "block";
                document.getElementById("duplicateTable").style.display = "table";
                document.getElementById("reasonField").style.display = "block";
            } else {
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
            }
        }

        function updateProceedButton() {
            formData.differentAddress = document.querySelector('input[name="differentAddress"]:checked')?.value || "";
        }

        function proceed() {
            formData.gstin = document.getElementById("gstin").value.trim();
            formData.pan = document.getElementById("pan").value.trim();
            formData.duns = document.getElementById("duns").value.trim();
            formData.address = document.getElementById("address").value.trim();
            formData.duplicateVendor = document.querySelector('input[name="duplicateVendor"]:checked')?.value || "";
            formData.duplicateReason = document.getElementById("duplicateReason")?.value.trim() || "";
            formData.differentAddress = document.querySelector('input[name="differentAddress"]:checked')?.value || "";

            if (!formData.gstin || !formData.pan) {
                alert("Please fill in all required fields (GSTIN and PAN Card No.) before proceeding.");
                return;
            }

            if (!formData.isVerified) {
                alert("Please verify the GSTIN and PAN Card No. before proceeding.");
                return;
            }

            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                if (!formData.duplicateVendor) {
                    alert("Please select a duplicate vendor.");
                    return;
                }
                if (!formData.duplicateReason) {
                    document.getElementById("duplicateReason").classList.add("error");
                    document.getElementById("duplicateReasonError").style.display = "block";
                    return;
                }
                document.getElementById("duplicateReason").classList.remove("error");
                document.getElementById("duplicateReasonError").style.display = "none";

                if (!formData.differentAddress) {
                    alert("Please specify if the address is different.");
                    return;
                }
            }

            // Send data back to the parent window
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: "NEW_SUPPLIER",
                    data: formData
                }, "*");
            }

            alert("New Supplier Request created successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }

        // Initialize the form
        updateStepIndicator();
    </script>
</body>
</html>
            `;

            // Open the new tab
            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();

                // Listen for messages from the new tab
                window.addEventListener("message", (event) => {
                    if (event.data.type === "NEW_SUPPLIER") {
                        this._handleNewSupplier(event.data.data);
                    }
                });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleNewSupplier: function (formData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = parseInt(aItems[0].supplierRequestId.replace("R", ""), 10);
            var sNewId = "R" + (iLastId + 1).toString().padStart(8, "0");

            var oDate = new Date();
            var sCurrentDate = oDate.getDate() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getFullYear();

            var oNewSupplier = {
                supplierRequestId: sNewId,
                supplierName: "New Supplier " + sNewId,
                type: formData.spendType,
                requestCreationDate: sCurrentDate,
                requestAging: "0 Days",
                lastActionDate: sCurrentDate,
                lastActionAging: "0 Days",
                stage: "SUPPLIER",
                status: "DRAFT"
            };

            aItems.unshift(oNewSupplier);
            this._updateTileCounts(oData);
            oModel.setData(oData);

            this._originalItems = JSON.parse(JSON.stringify(oData.items));

            var oTable = this.byId("productsTable");
            oTable.getBinding("items").refresh();

            MessageToast.show("New Supplier Request created successfully! ID: " + sNewId);
        },

        onDownloadPress: function () {
            var oModel = this.getView().getModel("products");
            var aItems = oModel.getProperty("/items");

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to download.");
                return;
            }

            // Define CSV headers
            var aHeaders = [
                "Supplier Request ID",
                "Supplier Name",
                "Type",
                "Request Creation Date",
                "Request Aging",
                "Last Action Date",
                "Last Action Aging",
                "Stage",
                "Status"
            ];

            // Map items to CSV rows
            var aRows = aItems.map(function (oItem) {
                return [
                    oItem.supplierRequestId,
                    oItem.supplierName,
                    oItem.type,
                    oItem.requestCreationDate,
                    oItem.requestAging,
                    oItem.lastActionDate,
                    oItem.lastActionAging,
                    oItem.stage,
                    oItem.status
                ].map(function (sValue) {
                    return '"' + (sValue || "").replace(/"/g, '""') + '"'; // Escape quotes
                }).join(",");
            });

            // Combine headers and rows
            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");

            // Create a Blob with the CSV content
            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

            // Create a temporary link to trigger the download
            var oLink = document.createElement("a");
            oLink.setAttribute("href", sURL);
            oLink.setAttribute("download", "Supplier_Registration_Data.csv");
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            MessageToast.show("Table data downloaded as CSV.");
        },

        onResetSort: function () {
            for (var sKey in this._sortStates) {
                if (this._sortStates.hasOwnProperty(sKey)) {
                    this._sortStates[sKey] = false;
                    this._updateSortIcon(sKey, false);
                }
            }

            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            oData.items = JSON.parse(JSON.stringify(this._originalItems));
            oModel.setData(oData);

            this._centerTiles();
            this._refreshTable();

            MessageToast.show("Sort state reset to original.");
        }
    });
});











// NEW SUPPLIER-REQUEST FORM
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("com.tableentry.tablestructure.controller.Table_Entry", {
        onInit: function () {
            var oData = {
                items: [
                    { supplierRequestId: "R35", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-01-2024", requestAging: "10 Days", lastActionDate: "11-10-2024", lastActionAging: "15 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R18", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-02-2024", requestAging: "20 Days", lastActionDate: "12-10-2024", lastActionAging: "20 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R17", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-03-2024", requestAging: "30 Days", lastActionDate: "13-10-2024", lastActionAging: "30 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R16", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-04-2024", requestAging: "40 Days", lastActionDate: "14-10-2024", lastActionAging: "40 Days", stage: "BUYER", status: "CANCELLED" },
                    { supplierRequestId: "R15", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-05-2024", requestAging: "50 Days", lastActionDate: "15-10-2024", lastActionAging: "50 Days", stage: "ON BOARDING", status: "VENDOR CREATED" },
                    { supplierRequestId: "R14", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-06-2024", requestAging: "60 Days", lastActionDate: "16-10-2024", lastActionAging: "25 Days", stage: "ON BOARDING", status: "CMDM UPDATE PENDING" },
                    { supplierRequestId: "R13", supplierName: "ABC Pvt Ltd", type: "Indirect", requestCreationDate: "12-07-2024", requestAging: "70 Days", lastActionDate: "17-10-2024", lastActionAging: "35 Days", stage: "ON BOARDING", status: "FINANCE UPDATE PENDING" },
                    { supplierRequestId: "R12", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-08-2024", requestAging: "80 Days", lastActionDate: "18-10-2024", lastActionAging: "55 Days", stage: "ON BOARDING", status: "PURCHASE APPROVAL PENDING" },
                    { supplierRequestId: "R11", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-09-2024", requestAging: "90 Days", lastActionDate: "19-10-2024", lastActionAging: "45 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R13", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R10", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R9", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-11-2024", requestAging: "110 Days", lastActionDate: "21-10-2024", lastActionAging: "65 Days", stage: "BUYER", status: "DRAFT" }
                ],
                draftCount: 0,
                myPendingCount: 0,
                pendingWithSupplierCount: 0,
                onBoardingCount: 0,
                allCount: 0
            };

            this._sortStates = {
                supplierRequestId: false,
                supplierName: false,
                type: false,
                requestCreationDate: false,
                requestAging: false,
                lastActionDate: false,
                lastActionAging: false,
                stage: false,
                status: false
            };
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._updateTileCounts(oData);
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "products");

            // Initialize the new supplier form model
            var oNewSupplierData = {
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                duns: "",
                address: "",
                isVerified: false,
                currentStep: 1
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            var sStyle = `
                .centeredGrid {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .tileLayout {
                    min-width: 150px;
                    text-align: center;
                }
                #_IDGenToolbar {
                    background-color: #f7f7f7;
                    padding: 5px 10px;
                    border-bottom: 1px solid #d9d9d9;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                #_IDGenToolbar .sapMLabel {
                    font-weight: bold;
                    color: #333;
                    margin-right: 5px;
                    white-space: nowrap;
                    overflow: visible;
                    text-overflow: clip;
                    min-width: 120px;
                }
                #_IDGenToolbar .sapMInputBaseInner {
                    padding: 0 5px;
                    width: 100%;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMComboBox {
                    padding: 0 5px;
                    width: 100%;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMBtn {
                    margin-left: 5px;
                    padding: 5px 10px;
                    min-width: 150px;
                }
                #_IDGenToolbar .sapMTBSpacer {
                    flex-grow: 1;
                }
                #actionToolbar {
                    background-color: #f7f7f7;
                    padding: 5px 10px;
                    border-bottom: 1px solid #d9d9d9;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                #actionToolbar .sapMBtn {
                    margin-left: 5px;
                    padding: 5px 10px;
                    min-width: 150px;
                }
                .sapMText {
                    visibility: visible !important;
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                }
                .sapMListTblHeader .sapMText {
                    font-weight: bold;
                    color: #333;
                    padding: 5px;
                }
                .sapMListTblCell {
                    min-width: 120px;
                }
                .sapUiIcon {
                    margin-left: 5px;
                    cursor: pointer;
                }
                .sapUiIcon[id*="sortIcon_"] {
                    color: #ff0000 !important;
                }
                .stepNumber {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 20px;
                    font-size: 12px;
                }
                .stepText {
                    font-size: 12px;
                    line-height: 20px;
                }
                .inactiveStep {
                    background-color: #d3d3d3;
                    color: #666;
                }
                .activeStep {
                    background-color: #ff0000;
                    color: #fff;
                }
                .activeStep.stepText {
                    background-color: transparent;
                    color: #000;
                    font-weight: bold;
                }
                .form-container {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    border: 1px solid #d9d9d9;
                    border-radius: 8px;
                    background-color: #fff;
                }
                .header {
                    background-color: #ff0000;
                    color: #fff;
                    padding: 10px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .step-indicator {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .form-field {
                    margin-bottom: 15px;
                }
                .form-field label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .form-field input, .form-field textarea, .form-field select {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                }
                .form-field button {
                    padding: 8px 16px;
                    margin-left: 10px;
                    background-color: #0070f0;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .form-field button:disabled {
                    background-color: #d3d3d3;
                    cursor: not-allowed;
                }
                .form-field .verified {
                    background-color: #28a745;
                }
                .buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .buttons button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .buttons .proceed {
                    background-color: #0070f0;
                    color: #fff;
                    border: none;
                }
                .buttons .cancel {
                    background-color: #fff;
                    color: #ff0000;
                    border: 1px solid #ff0000;
                }
                .buttons .previous {
                    background-color: #fff;
                    color: #000;
                    border: 1px solid #d9d9d9;
                }
                .error {
                    border-color: #ff0000 !important;
                }
                .error-message {
                    color: #ff0000;
                    font-size: 12px;
                    margin-top: 5px;
                }
                .duplicate-warning {
                    color: #ff0000;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                .duplicate-warning::before {
                    content: "⚠️";
                    margin-right: 5px;
                }
                .duplicate-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                .duplicate-table th, .duplicate-table td {
                    border: 1px solid #d9d9d9;
                    padding: 8px;
                    text-align: left;
                }
                .duplicate-table th {
                    background-color: #f7f7f7;
                }
                .duplicate-table input[type="radio"] {
                    margin-right: 5px;
                }
                .reason-field {
                    margin-top: 10px;
                }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        _updateTileCounts: function (oData) {
            var aItems = oData.items;
            oData.draftCount = aItems.filter(item => item.status === "DRAFT").length;
            oData.myPendingCount = aItems.filter(item => item.stage === "BUYER").length;
            oData.pendingWithSupplierCount = aItems.filter(item => item.stage === "SUPPLIER").length;
            oData.onBoardingCount = aItems.filter(item => item.stage === "ON BOARDING").length;
            oData.allCount = aItems.length;
        },

        _applyFilters: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sSupplierId = this.byId("supplierIdInput").getValue();
            if (sSupplierId) {
                aFilters.push(new Filter("supplierRequestId", FilterOperator.Contains, sSupplierId));
            }

            var sSupplierType = this.byId("supplierTypeComboBox").getSelectedKey();
            if (sSupplierType && sSupplierType !== "All") {
                aFilters.push(new Filter("type", FilterOperator.EQ, sSupplierType));
            }

            var sStage = this.byId("stageComboBox").getSelectedKey();
            if (sStage && sStage !== "All") {
                aFilters.push(new Filter("stage", FilterOperator.EQ, sStage));
            }

            var sStatus = this.byId("statusComboBox").getSelectedKey();
            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            if (aFilters.length > 0) {
                oBinding.filter(new Filter({
                    filters: aFilters,
                    and: true
                }));
            } else {
                oBinding.filter([]);
            }
        },

        onSupplierIdChange: function (oEvent) {
            this._applyFilters();
        },

        onSupplierTypeChange: function (oEvent) {
            this._applyFilters();
        },

        onStageChange: function (oEvent) {
            this._applyFilters();
        },

        onStatusChange: function (oEvent) {
            this._applyFilters();
        },

        _refreshTable: function () {
            var oTable = this.byId("productsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh(true);
                }
            }
        },

        _centerTiles: function () {
            var oGrid = this.byId("tileGrid");
            if (oGrid) {
                oGrid.addStyleClass("centeredGrid");
            }
        },

        _parseDate: function (sDate) {
            if (!sDate) return new Date(0);
            var [day, month, year] = sDate.split("-").map(Number);
            return new Date(year, month - 1, day);
        },

        _updateSortIcon: function (sColumnKey, bDescending) {
            var sIconId = "sortIcon_" + sColumnKey;
            var oIcon = this.byId(sIconId);
            if (oIcon) {
                oIcon.setSrc(bDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
            }
        },

        onSortSupplierRequestId: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.supplierRequestId = !this._sortStates.supplierRequestId;
            var bDescending = this._sortStates.supplierRequestId;

            try {
                var aSupplierRequestIds = aItems.map(item => item.supplierRequestId);
                aSupplierRequestIds.sort((a, b) => {
                    var aNum = parseInt(a.replace("R", ""), 10) || 0;
                    var bNum = parseInt(b.replace("R", ""), 10) || 0;
                    return bDescending ? bNum - aNum : aNum - bNum;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.supplierRequestId = aSupplierRequestIds[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("supplierRequestId", bDescending);
                MessageToast.show(`Sorted Supplier Request ID column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Supplier Request ID: " + e.message);
            }
        },

        onSortSupplierName: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.supplierName = !this._sortStates.supplierName;
            var bDescending = this._sortStates.supplierName;

            try {
                var aSupplierNames = aItems.map(item => item.supplierName);
                aSupplierNames.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.supplierName = aSupplierNames[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("supplierName", bDescending);
                MessageToast.show(`Sorted Supplier Name column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Supplier Name: " + e.message);
            }
        },

        onSortType: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.type = !this._sortStates.type;
            var bDescending = this._sortStates.type;

            try {
                var aTypes = aItems.map(item => item.type);
                aTypes.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.type = aTypes[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("type", bDescending);
                MessageToast.show(`Sorted Type column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Type: " + e.message);
            }
        },

        onSortRequestCreationDate: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.requestCreationDate = !this._sortStates.requestCreationDate;
            var bDescending = this._sortStates.requestCreationDate;

            try {
                var aRequestCreationDates = aItems.map(item => item.requestCreationDate);
                aRequestCreationDates.sort((a, b) => {
                    var aDate = this._parseDate(a);
                    var bDate = this._parseDate(b);
                    return bDescending ? bDate - aDate : aDate - bDate;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.requestCreationDate = aRequestCreationDates[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("requestCreationDate", bDescending);
                MessageToast.show(`Sorted Request Creation Date column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Request Creation Date: " + e.message);
            }
        },

        onSortRequestAging: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.requestAging = !this._sortStates.requestAging;
            var bDescending = this._sortStates.requestAging;

            try {
                var aRequestAgings = aItems.map(item => item.requestAging);
                aRequestAgings.sort((a, b) => {
                    var aDays = parseInt(a.split(" ")[0], 10) || 0;
                    var bDays = parseInt(b.split(" ")[0], 10) || 0;
                    return bDescending ? bDays - aDays : aDays - bDays;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.requestAging = aRequestAgings[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("requestAging", bDescending);
                MessageToast.show(`Sorted Request Aging column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Request Aging: " + e.message);
            }
        },

        onSortLastActionDate: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.lastActionDate = !this._sortStates.lastActionDate;
            var bDescending = this._sortStates.lastActionDate;

            try {
                var aLastActionDates = aItems.map(item => item.lastActionDate);
                aLastActionDates.sort((a, b) => {
                    var aDate = this._parseDate(a);
                    var bDate = this._parseDate(b);
                    return bDescending ? bDate - aDate : aDate - bDate;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.lastActionDate = aLastActionDates[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("lastActionDate", bDescending);
                MessageToast.show(`Sorted Last Action Date column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Last Action Date: " + e.message);
            }
        },

        onSortLastActionAging: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.lastActionAging = !this._sortStates.lastActionAging;
            var bDescending = this._sortStates.lastActionAging;

            try {
                var aLastActionAgings = aItems.map(item => item.lastActionAging);
                aLastActionAgings.sort((a, b) => {
                    var aDays = parseInt(a.split(" ")[0], 10) || 0;
                    var bDays = parseInt(b.split(" ")[0], 10) || 0;
                    return bDescending ? bDays - aDays : aDays - bDays;
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.lastActionAging = aLastActionAgings[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("lastActionAging", bDescending);
                MessageToast.show(`Sorted Last Action Aging column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Last Action Aging: " + e.message);
            }
        },

        onSortStage: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.stage = !this._sortStates.stage;
            var bDescending = this._sortStates.stage;

            try {
                var aStages = aItems.map(item => item.stage);
                aStages.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.stage = aStages[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("stage", bDescending);
                MessageToast.show(`Sorted Stage column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Stage: " + e.message);
            }
        },

        onSortStatus: function (oEvent) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates.status = !this._sortStates.status;
            var bDescending = this._sortStates.status;

            try {
                var aStatuses = aItems.map(item => item.status);
                aStatuses.sort((a, b) => {
                    var aValue = a || "";
                    var bValue = b || "";
                    return bDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                });

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item.status = aStatuses[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon("status", bDescending);
                MessageToast.show(`Sorted Status column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show("Error while sorting Status: " + e.message);
            }
        },

        onTilePress: function (oEvent) {
            var oTile = oEvent.getSource();
            var sTileId = oTile.getId();
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sTileId.includes("draftTile")) {
                aFilters.push(new Filter("status", FilterOperator.EQ, "DRAFT"));
            } else if (sTileId.includes("myPendingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "BUYER"));
            } else if (sTileId.includes("pendingWithSupplierTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "SUPPLIER"));
            } else if (sTileId.includes("onBoardingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "ON BOARDING"));
            } else if (sTileId.includes("allTile")) {
                oBinding.filter([]);
                this.byId("supplierIdInput").setValue("");
                this.byId("supplierTypeComboBox").setSelectedKey("All");
                this.byId("stageComboBox").setSelectedKey("All");
                this.byId("statusComboBox").setSelectedKey("All");
                return;
            }

            oBinding.filter(aFilters);
            this.byId("supplierIdInput").setValue("");
            this.byId("supplierTypeComboBox").setSelectedKey("All");
            this.byId("stageComboBox").setSelectedKey("All");
            this.byId("statusComboBox").setSelectedKey("All");
        },

        onOrderPress: function () {
            // Open the new supplier form in a new tab
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setProperty("/currentStep", 1);
            oNewSupplierModel.setProperty("/spendType", "");
            oNewSupplierModel.setProperty("/supplierType", "");
            oNewSupplierModel.setProperty("/gstin", "");
            oNewSupplierModel.setProperty("/pan", "");
            oNewSupplierModel.setProperty("/duns", "");
            oNewSupplierModel.setProperty("/address", "");
            oNewSupplierModel.setProperty("/isVerified", false);

            // Generate the HTML content for the new tab
            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .form-container {
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            background-color: #fff;
        }
        .header {
            background-color: #ff0000;
            color: #fff;
            padding: 10px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .step-indicator {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .step-number {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            margin-right: 5px;
        }
        .step-text {
            font-size: 12px;
            line-height: 20px;
            margin-right: 10px;
        }
        .inactive-step {
            background-color: #d3d3d3;
            color: #666;
        }
        .active-step {
            background-color: #ff0000;
            color: #fff;
        }
        .active-step.step-text {
            background-color: transparent;
            color: #000;
            font-weight: bold;
        }
        .form-field {
            margin-bottom: 15px;
        }
        .form-field label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .form-field input, .form-field textarea, .form-field select {
            width: 100%;
            padding: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .form-field button {
            padding: 8px 16px;
            margin-left: 10px;
            background-color: #0070f0;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .form-field button:disabled {
            background-color: #d3d3d3;
            cursor: not-allowed;
        }
        .form-field .verified {
            background-color: #28a745;
        }
        .buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        .buttons button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .buttons .proceed {
            background-color: #0070f0;
            color: #fff;
            border: none;
        }
        .buttons .cancel {
            background-color: #fff;
            color: #ff0000;
            border: 1px solid #ff0000;
        }
        .buttons .previous {
            background-color: #fff;
            color: #000;
            border: 1px solid #d9d9d9;
        }
        .error {
            border-color: #ff0000 !important;
        }
        .error-message {
            color: #ff0000;
            font-size: 12px;
            margin-top: 5px;
        }
        .duplicate-warning {
            color: #ff0000;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .duplicate-warning::before {
            content: "⚠️";
            margin-right: 5px;
        }
        .duplicate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .duplicate-table th, .duplicate-table td {
            border: 1px solid #d9d9d9;
            padding: 8px;
            text-align: left;
        }
        .duplicate-table th {
            background-color: #f7f7f7;
        }
        .duplicate-table input[type="radio"] {
            margin-right: 5px;
        }
        .reason-field {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">NEW SUPPLIER REQUEST FORM</div>
        <div id="stepIndicator" class="step-indicator">
            <div id="step1Number" class="step-number active-step">1</div>
            <div id="step1Text" class="step-text active-step">SUPPLIER SPEND TYPE</div>
            <div id="step2Number" class="step-number inactive-step">2</div>
            <div id="step2Text" class="step-text inactive-step">SUPPLIER TYPE</div>
            <div id="step3Number" class="step-number inactive-step">3</div>
            <div id="step3Text" class="step-text inactive-step">GST & PAN VERIFICATION</div>
        </div>
        <div id="formContent">
            <!-- Step 1: Supplier Spend Type -->
            <div id="step1" class="step-content">
                <div class="form-field">
                    <label for="spendType">SUPPLIER SPEND TYPE: <span style="color: #ff0000;">*</span></label>
                    <select id="spendType">
                        <option value="">Select Spend Type</option>
                        <option value="Direct">Direct</option>
                        <option value="Indirect">Indirect</option>
                        <option value="Capital">Capital</option>
                        <option value="Value Fit">Value Fit</option>
                        <option value="Proto">Proto</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                    <div id="spendTypeError" class="error-message" style="display: none;">Please select a spend type.</div>
                </div>
            </div>
            <!-- Step 2: Supplier Type -->
            <div id="step2" class="step-content" style="display: none;">
                <div class="form-field">
                    <label for="supplierType">SUPPLIER TYPE: <span style="color: #ff0000;">*</span></label>
                    <select id="supplierType">
                        <option value="">Select Supplier Type</option>
                        <option value="LOCAL GST">LOCAL GST</option>
                        <option value="LOCAL NON-GST">LOCAL NON-GST</option>
                        <option value="IMPORT">IMPORT</option>
                    </select>
                    <div id="supplierTypeError" class="error-message" style="display: none;">Please select a supplier type.</div>
                </div>
            </div>
            <!-- Step 3: GST & PAN Verification -->
            <div id="step3" class="step-content" style="display: none;">
                <div id="duplicateWarning" class="duplicate-warning" style="display: none;">
                    Duplicate Found: Vendor already exists with same GSTIN/PAN
                </div>
                <table id="duplicateTable" class="duplicate-table" style="display: none;">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Vendor Code</th>
                            <th>Spend Type</th>
                            <th>Postal Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0001"></td>
                            <td>V0001</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0002"></td>
                            <td>V0002</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                        <tr>
                            <td><input type="radio" name="duplicateVendor" value="V0003"></td>
                            <td>V0003</td>
                            <td>Direct</td>
                            <td>122001</td>
                        </tr>
                    </tbody>
                </table>
                <div id="reasonField" class="reason-field" style="display: none;">
                    <div class="form-field">
                        <label for="duplicateReason">PROVIDE REASON for creating Duplicate Vendor Code:</label>
                        <input type="text" id="duplicateReason" placeholder="Enter reason">
                        <div id="duplicateReasonError" class="error-message" style="display: none;">Please provide a reason for creating a duplicate vendor.</div>
                    </div>
                    <div class="form-field">
                        <label>DIFFERENT ADDRESS</label>
                        <input type="radio" name="differentAddress" value="Yes" onclick="updateProceedButton()"> Yes
                        <input type="radio" name="differentAddress" value="No" onclick="updateProceedButton()"> No
                    </div>
                </div>
                <div class="form-field">
                    <label for="gstin">GSTIN No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                    <button id="verifyButton" onclick="verifyGSTINAndPAN()">Verify</button>
                    <div id="gstinError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="pan" placeholder="Enter PAN Card No.">
                    <div id="panError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="duns">DUNS NUMBER</label>
                    <input type="text" id="duns" placeholder="Enter DUNS Number">
                </div>
                <div class="form-field">
                    <label for="address">Address</label>
                    <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
                </div>
            </div>
        </div>
        <div class="buttons">
            <button id="previousButton" class="previous" onclick="previousStep()" style="display: none;">Previous Step</button>
            <button id="nextButton" class="proceed" onclick="nextStep()">Next Step</button>
            <button id="proceedButton" class="proceed" onclick="proceed()" style="display: none;">Proceed</button>
            <button class="cancel" onclick="cancel()">Cancel</button>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let isVerified = false;
        let formData = {
            spendType: "",
            supplierType: "",
            gstin: "",
            pan: "",
            duns: "",
            address: "",
            isVerified: false,
            duplicateVendor: "",
            duplicateReason: "",
            differentAddress: ""
        };

        function updateStepIndicator() {
            document.getElementById("step1Number").className = "step-number " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step1Text").className = "step-text " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step2Number").className = "step-number " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step2Text").className = "step-text " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step3Number").className = "step-number " + (currentStep === 3 ? "active-step" : "inactive-step");
            document.getElementById("step3Text").className = "step-text " + (currentStep === 3 ? "active-step" : "inactive-step");

            document.getElementById("step1").style.display = currentStep === 1 ? "block" : "none";
            document.getElementById("step2").style.display = currentStep === 2 ? "block" : "none";
            document.getElementById("step3").style.display = currentStep === 3 ? "block" : "none";

            document.getElementById("previousButton").style.display = currentStep === 1 ? "none" : "inline-block";
            document.getElementById("nextButton").style.display = currentStep < 3 ? "inline-block" : "none";
            document.getElementById("proceedButton").style.display = currentStep === 3 ? "inline-block" : "none";
        }

        function nextStep() {
            if (currentStep === 1) {
                formData.spendType = document.getElementById("spendType").value;
                if (!formData.spendType) {
                    document.getElementById("spendType").classList.add("error");
                    document.getElementById("spendTypeError").style.display = "block";
                    return;
                }
                document.getElementById("spendType").classList.remove("error");
                document.getElementById("spendTypeError").style.display = "none";
                currentStep++;
            } else if (currentStep === 2) {
                formData.supplierType = document.getElementById("supplierType").value;
                if (!formData.supplierType) {
                    document.getElementById("supplierType").classList.add("error");
                    document.getElementById("supplierTypeError").style.display = "block";
                    return;
                }
                document.getElementById("supplierType").classList.remove("error");
                document.getElementById("supplierTypeError").style.display = "none";
                currentStep++;
                checkForDuplicates();
            }
            updateStepIndicator();
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                updateStepIndicator();
            }
        }

        function verifyGSTINAndPAN() {
            formData.gstin = document.getElementById("gstin").value.trim();
            formData.pan = document.getElementById("pan").value.trim();

            // Validate GSTIN format
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstin) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "GSTIN No. is required.";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else if (!gstinRegex.test(formData.gstin)) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "Invalid GSTIN format. It should be 15 characters (e.g., 27AICR9957Q1ZC).";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else {
                document.getElementById("gstin").classList.remove("error");
                document.getElementById("gstinError").style.display = "none";
            }

            // Validate PAN format
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!formData.pan) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "PAN Card No. is required.";
                document.getElementById("panError").style.display = "block";
                return;
            } else if (!panRegex.test(formData.pan)) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "Invalid PAN format. It should be 10 characters (e.g., AAICR9957Q).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }

            // Mock verification logic
            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                document.getElementById("verifyButton").textContent = "Verified";
                document.getElementById("verifyButton").classList.add("verified");
                document.getElementById("verifyButton").disabled = true;
                isVerified = true;
                formData.isVerified = true;
                checkForDuplicates();
                alert("GSTIN and PAN verified successfully!");
            } else {
                document.getElementById("verifyButton").textContent = "Verify";
                document.getElementById("verifyButton").classList.remove("verified");
                document.getElementById("verifyButton").disabled = false;
                isVerified = false;
                formData.isVerified = false;
                alert("Verification failed. Please check the GSTIN and PAN Card No.");
            }
        }

        function checkForDuplicates() {
            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                document.getElementById("duplicateWarning").style.display = "block";
                document.getElementById("duplicateTable").style.display = "table";
                document.getElementById("reasonField").style.display = "block";
            } else {
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
            }
        }

        function updateProceedButton() {
            formData.differentAddress = document.querySelector('input[name="differentAddress"]:checked')?.value || "";
        }

        function proceed() {
            formData.gstin = document.getElementById("gstin").value.trim();
            formData.pan = document.getElementById("pan").value.trim();
            formData.duns = document.getElementById("duns").value.trim();
            formData.address = document.getElementById("address").value.trim();
            formData.duplicateVendor = document.querySelector('input[name="duplicateVendor"]:checked')?.value || "";
            formData.duplicateReason = document.getElementById("duplicateReason")?.value.trim() || "";
            formData.differentAddress = document.querySelector('input[name="differentAddress"]:checked')?.value || "";

            if (!formData.gstin || !formData.pan) {
                alert("Please fill in all required fields (GSTIN and PAN Card No.) before proceeding.");
                return;
            }

            if (!formData.isVerified) {
                alert("Please verify the GSTIN and PAN Card No. before proceeding.");
                return;
            }

            if (formData.gstin === "27AICR9957Q1ZC" && formData.pan === "AAICR9957Q") {
                if (!formData.duplicateVendor) {
                    alert("Please select a duplicate vendor.");
                    return;
                }
                if (!formData.duplicateReason) {
                    document.getElementById("duplicateReason").classList.add("error");
                    document.getElementById("duplicateReasonError").style.display = "block";
                    return;
                }
                document.getElementById("duplicateReason").classList.remove("error");
                document.getElementById("duplicateReasonError").style.display = "none";

                if (!formData.differentAddress) {
                    alert("Please specify if the address is different.");
                    return;
                }
            }

            // Send data back to the parent window
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: "NEW_SUPPLIER",
                    data: formData
                }, "*");
            }

            alert("New Supplier Request created successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }

        // Initialize the form
        updateStepIndicator();
    </script>
</body>
</html>
            `;

            // Open the new tab
            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();

                // Listen for messages from the new tab
                window.addEventListener("message", (event) => {
                    if (event.data.type === "NEW_SUPPLIER") {
                        this._handleNewSupplier(event.data.data);
                    }
                });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleNewSupplier: function (formData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = parseInt(aItems[0].supplierRequestId.replace("R", ""), 10);
            var sNewId = "R" + (iLastId + 1).toString().padStart(8, "0");

            var oDate = new Date();
            var sCurrentDate = oDate.getDate() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getFullYear();

            var oNewSupplier = {
                supplierRequestId: sNewId,
                supplierName: "New Supplier " + sNewId,
                type: formData.spendType,
                requestCreationDate: sCurrentDate,
                requestAging: "0 Days",
                lastActionDate: sCurrentDate,
                lastActionAging: "0 Days",
                stage: "SUPPLIER",
                status: "DRAFT"
            };

            aItems.unshift(oNewSupplier);
            this._updateTileCounts(oData);
            oModel.setData(oData);

            this._originalItems = JSON.parse(JSON.stringify(oData.items));

            var oTable = this.byId("productsTable");
            oTable.getBinding("items").refresh();

            MessageToast.show("New Supplier Request created successfully! ID: " + sNewId);
        },

        onDownloadPress: function () {
            var oModel = this.getView().getModel("products");
            var aItems = oModel.getProperty("/items");

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to download.");
                return;
            }

            // Define CSV headers
            var aHeaders = [
                "Supplier Request ID",
                "Supplier Name",
                "Type",
                "Request Creation Date",
                "Request Aging",
                "Last Action Date",
                "Last Action Aging",
                "Stage",
                "Status"
            ];

            // Map items to CSV rows
            var aRows = aItems.map(function (oItem) {
                return [
                    oItem.supplierRequestId,
                    oItem.supplierName,
                    oItem.type,
                    oItem.requestCreationDate,
                    oItem.requestAging,
                    oItem.lastActionDate,
                    oItem.lastActionAging,
                    oItem.stage,
                    oItem.status
                ].map(function (sValue) {
                    return '"' + (sValue || "").replace(/"/g, '""') + '"'; // Escape quotes
                }).join(",");
            });

            // Combine headers and rows
            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");

            // Create a Blob with the CSV content
            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

            // Create a temporary link to trigger the download
            var oLink = document.createElement("a");
            oLink.setAttribute("href", sURL);
            oLink.setAttribute("download", "Supplier_Registration_Data.csv");
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            MessageToast.show("Table data downloaded as CSV.");
        },

        onResetSort: function () {
            for (var sKey in this._sortStates) {
                if (this._sortStates.hasOwnProperty(sKey)) {
                    this._sortStates[sKey] = false;
                    this._updateSortIcon(sKey, false);
                }
            }

            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            oData.items = JSON.parse(JSON.stringify(this._originalItems));
            oModel.setData(oData);

            this._centerTiles();
            this._refreshTable();

            MessageToast.show("Sort state reset to original.");
        }
    });
});

