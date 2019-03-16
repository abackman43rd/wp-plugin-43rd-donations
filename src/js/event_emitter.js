'use strict';
require('core.js');

window.Dems.init((W, $, Dems) => {
class EventEmitter {
    constructor() {
        this.listeners = new Set();
    }

    addListener(fn) {
        this.listeners.add(fn);
    }

    removeListener(fn) {
        this.listeners.delete(fn);
    }

    emit(...args) {
        this.listeners.forEach(fn => fn(...args));
    }
}

return { EventEmitter: EventEmitter };
});
