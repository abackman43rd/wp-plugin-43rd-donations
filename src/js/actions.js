export const Actions = {
    LOAD:                     'LOAD',
    CHANGE_MODE:              'CHANGE_MODE',
    CHANGE_MEMBERSHIP_TYPE:   'CHANGE_MEMBERSHIP_TYPE',
    CHANGE_ADDITIONAL_AMOUNT: 'CHANGE_ADDITIONAL_AMOUNT',
    SUBMIT:                   'SUBMIT',
};

export const changeAdditionalAmount = (amount) => {
    return {
        type: Actions.CHANGE_ADDITIONAL_AMOUNT,
        amount: amount,
    };
};

export const changeMembershipType = (membershipType) => {
    return {
        type: Actions.CHANGE_MEMBERSHIP_TYPE,
        membershipType: membershipType,
    };
};

export const changeMode = (forMembership) => {
    return {
        type: Actions.CHANGE_MODE,
        forMembership: forMembership,
    };
};
