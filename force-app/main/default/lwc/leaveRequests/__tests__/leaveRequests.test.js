import { createElement } from 'lwc';
import LeaveRequests from 'c/leaveRequests';
import { getMyLeavesRequest } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

// Mocking Apex wire method
jest.mock('@salesforce/apex/leaveRequestController.getLeaveRequests', () => {
    return {
        default: jest.fn()
    };
}, { virtual: true });

// Mocking Apex method
jest.mock('lightning/uiRecordApi', () => {
    return {
        deleteRecord: jest.fn()
    };
}, { virtual: true });

describe('c-leave-requests', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should display no records found message when myLeaves is empty', () => {
        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.slds-align_absolute-center').textContent).toBe(
            'No Records Found...'
        );
    });

    it('should display the records in lightning-datatable', async () => {
        const mockData = [
            {
                Id: '1',
                Name: 'Request 1',
                userName: 'John Doe',
                From_Date__c: '2023-06-01',
                To_Date__c: '2023-06-03',
                Reason__c: 'Vacation',
                Status__c: 'Approved',
                Manager_Comment__c: 'Approved'
            },
            // Add more mock data as needed
        ];

        getMyLeavesRequest.mockResolvedValue(mockData);

        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        expect(dataTable.data).toEqual(mockData);
    });

    it('should show modal popup when Edit button is clicked', async () => {
        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        const editButton = dataTable.columns.find((column) => column.type === 'button' && column.typeAttributes.name === 'Edit');

        editButton.cellAttributes = {
            row: {
                Id: '1',
                Name: 'Request 1',
                userName: 'John Doe',
                From_Date__c: '2023-06-01',
                To_Date__c: '2023-06-03',
                Reason__c: 'Vacation',
                Status__c: 'Approved',
                Manager_Comment__c: 'Approved'
            }
        };

        // Dispatch click event on the Edit button
        editButton.cellAttributes.row.Action({
            name: 'Edit'
        });

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const modalPopup = element.shadowRoot.querySelector('.slds-modal');
        expect(modalPopup).toBeTruthy();
    });

    it('should call deleteRecord method and refresh grid when Delete button is clicked', async () => {
        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        const deleteButton = dataTable.columns.find((column) => column.type === 'button' && column.typeAttributes.name === 'Delete');

        deleteButton.cellAttributes = {
            row: {
                Id: '1',
                Name: 'Request 1',
                userName: 'John Doe',
                From_Date__c: '2023-06-01',
                To_Date__c: '2023-06-03',
                Reason__c: 'Vacation',
                Status__c: 'Approved',
                Manager_Comment__c: 'Approved'
            }
        };

        // Dispatch click event on the Delete button
        deleteButton.cellAttributes.row.Action({
            name: 'Delete'
        });

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        expect(deleteRecord).toHaveBeenCalledWith('1');
        expect(refreshApex).toHaveBeenCalled();
    });

    it('should call successHandler and refresh grid when save button is clicked in modal popup', async () => {
        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const successHandlerSpy = jest.spyOn(element, 'successHandler');
        const refreshGridSpy = jest.spyOn(element, 'refreshGrid');

        const modalPopup = element.shadowRoot.querySelector('.slds-modal');

        const saveButton = modalPopup.querySelector('lightning-button[variant="brand"][type="submit"]');
        saveButton.click();

        expect(successHandlerSpy).toHaveBeenCalled();
        expect(refreshGridSpy).toHaveBeenCalled();
    });

    it('should close the modal popup when cancel button is clicked', async () => {
        const element = createElement('c-leave-requests', {
            is: LeaveRequests
        });
        document.body.appendChild(element);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        const closeModalSpy = jest.spyOn(element, 'closePopoupHandler');

        const modalPopup = element.shadowRoot.querySelector('.slds-modal');

        const cancelButton = modalPopup.querySelector('lightning-button[variant="neutral"][type="cancel"]');
        cancelButton.click();

        expect(closeModalSpy).toHaveBeenCalled();
    });
});
