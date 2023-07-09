import { createElement } from 'lwc';
import MyLeaves from 'c/myLeaves';
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import getMyLeaves from '@salesforce/apex/leaveRequestController.getMyLeaves';
import { deleteRecord } from 'lightning/uiRecordApi';

// Mocked Data
const mockGetMyLeaves = require('./data/getMyLeaves.json');

// Register the Apex wire adapter
const getMyLeavesAdapter = registerLdsTestWireAdapter(getMyLeaves);

describe('c-my-leaves', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('fetches and displays my leaves correctly', async () => {
        const element = createElement('c-my-leaves', {
            is: MyLeaves
        });
        document.body.appendChild(element);

        // Emit data from the mock adapter
        getMyLeavesAdapter.emit(mockGetMyLeaves);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        // Verify that the wire adapter was called and data is displayed correctly
        expect(getMyLeavesAdapter.getLastConfig()).toEqual({});
        expect(element.myLeaves.data).toEqual(mockGetMyLeaves);
        expect(element.noRecordFound).toBe(false);
    });

    it('handles the row action - Edit', async () => {
        const element = createElement('c-my-leaves', {
            is: MyLeaves
        });
        document.body.appendChild(element);

        // Emit data from the mock adapter
        getMyLeavesAdapter.emit(mockGetMyLeaves);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        // Spy on the showToast method
        const showToastSpy = jest.spyOn(element, 'showToast');

        // Get the Edit button in the first row
        const editButton = element.shadowRoot.querySelector(
            'lightning-datatable lightning-button-icon[data-name="Edit"]'
        );

        // Verify that the modal popup is opened when the Edit button is clicked
        editButton.click();
        await Promise.resolve(); // Wait for the modal to open
        expect(element.showModalPopup).toBe(true);
        expect(element.recordId).toBe(mockGetMyLeaves[0].Id);

        // Verify that the showToast method is not called
        expect(showToastSpy).not.toHaveBeenCalled();
    });

    it('handles the row action - Delete', async () => {
        const element = createElement('c-my-leaves', {
            is: MyLeaves
        });
        document.body.appendChild(element);

        // Emit data from the mock adapter
        getMyLeavesAdapter.emit(mockGetMyLeaves);

        // Wait for the asynchronous DOM updates
        await Promise.resolve();

        // Spy on the deleteRecord function
        const deleteRecordSpy = jest.spyOn(deleteRecord, 'deleteRecord');

        // Get the Delete button in the first row
        const deleteButton = element.shadowRoot.querySelector(
            'lightning-datatable lightning-button-icon[data-name="Delete"]'
        );

        // Verify that the record is deleted when the Delete button is clicked
        deleteButton.click();
        await Promise.resolve(); // Wait for the record to be deleted
        expect(element.showModalPopup).toBe(false);
        expect(element.recordId).toBe(mockGetMyLeaves[0].Id);
        expect(deleteRecordSpy).toHaveBeenCalledWith({
            recordId: mockGetMyLeaves[0].Id
        });

        // Emit data from the mock deleteRecord response
        getMyLeavesAdapter.emit(mockGetMyLeaves); // Refresh the wire adapter with updated data

        // Verify that the showToast method is called with the success message
        expect(element.showToast).toHaveBeenCalledWith(
            'Data Updated Successfully!',
            'Success',
            'success'
        );
    });
});
