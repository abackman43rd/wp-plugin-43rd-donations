'use strict';
require('../core.js');
require('../event_emitter.js');

window.Dems.init((W, $, Dems) => {
class Element {
    constructor(elOrSelector) {
        this.el = $(elOrSelector);
        if (this.el.length == 0) {
            throw Error('Failed to bind element: selector "' + selector + '" matched no elements.');
        } else if (this.el.length > 1) {
            throw Error('Failed to bind element: selector "' + selector + '" matched multiple elements.');
        }
    }

class Form extends Element {
    constructor(elOrSelector) {
        super(elOrSelector);
        this.fields = $('input, select', this.el).map((i, el) => {
            if (el.nodeName == 'INPUT') {
                return new TextField(el);
            } else {
                return new SelectField(el);
            }
        });

        this.flags = new Set();
    }

    hasFlag(flag) {
        return this.flags.has(flag);
    }

    setFlag(flag, value) {
        if (value == this.hasFlag(flag)) {
            return;
        } else if (value) {
            this.flags.delete(flag);
        } else {
            this.flags.add(flag);
        }

        this.flagEvents[flag].emit(value, form);
    }

    onFlagChange(flag, fn) {
        if (!this.flagEvents[flag]) {
            this.flagEvents[flag] = new Dems.EventEmitter();
        }

        this.flagEvents[flag].addListener(fn);
    }
}

class FormField extends Element {
    constructor(elOrSelector) {
        super(elOrSelector);
        this.label = $('#' + this.el.attr('id') + '-label');
    }

    get enabledCondition() {
        return this.enabledCondition;
    }

    set enabledCondition(condition) {
        this.enabledCondition = condition;
    }

    get required() {
        return this.el.attr('required');
    }

    enabled() {
        return (this.enabledCondition == null || this.enabledCondition.call(null, this));
    }

    sanitizedValue() {
        return this.el.val();
    }

    hasValue() {
        return this.sanitizedValue() !== '';
    }

    validate() {
        const isValid = this.validateInner();
        $(this.el, this.label).toggleClass('form-field-invalid', !isValid);
        return isValid;
    }

    validateInner() {
        if (!this.enabled()) {
            return true;
        }

        if (!this.hasValue()) {
            return !this.required;
        }

        return this.validateValue(this.sanitizedValue());
    }

    validateValue(value) {
        throw Error('FormField.validateValue not implemented.');
    }
}

class TextField extends FormField {
    validateValue(value) {
        const pattern = TextField.patterns[this.attr('type')];
        return pattern.test(value);
    }
}
TextField.patterns = {
    'text':  /.*/,
    'email': /^[^@]+@[^@]+$/,
    'number': /^[0-9]+\.[0-9]+$/,
};

return {
    Form: Form
};
});
