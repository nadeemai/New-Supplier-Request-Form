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
        /**
         * Lifecycle method called when the controller is initialized
         */
        onInit: function () {
            // Initial data for the table
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
                    { supplierRequestId: "R10", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R9", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-11-2024", requestAging: "110 Days", lastActionDate: "21-10-2024", lastActionAging: "65 Days", stage: "BUYER", status: "DRAFT" }
                ],
                draftCount: 0,
                myPendingCount: 0,
                pendingWithSupplierCount: 0,
                onBoardingCount: 0,
                allCount: 0
            };

            // Track sorting states for each column
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

            // Store original items for reset functionality
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._updateTileCounts(oData);

            // Set the main model
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "products");

            // Initialize new supplier form model
            var oNewSupplierData = {
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                address: "",
                isVerified: false,
                currentStep: 1
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            // Initialize verification model
            var oVerificationData = {
                gstin: "",
                pan: "",
                isVerified: false,
                duplicateVendor: {
                    V0001: false,
                    V0002: false,
                    V0003: false
                },
                duplicateReason: "",
                differentAddress: ""
            };
            var oVerificationModel = new JSONModel(oVerificationData);
            this.getView().setModel(oVerificationModel, "verification");

            // Apply custom CSS
            this._addCustomCSS();
        },

        /**
         * Adds custom CSS to the document head
         */
        _addCustomCSS: function () {
            var sStyle = `
                .centeredGrid { display: flex; justify-content: center; flex-wrap: wrap; }
                .tileLayout { min-width: 150px; text-align: center; }
                #_IDGenToolbar { background-color: #f7f7f7; padding: 5px 10px; border-bottom: 1px solid #d9d9d9; display: flex; align-items: center; width: 100%; }
                #_IDGenToolbar .sapMLabel { font-weight: bold; color: #333; margin-right: 5px; white-space: nowrap; overflow: visible; text-overflow: clip; min-width: 120px; }
                #_IDGenToolbar .sapMInputBaseInner { padding: 0 5px; width: 100%; min-width: 150px; }
                #_IDGenToolbar .sapMComboBox { padding: 0 5px; width: 100%; min-width: 150px; }
                #_IDGenToolbar .sapMBtn { margin-left: 5px; padding: 5px 10px; min-width: 150px; }
                #_IDGenToolbar .sapMTBSpacer { flex-grow: 1; }
                #actionToolbar { background-color: #f7f7f7; padding: 5px 10px; border-bottom: 1px solid #d9d9d9; display: flex; align-items: center; width: 100%; }
                #actionToolbar .sapMBtn { margin-left: 5px; padding: 5px 10px; min-width: 150px; }
                .sapMText { visibility: visible !important; white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
                .sapMListTblHeader .sapMText { font-weight: bold; color: #333; padding: 5px; }
                .sapMListTblCell { min-width: 120px; }
                .sapUiIcon { margin-left: 5px; cursor: pointer; }
                .sapUiIcon[id*="sortIcon_"] { color: #ff0000 !important; }
                .stepNumber { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; }
                .stepText { font-size: 12px; line-height: 20px; }
                .inactiveStep { background-color: #d3d3d3; color: #666; }
                .activeStep { background-color: #ff0000; color: #fff; }
                .activeStep.stepText { background-color: transparent; color: #000; font-weight: bold; }
                .form-container { padding: 20px; max-width: 800px; margin: 0 auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
                .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
                .step-indicator { display: flex; align-items: center; margin-bottom: 20px; }
                .form-field { margin-bottom: 15px; }
                .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
                .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
                .form-field .input-with-button { display: flex; align-items: center; gap: 10px; }
                .form-field button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                .form-field button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
                .form-field .verified { background-color: #28a745; }
                .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
                .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                .buttons .proceed { background-color: #0070f0; color: #fff; border: none; }
                .buttons .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
                .buttons .previous { background-color: #fff; color: #000; border: 1px solid #d9d9d9; }
                .error { border-color: #ff0000 !important; }
                .error-message { color: #ff0000; font-size: 12px; margin-top: 5px; }
                .duplicate-warning { color: #ff0000; margin-bottom: 15px; display: flex; align-items: center; }
                .duplicate-warning::before { content: "⚠️"; margin-right: 5px; }
                .duplicate-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .duplicate-table th, .duplicate-table td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; }
                .duplicate-table th { background-color: #f7f7f7; }
                .duplicate-table input[type="radio"] { margin-right: 5px; }
                .reason-field { margin-top: 10px; }
                .detailed-form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
                .section-header { background-color: #ff0000; color: #fff; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
                .form-section { margin-bottom: 20px; }
                .form-section label { font-weight: bold; margin-right: 10px; }
                .form-section input, .form-section select, .form-section textarea { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
                .radio-group { display: inline-flex; align-items: center; gap: 10px; }
                .radio-group input[type="radio"] { margin: 0 5px 0 0; }
                .radio-group label { font-weight: normal; margin: 0; }
                .panel { border: 1px solid #d9d9d9; border-radius: 4px; margin-bottom: 20px; }
                .panel-header { background-color: #f7f7f7; padding: 10px; border-bottom: 1px solid #d9d9d9; font-weight: bold; cursor: pointer; }
                .panel-content { padding: 15px; display: none; }
                .panel-content.active { display: block; }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        /**
         * Verifies GSTIN and PAN inputs
         */
        onVerifyGSTINAndPAN: function () {
            var oVerificationModel = this.getView().getModel("verification");
            var oGstinInput = this.byId("gstinInput");
            var oPanInput = this.byId("panInput");
            var oVerifyButton = this.byId("verifyButton");

            var sGstin = oGstinInput.getValue().trim();
            var sPan = oPanInput.getValue().trim();

            // Validate GSTIN
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!sGstin) {
                oGstinInput.setValueState("Error").setValueStateText("GSTIN No. is required.");
                return;
            } else if (!gstinRegex.test(sGstin)) {
                oGstinInput.setValueState("Error").setValueStateText("Invalid GSTIN format (e.g., 27AABCU9603R1ZM).");
                return;
            } else {
                oGstinInput.setValueState("None");
            }

            // Validate PAN
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!sPan) {
                oPanInput.setValueState("Error").setValueStateText("PAN Card No. is required.");
                return;
            } else if (!panRegex.test(sPan)) {
                oPanInput.setValueState("Error").setValueStateText("Invalid PAN format (e.g., AABCU9603R).");
                return;
            } else {
                oPanInput.setValueState("None");
            }

            // Mock verification logic
            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => cred.gstin === sGstin && cred.pan === sPan);

            if (isValid) {
                oVerifyButton.setText("Verified").addStyleClass("verified").setEnabled(false);
                oVerificationModel.setData({ isVerified: true, gstin: sGstin, pan: sPan });
                MessageToast.show("GSTIN and PAN verified successfully!");
                this.openDetailedSupplierForm(sGstin, sPan);
            } else {
                oVerifyButton.setText("Verify").removeStyleClass("verified").setEnabled(true);
                oVerificationModel.setProperty("/isVerified", false);
                MessageToast.show("Verification failed. Please check the GSTIN and PAN.");
            }
        },

        /**
         * Opens a detailed supplier form in a new window
         * @param {string} sGstin - GSTIN number
         * @param {string} sPan - PAN number
         */
        openDetailedSupplierForm: function (sGstin, sPan) {
            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request Form</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; padding: 0; }
        .detailed-form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
        .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .form-section { margin-bottom: 20px; }
        .section-header { background-color: #ff0000; color: #fff; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
        .form-section label { font-weight: bold; margin-right: 10px; }
        .form-section input, .form-section select, .form-section textarea { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
        .form-section .field-container { display: flex; align-items: center; margin-bottom: 10px; }
        .form-section .field-container label { margin-bottom: 0; }
        .radio-group { display: inline-flex; align-items: center; gap: 10px; }
        .radio-group input[type="radio"] { margin: 0 5px 0 0; }
        .radio-group label { font-weight: normal; margin: 0; }
        .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
        .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        .buttons .submit { background-color: #28a745; color: #fff; border: none; }
        .buttons .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
        .input-with-button { display: flex; align-items: center; gap: 10px; }
        .input-with-button input { width: 70%; }
        .input-with-button button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .input-with-button button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
        .input-with-button .verified { background-color: #28a745; }
        .panel { border: 1px solid #d9d9d9; border-radius: 4px; margin-bottom: 20px; }
        .panel-header { background-color: #f7f7f7; padding: 10px; border-bottom: 1px solid #d9d9d9; font-weight: bold; cursor: pointer; }
        .panel-content { padding: 15px; display: none; }
        .panel-content.active { display: block; }
    </style>
</head>
<body>
    <div class="detailed-form-container">
        <div class="header">SUPPLIER REQUEST FORM</div>
        
        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">SUPPLIER SURVEY</div>
            <div class="panel-content active">
                <div class="field-container">
                    <label>Survey ID:</label>
                    <input type="text" id="surveyId" placeholder="Enter Survey ID" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Local/Global:</label>
                    <select id="localGlobal" style="width: 50%;">
                        <option value="">Select</option>
                        <option value="Local">Local</option>
                        <option value="Global">Global</option>
                    </select>
                </div>
                <div class="field-container">
                    <label>Local/Global Supplier:</label>
                    <select id="localGlobalSupplier" style="width: 50%;">
                        <option value="">Select</option>
                        <option value="Local">Local</option>
                        <option value="Global">Global</option>
                    </select>
                </div>
                <div class="field-container">
                    <label>Requestor Vendor Code:</label>
                    <input type="text" id="requestorVendorCode" placeholder="Enter Requestor Code" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Is MSTD a party?:</label>
                    <div class="radio-group">
                        <input type="radio" name="mstdParty" value="Yes" id="mstdPartyYes">
                        <label for="mstdPartyYes">Yes</label>
                        <input type="radio" name="mstdParty" value="No" id="mstdPartyNo">
                        <label for="mstdPartyNo">No</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">REQUIREMENT</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>Address:</label>
                    <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
                </div>
                <div class="field-container">
                    <label>Comments:</label>
                    <textarea id="comments" placeholder="Enter Comments" rows="3"></textarea>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">ACKNOWLEDGEMENT</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>Supplier Full Name:</label>
                    <input type="text" id="supplierFullName" placeholder="Enter Supplier Full Name" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Address:</label>
                    <input type="text" id="ackAddress" placeholder="Enter Address" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Phone No.:</label>
                    <input type="text" id="ackPhone" placeholder="Enter Phone Number" style="width: 50%;">
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">PRIMARY SUPPLIER CONTACT</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>Contact Name:</label>
                    <input type="text" id="contactName" placeholder="Enter Contact Name" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Phone No.:</label>
                    <input type="text" id="contactPhone" placeholder="Enter Phone Number" style="width: 50%;">
                </div>
                <div class="field-container">
                    <label>Email:</label>
                    <input type="email" id="contactEmail" placeholder="Enter Email" style="width: 50%;">
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">GENERAL SUPPLIER INFORMATION</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>GSTIN No.:</label>
                    <div class="input-with-button">
                        <input type="text" id="gstin" placeholder="Enter GSTIN No." value="${sGstin}">
                        <button id="gstinVerifyButton" onclick="verifyGSTIN()">Verify</button>
                    </div>
                </div>
                <div class="field-container">
                    <label>PAN Card No.:</label>
                    <div class="input-with-button">
                        <input type="text" id="pan" placeholder="Enter PAN Card No." value="${sPan}">
                        <button id="panVerifyButton" onclick="verifyPAN()">Verify</button>
                    </div>
                </div>
                <div class="field-container">
                    <label>Interested in Bidding?:</label>
                    <div class="radio-group">
                        <input type="radio" name="interestedBidding" value="Yes" id="interestedBiddingYes">
                        <label for="interestedBiddingYes">Yes</label>
                        <input type="radio" name="interestedBidding" value="No" id="interestedBiddingNo">
                        <label for="interestedBiddingNo">No</label>
                    </div>
                </div>
                <div class="field-container">
                    <label>Interested in E-Bidding?:</label>
                    <div class="radio-group">
                        <input type="radio" name="interestedEBidding" value="Yes" id="interestedEBiddingYes">
                        <label for="interestedEBiddingYes">Yes</label>
                        <input type="radio" name="interestedEBidding" value="No" id="interestedEBiddingNo">
                        <label for="interestedEBiddingNo">No</label>
                    </div>
                </div>
                <div class="field-container">
                    <label>Supports E-Invoicing?:</label>
                    <div class="radio-group">
                        <input type="radio" name="supportsEInvoicing" value="Yes" id="supportsEInvoicingYes">
                        <label for="supportsEInvoicingYes">Yes</label>
                        <input type="radio" name="supportsEInvoicing" value="No" id="supportsEInvoicingNo">
                        <label for="supportsEInvoicingNo">No</label>
                    </div>
                </div>
                <div class="field-container">
                    <label>Supports E-Ordering?:</label>
                    <div class="radio-group">
                        <input type="radio" name="supportsEOrdering" value="Yes" id="supportsEOrderingYes">
                        <label for="supportsEOrderingYes">Yes</label>
                        <input type="radio" name="supportsEOrdering" value="No" id="supportsEOrderingNo">
                        <label for="supportsEOrderingNo">No</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">PURCHASING ORGANIZATION INFORMATION</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>Additional Purchasing Org:</label>
                    <select id="additionalPurchOrg" style="width: 50%;">
                        <option value="">Select</option>
                        <option value="Org1">Org1</option>
                        <option value="Org2">Org2</option>
                    </select>
                </div>
                <div class="field-container">
                    <label>Purchasing Group:</label>
                    <select id="purchasingGroup" style="width: 50%;">
                        <option value="">Select</option>
                        <option value="Group1">Group1</option>
                        <option value="Group2">Group2</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header" onclick="togglePanel(this)">PAYEE/TERMS</div>
            <div class="panel-content">
                <div class="field-container">
                    <label>Payment Terms:</label>
                    <select id="paymentTerms" style="width: 50%;">
                        <option value="">Select</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button class="submit" onclick="submitForm()">Submit</button>
            <button class="cancel" onclick="cancel()">Cancel</button>
        </div>
    </div>
    <script>
        function togglePanel(header) {
            const content = header.nextElementSibling;
            content.classList.toggle('active');
        }

        function verifyGSTIN() {
            const gstin = document.getElementById("gstin").value.trim();
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            const validGSTINs = ["27AABCU9603R1ZM", "29AAGCM1234P1ZT", "33AAHCP7890N1ZF"];
            
            if (!gstin) {
                alert("GSTIN No. is required.");
                return;
            }
            if (!gstinRegex.test(gstin)) {
                alert("Invalid GSTIN format (e.g., 27AABCU9603R1ZM).");
                return;
            }
            if (validGSTINs.includes(gstin)) {
                document.getElementById("gstinVerifyButton").textContent = "Verified";
                document.getElementById("gstinVerifyButton").classList.add("verified");
                document.getElementById("gstinVerifyButton").disabled = true;
                alert("GSTIN verified successfully!");
            } else {
                document.getElementById("gstinVerifyButton").textContent = "Verify";
                document.getElementById("gstinVerifyButton").classList.remove("verified");
                document.getElementById("gstinVerifyButton").disabled = false;
                alert("GSTIN verification failed. Please check the GSTIN.");
            }
        }

        function verifyPAN() {
            const pan = document.getElementById("pan").value.trim();
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            const validPANs = ["AABCU9603R", "AAGCM1234P", "AAHCP7890N"];
            
            if (!pan) {
                alert("PAN Card No. is required.");
                return;
            }
            if (!panRegex.test(pan)) {
                alert("Invalid PAN format (e.g., AABCU9603R).");
                return;
            }
            if (validPANs.includes(pan)) {
                document.getElementById("panVerifyButton").textContent = "Verified";
                document.getElementById("panVerifyButton").classList.add("verified");
                document.getElementById("panVerifyButton").disabled = true;
                alert("PAN verified successfully!");
            } else {
                document.getElementById("panVerifyButton").textContent = "Verify";
                document.getElementById("panVerifyButton").classList.remove("verified");
                document.getElementById("panVerifyButton").disabled = false;
                alert("PAN verification failed. Please check the PAN.");
            }
        }

        function submitForm() {
            const gstinButton = document.getElementById("gstinVerifyButton");
            const panButton = document.getElementById("panVerifyButton");
            
            if (!gstinButton.classList.contains("verified") || !panButton.classList.contains("verified")) {
                alert("Please verify both GSTIN and PAN before submitting.");
                return;
            }
            
            alert("Supplier Request Form submitted successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        /**
         * Updates the differentAddress property in the verification model
         * @param {string} sValue - Selected value (Yes/No)
         */
        onDifferentAddressSelect: function (sValue) {
            this.getView().getModel("verification").setProperty("/differentAddress", sValue);
        },

        /**
         * Updates tile counts based on item data
         * @param {Object} oData - Data object containing items
         */
        _updateTileCounts: function (oData) {
            var aItems = oData.items;
            oData.draftCount = aItems.filter(item => item.status === "DRAFT").length;
            oData.myPendingCount = aItems.filter(item => item.stage === "BUYER").length;
            oData.pendingWithSupplierCount = aItems.filter(item => item.stage === "SUPPLIER").length;
            oData.onBoardingCount = aItems.filter(item => item.stage === "ON BOARDING").length;
            oData.allCount = aItems.length;
        },

        /**
         * Applies filters to the table based on user input
         */
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

            oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onSupplierIdChange: function () { this._applyFilters(); },
        onSupplierTypeChange: function () { this._applyFilters(); },
        onStageChange: function () { this._applyFilters(); },
        onStatusChange: function () { this._applyFilters(); },

        /**
         * Refreshes the table binding
         */
        _refreshTable: function () {
            var oTable = this.byId("productsTable");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").refresh(true);
            }
        },

        /**
         * Centers the tiles in the grid
         */
        _centerTiles: function () {
            var oGrid = this.byId("tileGrid");
            if (oGrid) {
                oGrid.addStyleClass("centeredGrid");
            }
        },

        /**
         * Parses a date string in DD-MM-YYYY format
         * @param {string} sDate - Date string
         * @returns {Date} Parsed date object
         */
        _parseDate: function (sDate) {
            if (!sDate) return new Date(0);
            var [day, month, year] = sDate.split("-").map(Number);
            return new Date(year, month - 1, day);
        },

        /**
         * Updates the sort icon for a column
         * @param {string} sColumnKey - Column key
         * @param {boolean} bDescending - Sort direction
         */
        _updateSortIcon: function (sColumnKey, bDescending) {
            var oIcon = this.byId("sortIcon_" + sColumnKey);
            if (oIcon) {
                oIcon.setSrc(bDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
            }
        },

        /**
         * Generic sort function for all columns
         * @param {string} sProperty - Property to sort by
         * @param {Function} fnCompare - Comparison function
         */
        _sortColumn: function (sProperty, fnCompare) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates[sProperty] = !this._sortStates[sProperty];
            var bDescending = this._sortStates[sProperty];

            try {
                var aValues = aItems.map(item => item[sProperty]);
                aValues.sort((a, b) => bDescending ? fnCompare(b, a) : fnCompare(a, b));

                var aNewItems = JSON.parse(JSON.stringify(this._originalItems));
                aNewItems.forEach((item, index) => {
                    item[sProperty] = aValues[index];
                });

                oModel.setProperty("/items", aNewItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon(sProperty, bDescending);
                MessageToast.show(`Sorted ${sProperty} column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show(`Error while sorting ${sProperty}: ${e.message}`);
            }
        },

        onSortSupplierRequestId: function () {
            this._sortColumn("supplierRequestId", (a, b) => {
                var aNum = parseInt(a.replace("R", ""), 10) || 0;
                var bNum = parseInt(b.replace("R", ""), 10) || 0;
                return aNum - bNum;
            });
        },

        onSortSupplierName: function () {
            this._sortColumn("supplierName", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortType: function () {
            this._sortColumn("type", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortRequestCreationDate: function () {
            this._sortColumn("requestCreationDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortRequestAging: function () {
            this._sortColumn("requestAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortLastActionDate: function () {
            this._sortColumn("lastActionDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortLastActionAging: function () {
            this._sortColumn("lastActionAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortStage: function () {
            this._sortColumn("stage", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortStatus: function () {
            this._sortColumn("status", (a, b) => (a || "").localeCompare(b || ""));
        },

        /**
         * Handles tile press events to filter the table
         * @param {sap.ui.base.Event} oEvent - Tile press event
         */
        onTilePress: function (oEvent) {
            var sTileId = oEvent.getSource().getId();
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

        /**
         * Opens the new supplier request form
         */
        onOrderPress: function () {
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setData({
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                address: "",
                isVerified: false,
                currentStep: 1
            });

            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; padding: 0; }
        .form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
        .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .step-indicator { display: flex; align-items: center; margin-bottom: 20px; }
        .step-number { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px; }
        .step-text { font-size: 12px; line-height: 20px; margin-right: 10px; }
        .inactive-step { background-color: #d3d3d3; color: #666; }
        .active-step { background-color: #ff0000; color: #fff; }
        .active-step.step-text { background-color: transparent; color: #000; font-weight: bold; }
        .form-field { margin-bottom: 15px; }
        .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
        .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
        .form-field .input-with-button { display: flex; align-items: center; gap: 10px; }
        .form-field button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .form-field button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
        .form-field .verified { background-color: #28a745; }
        .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
        .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        .buttons .proceed { background-color: #0070f0; color: #fff; border: none; }
        .buttons .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
        .buttons .previous { background-color: #fff; color: #000; border: 1px solid #d9d9d9; }
        .error { border-color: #ff0000 !important; }
        .error-message { color: #ff0000; font-size: 12px; margin-top: 5px; }
        .duplicate-warning { color: #ff0000; margin-bottom: 15px; display: flex; align-items: center; }
        .duplicate-warning::before { content: "⚠️"; margin-right: 5px; }
        .duplicate-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .duplicate-table th, .duplicate-table td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; }
        .duplicate-table th { background-color: #f7f7f7; }
        .duplicate-table input[type="radio"] { margin-right: 5px; }
        .reason-field { margin-top: 10px; }
        .field-container { display: flex; align-items: center; margin-bottom: 10px; }
        .field-container label { margin-bottom: 0; }
        .radio-group { display: inline-flex; align-items: center; gap: 10px; }
        .radio-group input[type="radio"] { margin: 0 5px 0 0; }
        .radio-group label { font-weight: normal; margin: 0; }
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
            <div id="step3" class="step-content" style="display: none;">
                <div id="duplicateWarning" class="duplicate-warning" style="display: none;">Duplicate Found: Vendor already exists with same GSTIN/PAN</div>
                <table id="duplicateTable" class="duplicate-table" style="display: none;">
                    <thead><tr><th></th><th>Vendor Code</th><th>Spend Type</th><th>Postal Code</th></tr></thead>
                    <tbody>
                        <tr><td><input type="radio" name="duplicateVendor" value="V0001"></td><td>V0001</td><td>Direct</td><td>122001</td></tr>
                        <tr><td><input type="radio" name="duplicateVendor" value="V0002"></td><td>V0002</td><td>Direct</td><td>122001</td></tr>
                        <tr><td><input type="radio" name="duplicateVendor" value="V0003"></td><td>V0003</td><td>Direct</td><td>122001</td></tr>
                    </tbody>
                </table>
                <div id="reasonField" class="reason-field" style="display: none;">
                    <div class="form-field">
                        <label for="duplicateReason">PROVIDE REASON for creating Duplicate Vendor Code:</label>
                        <input type="text" id="duplicateReason" placeholder="Enter reason">
                        <div id="duplicateReasonError" class="error-message" style="display: none;">Please provide a reason.</div>
                    </div>
                    <div class="form-field">
                        <div class="field-container">
                            <label>DIFFERENT ADDRESS</label>
                            <div class="radio-group">
                                <input type="radio" name="differentAddress" value="Yes" id="differentAddressYes" onclick="updateProceedButton()">
                                <label for="differentAddressYes">Yes</label>
                                <input type="radio" name="differentAddress" value="No" id="differentAddressNo" onclick="updateProceedButton()">
                                <label for="differentAddressNo">No</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label for="gstin">GSTIN No.: <span style="color: #ff0000;">*</span></label>
                    <div class="input-with-button">
                        <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                        <button id="verifyButton" onclick="verifyGSTINAndPAN()">Verify</button>
                    </div>
                    <div id="gstinError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="pan" placeholder="Enter PAN Card No.">
                    <div id="panError" class="error-message" style="display: none;"></div>
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

            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstin) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "GSTIN No. is required.";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else if (!gstinRegex.test(formData.gstin)) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "Invalid GSTIN format (e.g., 27AABCU9603R1ZM).";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else {
                document.getElementById("gstin").classList.remove("error");
                document.getElementById("gstinError").style.display = "none";
            }

            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!formData.pan) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "PAN Card No. is required.";
                document.getElementById("panError").style.display = "block";
                return;
            } else if (!panRegex.test(formData.pan)) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "Invalid PAN format (e.g., AABCU9603R).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }

            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => cred.gstin === formData.gstin && cred.pan === formData.pan);

            if (isValid) {
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
                alert("Verification failed. Please check the GSTIN and PAN.");
            }
        }

        function checkForDuplicates() {
            if (formData.gstin === "27AABCU9603R1ZM" && formData.pan === "AABCU9603R") {
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
            formData.address = document.getElementById("address").value.trim();
            formData.duplicateVendor = document.querySelector('input[name="duplicateVendor"]:checked')?.value || "";
            formData.duplicateReason = document.getElementById("duplicateReason")?.value.trim() || "";

            if (!formData.gstin || !formData.pan) {
                alert("Please fill in all required fields (GSTIN and PAN).");
                return;
            }

            if (!formData.isVerified) {
                alert("Please verify GSTIN and PAN before proceeding.");
                return;
            }

            if (formData.gstin === "27AABCU9603R1ZM" && formData.pan === "AABCU9603R") {
                if (!formData.duplicateVendor) {
                    alert("Please select a duplicate vendor.");
                    return;
                }
                if (!formData.duplicateReason) {
                    document.getElementById("duplicateReason").classList.add("error");
                    document.getElementById("duplicateReasonError").style.display = "block";
                    return;
                }
                if (!formData.differentAddress) {
                    alert("Please specify if the address is different.");
                    return;
                }
            }

            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: "NEW_SUPPLIER", data: formData }, "*");
            }
            alert("New Supplier Request created successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }

        updateStepIndicator();
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
                window.addEventListener("message", (event) => {
                    if (event.data.type === "NEW_SUPPLIER") {
                        this._handleNewSupplier(event.data.data);
                    }
                }, { once: true });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups.");
            }
        },

        /**
         * Handles new supplier data from the form
         * @param {Object} formData - Form data from the new supplier form
         */
        _handleNewSupplier: function (formData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = Math.max(...aItems.map(item => parseInt(item.supplierRequestId.replace("R", ""), 10)));
            var sNewId = "R" + (iLastId + 1).toString().padStart(2, "0");

            var oDate = new Date();
            var sCurrentDate = `${oDate.getDate().toString().padStart(2, "0")}-${(oDate.getMonth() + 1).toString().padStart(2, "0")}-${oDate.getFullYear()}`;

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
            this._refreshTable();

            MessageToast.show(`New Supplier Request created successfully! ID: ${sNewId}`);
            this.openDetailedSupplierForm(formData.gstin, formData.pan);
        },

        /**
         * Downloads table data as a CSV file
         */
        onDownloadPress: function () {
            var oModel = this.getView().getModel("products");
            var aItems = oModel.getProperty("/items");

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to download.");
                return;
            }

            var aHeaders = ["Supplier Request ID", "Supplier Name", "Type", "Request Creation Date", "Request Aging", "Last Action Date", "Last Action Aging", "Stage", "Status"];
            var aRows = aItems.map(oItem => [
                oItem.supplierRequestId,
                oItem.supplierName,
                oItem.type,
                oItem.requestCreationDate,
                oItem.requestAging,
                oItem.lastActionDate,
                oItem.lastActionAging,
                oItem.stage,
                oItem.status
            ].map(sValue => `"${(sValue || "").replace(/"/g, '""')}"`).join(","));

            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");
            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

            var oLink = document.createElement("a");
            oLink.href = sURL;
            oLink.download = "Supplier_Registration_Data.csv";
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            MessageToast.show("Table data downloaded as CSV.");
        },

        /**
         * Resets sorting to the original state
         */
        onResetSort: function () {
            Object.keys(this._sortStates).forEach(sKey => {
                this._sortStates[sKey] = false;
                this._updateSortIcon(sKey, false);
            });

            var oModel = this.getView().getModel("products");
            oModel.setProperty("/items", JSON.parse(JSON.stringify(this._originalItems)));
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
                address: "",
                isVerified: false,
                currentStep: 1
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            // Initialize the verification model
            var oVerificationData = {
                gstin: "",
                pan: "",
                isVerified: false,
                duplicateVendor: {
                    V0001: false,
                    V0002: false,
                    V0003: false
                },
                duplicateReason: "",
                differentAddress: ""
            };
            var oVerificationModel = new JSONModel(oVerificationData);
            this.getView().setModel(oVerificationModel, "verification");

            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            var sStyle = `
                .centeredGrid { display: flex; justify-content: center; flex-wrap: wrap; }
                .tileLayout { min-width: 150px; text-align: center; }
                #_IDGenToolbar { background-color: #f7f7f7; padding: 5px 10px; border-bottom: 1px solid #d9d9d9; display: flex; align-items: center; width: 100%; }
                #_IDGenToolbar .sapMLabel { font-weight: bold; color: #333; margin-right: 5px; white-space: nowrap; overflow: visible; text-overflow: clip; min-width: 120px; }
                #_IDGenToolbar .sapMInputBaseInner { padding: 0 5px; width: 100%; min-width: 150px; }
                #_IDGenToolbar .sapMComboBox { padding: 0 5px; width: 100%; min-width: 150px; }
                #_IDGenToolbar .sapMBtn { margin-left: 5px; padding: 5px 10px; min-width: 150px; }
                #_IDGenToolbar .sapMTBSpacer { flex-grow: 1; }
                #actionToolbar { background-color: #f7f7f7; padding: 5px 10px; border-bottom: 1px solid #d9d9d9; display: flex; align-items: center; width: 100%; }
                #actionToolbar .sapMBtn { margin-left: 5px; padding: 5px 10px; min-width: 150px; }
                .sapMText { visibility: visible !important; white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
                .sapMListTblHeader .sapMText { font-weight: bold; color: #333; padding: 5px; }
                .sapMListTblCell { min-width: 120px; }
                .sapUiIcon { margin-left: 5px; cursor: pointer; }
                .sapUiIcon[id*="sortIcon_"] { color: #ff0000 !important; }
                .stepNumber { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; }
                .stepText { font-size: 12px; line-height: 20px; }
                .inactiveStep { background-color: #d3d3d3; color: #666; }
                .activeStep { background-color: #ff0000; color: #fff; }
                .activeStep.stepText { background-color: transparent; color: #000; font-weight: bold; }
                .form-container { padding: 20px; max-width: 800px; margin: 0 auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
                .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
                .step-indicator { display: flex; align-items: center; margin-bottom: 20px; }
                .form-field { margin-bottom: 15px; }
                .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
                .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
                .form-field .input-with-button { display: flex; align-items: center; gap: 10px; }
                .form-field button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                .form-field button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
                .form-field .verified { background-color: #28a745; }
                .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
                .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                .buttons .proceed { background-color: #0070f0; color: #fff; border: none; }
                .buttons .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
                .buttons .previous { background-color: #fff; color: #000; border: 1px solid #d9d9d9; }
                .error { border-color: #ff0000 !important; }
                .error-message { color: #ff0000; font-size: 12px; margin-top: 5px; }
                .duplicate-warning { color: #ff0000; margin-bottom: 15px; display: flex; align-items: center; }
                .duplicate-warning::before { content: "⚠️"; margin-right: 5px; }
                .duplicate-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .duplicate-table th, .duplicate-table td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; }
                .duplicate-table th { background-color: #f7f7f7; }
                .duplicate-table input[type="radio"] { margin-right: 5px; }
                .reason-field { margin-top: 10px; }
                .detailed-form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; }
                .section-header { background-color: #ff0000; color: #fff; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
                .form-section { margin-bottom: 20px; }
                .form-section label { display: block; font-weight: bold; margin-bottom: 5px; }
                .form-section input, .form-section select, .form-section textarea { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
                .form-section .radio-group { display: flex; gap: 10px; margin-top: 5px; }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        onVerifyGSTINAndPAN: function () {
            var oVerificationModel = this.getView().getModel("verification");
            var oGstinInput = this.byId("gstinInput");
            var oPanInput = this.byId("panInput");
            var oVerifyButton = this.byId("verifyButton");

            // Get values
            var sGstin = oGstinInput.getValue().trim();
            var sPan = oPanInput.getValue().trim();

            // Validate GSTIN format
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!sGstin) {
                oGstinInput.setValueState("Error");
                oGstinInput.setValueStateText("GSTIN No. is required.");
                return;
            } else if (!gstinRegex.test(sGstin)) {
                oGstinInput.setValueState("Error");
                oGstinInput.setValueStateText("Invalid GSTIN format. It should be 15 characters (e.g., 27AABCU9603R1ZM).");
                return;
            } else {
                oGstinInput.setValueState("None");
            }

            // Validate PAN format
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!sPan) {
                oPanInput.setValueState("Error");
                oPanInput.setValueStateText("PAN Card No. is required.");
                return;
            } else if (!panRegex.test(sPan)) {
                oPanInput.setValueState("Error");
                oPanInput.setValueStateText("Invalid PAN format. It should be 10 characters (e.g., AABCU9603R).");
                return;
            } else {
                oPanInput.setValueState("None");
            }

            // Mock verification logic with multiple valid examples
            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => 
                cred.gstin === sGstin && cred.pan === sPan
            );

            if (isValid) {
                oVerifyButton.setText("Verified");
                oVerifyButton.addStyleClass("verified");
                oVerifyButton.setEnabled(false);
                oVerificationModel.setProperty("/isVerified", true);
                oVerificationModel.setProperty("/gstin", sGstin);
                oVerificationModel.setProperty("/pan", sPan);
                MessageToast.show("GSTIN and PAN verified successfully!");
                this.openDetailedSupplierForm(sGstin, sPan);
            } else {
                oVerifyButton.setText("Verify");
                oVerifyButton.removeStyleClass("verified");
                oVerifyButton.setEnabled(true);
                oVerificationModel.setProperty("/isVerified", false);
                MessageToast.show("Verification failed. Please check the GSTIN and PAN Card No.");
            }
        },

        openDetailedSupplierForm: function (sGstin, sPan) {
            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .detailed-form-container {
            padding: 20px;
            max-width: 800px;
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
        .form-section {
            margin-bottom: 20px;
        }
        .section-header {
            background-color: #ff0000;
            color: #fff;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .form-section label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .form-section input, .form-section select, .form-section textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .form-section .radio-group {
            display: flex;
            gap: 10px;
            margin-top: 5px;
        }
        .buttons {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 20px;
        }
        .buttons button {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .buttons .submit {
            background-color: #28a745;
            color: #fff;
            border: none;
        }
        .buttons .cancel {
            background-color: #fff;
            color: #ff0000;
            border: 1px solid #ff0000;
        }
    </style>
</head>
<body>
    <div class="detailed-form-container">
        <div class="header">SUPPLIER REQUEST FORM 0.0</div>

        <!-- Supplier Survey Section -->
        <div class="form-section">
            <div class="section-header">SUPPLIER SURVEY</div>
            <div>
                <label>Survey ID:</label>
                <input type="text" id="surveyId" placeholder="Enter Survey ID">
            </div>
            <div>
                <label>Local/Global:</label>
                <select id="localGlobal">
                    <option value="">Select</option>
                    <option value="Local">Local</option>
                    <option value="Global">Global</option>
                </select>
            </div>
            <div>
                <label>Local/Global Supplier:</label>
                <select id="localGlobalSupplier">
                    <option value="">Select</option>
                    <option value="Local">Local</option>
                    <option value="Global">Global</option>
                </select>
            </div>
            <div>
                <label>Requestor is Vendor Creation Code:</label>
                <input type="text" id="requestorVendorCode" placeholder="Enter Requestor Code">
            </div>
            <div>
                <label>Is MSTD a party vendor creation:</label>
                <div class="radio-group">
                    <input type="radio" name="mstdParty" value="Yes"> Yes
                    <input type="radio" name="mstdParty" value="No"> No
                </div>
            </div>
        </div>

        <!-- Requirement Section -->
        <div class="form-section">
            <div class="section-header">REQUIREMENT</div>
            <div>
                <label>Address:</label>
                <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
            </div>
            <div>
                <label>Additional Comments:</label>
                <textarea id="comments" placeholder="Enter Comments" rows="3"></textarea>
            </div>
        </div>

        <!-- Acknowledgement Section -->
        <div class="form-section">
            <div class="section-header">ACKNOWLEDGEMENT</div>
            <div>
                <label>Supplier Full Name:</label>
                <input type="text" id="supplierFullName" placeholder="Enter Supplier Full Name">
            </div>
            <div>
                <label>Address:</label>
                <input type="text" id="ackAddress" placeholder="Enter Address">
            </div>
            <div>
                <label>Phone No.:</label>
                <input type="text" id="ackPhone" placeholder="Enter Phone Number">
            </div>
        </div>

        <!-- Primary Supplier Contact Section -->
        <div class="form-section">
            <div class="section-header">PRIMARY SUPPLIER CONTACT</div>
            <div>
                <label>Contact Name:</label>
                <input type="text" id="contactName" placeholder="Enter Contact Name">
            </div>
            <div>
                <label>Phone No.:</label>
                <input type="text" id="contactPhone" placeholder="Enter Phone Number">
            </div>
            <div>
                <label>Email:</label>
                <input type="email" id="contactEmail" placeholder="Enter Email">
            </div>
        </div>

        <!-- General Supplier Information Section -->
        <div class="form-section">
            <div class="section-header">GENERAL SUPPLIER INFORMATION</div>
            <div>
                <label>Is Supplier Interested in Bidding?:</label>
                <div class="radio-group">
                    <input type="radio" name="interestedBidding" value="Yes"> Yes
                    <input type="radio" name="interestedBidding" value="No"> No
                </div>
            </div>
            <div>
                <label>Is Supplier Interested in E-Bidding?:</label>
                <div class="radio-group">
                    <input type="radio" name="interestedEBidding" value="Yes"> Yes
                    <input type="radio" name="interestedEBidding" value="No"> No
                </div>
            </div>
            <div>
                <label>Supplier Supports E-Invoicing?:</label>
                <div class="radio-group">
                    <input type="radio" name="supportsEInvoicing" value="Yes"> Yes
                    <input type="radio" name="supportsEInvoicing" value="No"> No
                </div>
            </div>
            <div>
                <label>Supplier Supports E-Ordering?:</label>
                <div class="radio-group">
                    <input type="radio" name="supportsEOrdering" value="Yes"> Yes
                    <input type="radio" name="supportsEOrdering" value="No"> No
                </div>
            </div>
        </div>

        <!-- Purchasing Organization Information Section -->
        <div class="form-section">
            <div class="section-header">PURCHASING ORGANIZATION INFORMATION</div>
            <div>
                <label>Additional Purchasing Organization:</label>
                <select id="additionalPurchOrg">
                    <option value="">Select</option>
                    <option value="Org1">Org1</option>
                    <option value="Org2">Org2</option>
                </select>
            </div>
            <div>
                <label>Please select the purchasing group:</label>
                <select id="purchasingGroup">
                    <option value="">Select</option>
                    <option value="Group1">Group1</option>
                    <option value="Group2">Group2</option>
                </select>
            </div>
        </div>

        <!-- Payee/Terms Section -->
        <div class="form-section">
            <div class="section-header">PAYEE/TERMS</div>
            <div>
                <label>Payment Terms:</label>
                <select id="paymentTerms">
                    <option value="">Select</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                </select>
            </div>
        </div>

        <div class="buttons">
            <button class="submit" onclick="submitForm()">Submit</button>
            <button class="cancel" onclick="cancel()">Cancel</button>
        </div>
    </div>

    <script>
        function submitForm() {
            alert("Supplier Request Form submitted successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        onDifferentAddressSelect: function (sValue) {
            var oVerificationModel = this.getView().getModel("verification");
            oVerificationModel.setProperty("/differentAddress", sValue);
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
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setProperty("/currentStep", 1);
            oNewSupplierModel.setProperty("/spendType", "");
            oNewSupplierModel.setProperty("/supplierType", "");
            oNewSupplierModel.setProperty("/gstin", "");
            oNewSupplierModel.setProperty("/pan", "");
            oNewSupplierModel.setProperty("/address", "");
            oNewSupplierModel.setProperty("/isVerified", false);

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
            max-width: 800px;
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
        .form-field .input-with-button {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .form-field button {
            padding: 8px 16px;
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
            gap: 15px;
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
                    <div class="input-with-button">
                        <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                        <button id="verifyButton" onclick="verifyGSTINAndPAN()">Verify</button>
                    </div>
                    <div id="gstinError" class="error-message" style="display: none;"></div>
                </div>
                <div class="form-field">
                    <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                    <input type="text" id="pan" placeholder="Enter PAN Card No.">
                    <div id="panError" class="error-message" style="display: none;"></div>
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
                document.getElementById("gstinError").textContent = "Invalid GSTIN format. It should be 15 characters (e.g., 27AABCU9603R1ZM).";
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
                document.getElementById("panError").textContent = "Invalid PAN format. It should be 10 characters (e.g., AABCU9603R).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }

            // Mock verification logic with multiple valid examples
            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => 
                cred.gstin === formData.gstin && cred.pan === formData.pan
            );

            if (isValid) {
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
            if (formData.gstin === "27AABCU9603R1ZM" && formData.pan === "AABCU9603R") {
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

            if (formData.gstin === "27AABCU9603R1ZM" && formData.pan === "AABCU9603R") {
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

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();

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
                    return '"' + (sValue || "").replace(/"/g, '""') + '"';
                }).join(",");
            });

            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");

            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

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
