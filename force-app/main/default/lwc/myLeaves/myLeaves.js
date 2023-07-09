/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import { LightningElement, wire, api} from 'lwc';
import getMyLeaves from '@salesforce/apex/leaveRequestController.getMyLeaves';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
// import deleteLeaveRequest from '@salesforce/apex/leaveRequestController.deleteLeaveRequest';
import { deleteRecord } from 'lightning/uiRecordApi';

const COLUMNS = [
    {label : "Request Id",  fieldName : "Name", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {label : "From Date",  fieldName : "From_Date__c", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {label : "To Date",  fieldName : "To_Date__c", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {label : "Reason",  fieldName : "Reason__c", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {label : "Status",  fieldName : "Status__c", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {label : "Manager Comment",  fieldName : "Manager_Comment__c", cellAttributes : {
        class : { fieldName : 'cellClass' }
    }},
    {type : "button", typeAttributes : {
        name : "Edit",
        title : "Edit", 
        label : "Edit",
        value : "edit",
        disabled : { fieldName : 'isEditDisabled'},
        cellAttributes : {
            class : { fieldName : 'cellClass'}
        }

    }},
    {type : "button", typeAttributes : {
        name : "Delete",
        title : "Delete", 
        label : "Delete",
        value : "delete",
        cellAttributes : {
            class : { fieldName : 'cellClass'}
        }
    }},
    

];

export default class MyLeaves extends LightningElement {

    myLeaves = [];
    myLeavesWireResults;
    columns = COLUMNS;
    objectApiName = 'LeaveRequest__c';
    recordId = '';
    showModalPopup = false;
    currentUserId = Id;

    @api refreshGrid(){
        refreshApex(this.myLeavesWireResults);
    }


    @wire(getMyLeaves)
    wiredMyLeaves(result){
        this.myLeavesWireResults = result;
        // console.log("myLeavesWireResults is " + JSON.stringify(result));
        if(result.data){
            this.myLeaves = result.data.map(item => ({
               ...item,
               cellClass : item.Status__c === 'Approved' ? 'slds-theme_success' : item.Status__c === 'Rejected' ? 'slds-theme_warning' : '',
               isEditDisabled : item.Status__c != 'Pending' 
            }));
            // console.log("data is " + JSON.stringify(result.data))
        }
        if(result.error){
            console.log("Error Occured.." + result.error);
        }
    }

    get noRecordFound(){
        return this.myLeaves.length == 0;
    }

    showSuccessToast(){
        const event = new ShowToastEvent({
            title: 'Success',
            variant : 'success',
            message : 'Data Updated Successfully!'
        });

        this.dispatchEvent(event);


        const refreshEvent = new CustomEvent('refreshleaveequest');
        this.dispatchEvent(refreshEvent);
    }

    successHandler(event){
        this.showModalPopup = false;
        this.showSuccessToast();
        this.refreshGrid();
      
    }

    closePopoupHandler(e){
        this.showModalPopup = false;
    }

    rowActionHandler(event){  
    
        if(event.detail.action.name == "Edit"){
            this.showModalPopup = true;
            console.log("Action ABC - " + event.detail.action.name);
            this.recordId = event.detail.row.Id;
            console.log("Row ID - " + event.detail.row.Id);
        }
        // eslint-disable-next-line eqeqeq
        else if(event.detail.action.name == "Delete"){
            this.showModalPopup = false;
            console.log("Action ABC - " + event.detail.action.name);
            this.recordId = event.detail.row.Id;
            console.log("Row ID - " + event.detail.row.Id);
            this.handleDelete(event.detail.row.Id);
        }
    }

    handleDelete(recordIdToDelete) {
        console.log("Record Id to Delete - " + recordIdToDelete);
        deleteRecord(recordIdToDelete)
            .then(() => {
                // Handle success
                console.log("Record deleted successfully --->");
                this.refreshGrid();
            })
            .catch(error => {
                // Handle error
                console.error("Error deleting record ---> :", error);
            });
    }


    addLeaveHandler(e){
        this.showModalPopup = true;
        this.recordId = '';
    }

    submitHandler(event){
        event.preventDefault();
        let fields = {...event.detail.fields};
        fields.Status__c = 'Pending';
        if(new Date(fields.From_Date__c) > new Date(fields.To_Date__c)){
            this.showToast("From Date should be less than To Date.", "Date Error", "Warning");
        }
        else if(new Date() > new Date(fields.From_Date__c) ){
            this.showToast("You can't add leaves in past date.", "Date Error", "Warning");
        }
        else {
            fields.Status__c = 'Pending';
            this.refs.myAddLeaveForm.submit(fields);
        }
    }

    showToast(message, title = 'Error',  variant = 'Danger'){
        const event = new ShowToastEvent({
            message,
            title,
            variant
        });

        this.dispatchEvent(event);
    }

}