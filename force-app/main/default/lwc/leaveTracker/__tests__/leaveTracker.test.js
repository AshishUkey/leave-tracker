import { createElement } from 'lwc';
import LeaveTracker from 'c/leaveTracker';

describe('c-leave-tracker', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should call refreshGrid method of leaveRequestComp when refreshLeaveRequestHandler is called', () => {
        const element = createElement('c-leave-tracker', {
            is: LeaveTracker
        });
        document.body.appendChild(element);

        const leaveRequestComp = element.shadowRoot.querySelector('c-leave-requests');
        const refreshGridSpy = jest.spyOn(leaveRequestComp, 'refreshGrid');

        element.refreshLeaveRequestHandler();

        expect(refreshGridSpy).toHaveBeenCalled();
    });
});
