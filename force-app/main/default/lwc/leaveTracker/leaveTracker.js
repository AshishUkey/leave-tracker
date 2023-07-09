/* eslint-disable no-unused-vars */
import { LightningElement } from 'lwc';

export default class LeaveTracker extends LightningElement {
    refreshLeaveRequestHandler(event){
        this.refs.leaveRequestComp.refreshGrid();
        // Test GIT
    }
}