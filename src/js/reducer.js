import { Actions } from './actions';

export const MembershipTypes = {
    Individual: 'individual',
    LowIncome: 'low-income',
    Couples: 'couples',
};

const initialState = {
    forMembership: true,
    membershipType: MembershipTypes.Individual,
    additionalAmount: 0,
    firstMemberName: '',
    firstMemberEmail: '',
    firstMemberPhone: '',
    secondMemberName: '',
    secondMemberEmail: '',
    secondMemberPhone: '',
    giftStyle: 'logo',
    giftSize: 'medium',
    isEligible: false,
};

export const reducer = (state=initialState, action) => {
    console.log('Reducer:', action, state);
    switch (action.type) {
        case Actions.LOAD:
            return Object.assign({}, initialState);
        case Actions.CHANGE_ADDITIONAL_AMOUNT:
            return Object.assign({}, state, { additionalAmount: action.amount });
        case Actions.CHANGE_MEMBERSHIP_TYPE:
            return Object.assign({}, state,
                { membershipType: action.membershipType });
        case Actions.CHANGE_MODE:
            return Object.assign({}, state, { forMembership: action.forMembership });
        default:
            return state;
    }
};
