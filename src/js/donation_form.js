import { createStore } from 'redux';
import * as actions from './actions';
import { reducer, MembershipTypes } from './reducer';

const $ = window.jQuery;

class DonationForm {
    constructor(store) {
        this.renderCount = 0;
        this.store = store;
        this.store.subscribe(() => this.render());
        $('#become-member').change(() => {
            store.dispatch(actions.changeMode(true));
        });
        $('#just-donate').change(() => {
            store.dispatch(actions.changeMode(false));
        });
        $('#membership-rate').change(ev => {
            store.dispatch(actions.changeMembershipType(ev.target.val()));
        });
        $('#additional-amount').change(ev => {
            store.dispatch(actions.changeAdditionalAmount(ev.target.val()));
        });
    }

    render() {
        const state = this.store.getState();
        console.log('Render', this.renderCount, state);
        this.renderCount += 1;
        if (state.forMembership) {
            $('#become-member').prop('checked', true);
        } else {
            $('#just-donate').prop('checked', true);
        }

        if (state.additionalAmount >= 30) {
            $('.gift-options-section').show();
        } else {
            $('.gift-options-section').hide();
        }

        $('#membership-rate').val(state.membershipType);
        $('#additional-amount').val(state.additionalAmount);
        $('#first-member-name')
            .val(state.firstMemberName)
            .prop('required', state.forMembership);
        $('#first-member-email')
            .val(state.firstMemberEmail)
            .prop('required', state.forMembership);
        $('#first-member-phone').val(state.firstMemberPhone);
        if (state.forMembership) {
            $('.form-membership-only').show();
        } else {
            $('.form-membership-only').hide();
        }

        const isForCouples =
            state.forMembership && state.membershipType == MembershipTypes.Couples;
        if (isForCouples) {
            $('.form-couples.only').show();
        } else {
            $('.form-couples.only').hide();
        }
        $('#second-member-name')
            .val(state.secondMemberName)
            .prop('required', isForCouples);
        $('#second-member-email')
            .val(state.secondMemberEmail)
            .prop('required', isForCouples);
        $('#second-member-phone').val(state.secondMemberPhone);
        $('#gift-style').val(state.giftStyle);
        $('#gift-size').val(state.giftSize);
        $('#is-allowed-to-donate').prop('checked', state.isEligible);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const store = createStore(reducer);
    console.log('Initial store state:', store.getState());
    const form = new DonationForm(store);
    form.render();
});

