'use strict';

(function (W, $) {
    function membershipFilter() {
        return $('#begin-membership').prop('checked');
    }

    function couplesFilter() {
        return $('#membership-rate').val() == 'couples';
    }

    function TextField(id, conditionFilters) {
        this.node = $('#' + id);
        this.conditionFilters = conditionFilters;
        this.required = this.node.attr('required');
    }

    TextField.prototype.isRequired = function () {
        if (!this.required) {
            return false;
        }

        for (var i = 0; i < this.conditionFilters.length; i++) {
            if (!this.conditionFilters[i]()) {
                return false;
            }
        }

        return true;
    };

    TextField.prototype.validate = function () {
        var isInvalid = false;
        if (this.isRequired()) {
            var val = this.node.val();
            isInvalid = (val == null || val.trim() == '');
        }
        this.node.prop('aria-invalid', isInvalid);
        this.node.toggleClass('form-field-invalid', isInvalid);
    };

    $(function () {
        var stripe = Stripe('pk_test_l9NTIen8HKJFpb4rUvEHGPtK');
        var card;
        var firstMemberName = new TextField('first-member-name', [ membershipFilter ]);
        var firstMemberEmail = new TextField('first-member-email', [ membershipFilter ]);
        var secondMemberName = new TextField('second-member-name',
            [ membershipFilter, couplesFilter ]);
        var secondMemberEmail = new TextField('second-member-email',
            [ membershipFilter, couplesFilter ]);
        var requiredMemberFields = $('#first-member-name, #first-member-email');
        var requiredCouplesFields = $('#second-member-name, #second-member-email');
        var becomeAMember = $('#become-member');
        var donationLevel = $('#membership-rate');
        var donationLevelCosts = {
            'low-income': 10,
            'individual': 25,
            'couples': 43
        };

        function showOrHide(condition, nodes) {
            if (condition) {
                nodes.show();
            } else  {
                nodes.hide();
            }
        }

        function updateFormContents() {
            var isMemberMode = becomeAMember.prop('checked');
            var isCouplesLevel = isMemberMode && donationLevel.val() == 'couples';
            showOrHide(isMemberMode, $('.form-membership-only'));
            showOrHide(!isMemberMode, $('.form-donation-only'));
            showOrHide(!isCouplesLevel, $('.form-individual-only'));
            showOrHide(isCouplesLevel, $('.form-couples-only'));
            showOrHide(getAdditionalAmount() >= 30, $('#gift-options-section'));
            requiredMemberFields.prop('required', isMemberMode);
            requiredCouplesFields.prop('required', isCouplesLevel);
            updateTotal();
            firstMemberName.validate();
            firstMemberEmail.validate();
            secondMemberName.validate();
            secondMemberEmail.validate();
        }

        function getAdditionalAmount() {
            var amount = parseInt($('#additional-amount').val());
            if (isNaN(amount) || amount < 0) {
                $('#additional-amount').val('0');
                amount = 0;
            }
            return amount;
        }

        function getTotal() {
            var amount = getAdditionalAmount();

            if (becomeAMember.prop('checked')) {
                var donationLevel = $('#membership-rate').val();
                amount += donationLevelCosts[donationLevel];
            }

            return amount;
        }

        function updateTotal() {
            var total = getTotal();
            $('#total-amount').text(total.toString() + '.00');
        }

        function setErrorMessage(message) {
            var displayError = $('#card-error');
            if (message) {
                displayError.text(message);
            } else {
                displayError.text('');
            }
        }

        function getFormData() {
            return {
                'donate-or-membership':
                    $('#become-member').prop('checked') ? 'membership' : 'donation',
                'membership-rate': $('#membership-rate').val(),
                'amount': getTotal(),
                'first-member-name': $('#first-member-name').val(),
                'first-member-email': $('#first-member-email').val(),
                'first-member-phone': $('#first-member-phone').val(),
                'second-member-name': $('#second-member-name').val(),
                'second-member-email': $('#second-member-email').val(),
                'second-member-phone': $('#second-member-phone').val(),
                'gift-style': $('#gift-style').val(),
                'gift-size': $('#gift-size').val(),
                'is-allowed-to-donate': $('#is-allowed-to-donate').val()
            };
        }

        function setupStripe() {
            var style = {
                base: {
                    fontSize: '14px',
                    color: '#32325d'
                }
            };
            card = stripe.elements().create('card', { style: style });
            card.mount('#card-element');
            card.addEventListener('change', function (event) {
                setErrorMessage(event.error ? event.error.message : '');
            });
        }

        var context = W.donate_context;
        var button = $('.donate-button');
        button.click(function donate_button_clicked(ev) {
            ev.preventDefault();

            if ($('.form-field-invalid').length > 0) {
                console.log('Validation errors');
                return;
            }

            console.log('Calling Stripe.createToken');
            stripe.createToken(card).then(function (result) {
                if (result.error) {
                    console.log('Error from Stripe:', result.error);
                    setErrorMessage(result.error.message);
                } else {
                    setErrorMessage('');
                    console.log('Stripe succeeded.');
                    var formData = getFormData();
                    formData['stripe-token-id'] = result.token.id;
                    formData['_ajax_nonce'] = context.nonce;
                    formData['action'] = 'donate_button';
                    console.log('Data:', formData);
                    $.post(context.ajax_url, formData, function (data) {
                        W.console.log('Stripe result:', data);
                    });
                }
            });
        });

        if ($('#card-element').length > 0) {
            $('#become-member, #just-donate, #membership-rate, #additional-amount')
                .change(updateFormContents);
            //$('#first-member-name, #first-member-email, #second-member-name, #second-member-email')
                //.change(validateRequiredTextField);
            setupStripe();
            updateFormContents();
        }
    });
})(window, jQuery);
