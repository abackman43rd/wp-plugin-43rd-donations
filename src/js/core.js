'use strict'l

((W, $) => {
W.Dems = {
    init: function init(fn) {
        $.extend(Dems, fn(W, $, W.Dems));
    }
}
})(window, jQuery);
