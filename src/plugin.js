function setupPlugin(Hammer, $) {
    // provide polyfill for Date.now()
    // browser support: http://kangax.github.io/es5-compat-table/#Date.now
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    /**
     * the methods on/off are called by the instance, but with the jquery plugin
     * we use the jquery event methods instead.
     * @this    {Hammer.Instance}
     * @return  {jQuery}
     */
    Hammer.utils.each(['on', 'off'], function(method) {
        Hammer.utils[method] = function(element, type, handler) {
            $(element)[method](type, function($ev) {
                // append the jquery fixed properties/methods
                var data = $.extend({}, $ev.originalEvent, $ev);
                handler.call(this, data);
            });
        };
    });

    /**
     * trigger events
     * this is called by the gestures to trigger an event like 'tap'
     * @this    {Hammer.Instance}
     * @param   {String}    gesture
     * @param   {Object}    eventData
     * @return  {jQuery}
     */
    Hammer.Instance.prototype.trigger = function(gesture, eventData) {
        var el = $(this.element);
        if(el.has(eventData.target).length) {
            el = $(eventData.target);
        }

        return el.trigger({
            type: gesture,
            gesture: eventData
        });
    };

    /**
     * jQuery plugin
     * create instance of Hammer and watch for gestures,
     * and when called again you can change the options
     * @param   {Object}    [options={}]
     * @return  {jQuery}
     */
    $.fn.hammer = function(options) {
        return this.each(function() {
            var el = $(this);
            var inst = el.data('hammer');

            // start new hammer instance
            if(!inst) {
                el.data('hammer', new Hammer(this, options || {}));
            // change the options
            } else if(inst && options) {
                Hammer.utils.extend(inst.options, options);
            }
        });
    };
}