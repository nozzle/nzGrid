(function() {
    'use strict';

    var module = angular.module('nzGrid', []);

    module.constant('nzGridConfig', {
        breaks: {
            sm: 360,
            md: 780,
            lg: 1200,
        },
    });

    module.factory('nzGrid', function($timeout, nzGridConfig) {
        var service = {
            breaks: {
                sm: nzGridConfig.breaks.sm,
                md: nzGridConfig.breaks.md,
                lg: nzGridConfig.breaks.lg,
            },
            throttle: throttle
        };

        return service;

        function throttle(callback, limit) {
            var waiting = [],
                id = Date.now();
            return function() {
                if (!waiting[id]) {
                    waiting[id] = true;
                    $timeout(function() {
                        waiting[id] = false;
                        callback();
                    }, limit);
                }
            };
        }
    });

    module.directive("row", function(nzGrid) {
        return {
            restrict: "EA",
            link: function(scope, el, attrs) {
                // Vars
                var size = '';

                // Add the row class
                el.addClass('row');

                // Make the Debouncer
                var throttleResize = nzGrid.throttle(resize, 250);

                // Init the first resize
                resize();

                // Add the resize listeners
                window.nzGrid.addResizeListener(el[0], throttleResize);

                // Cleanup crew
                el.on('$destroy', function() {
                    window.nzGrid.removeResizeListener(el[0], throttleResize);
                });

                function resize() {

                    var width = el.width();
                    var newSize = detect();

                    if (newSize != size) {
                        removeAll();
                        size = newSize;
                        el.addClass(size);
                    }

                    function detect() {
                        if (width <= nzGrid.breaks.sm) {
                            return 'row-xs';
                        }
                        if (width <= nzGrid.breaks.md) {
                            return 'row-sm';
                        }
                        if (width <= nzGrid.breaks.lg) {
                            return 'row-md';
                        }
                        return 'row-lg';
                    }
                }

                function removeAll() {
                    el.removeClass('row-xs row-sm row-md row-lg');
                }
            },
        };
    });

    module.directive("col", function() {
        return {
            restrict: "EA",
            replace: true,
            link: function(scope, el, attrs) {

                // Wrap the element in a parent div
                el.wrap('<div>');

                // Vars
                var sizes = ['xs', 'sm', 'md', 'lg'];
                var cols = attrs.col.length ? attrs.col.split('-') : false;
                var offsets = attrs.offset ? (attrs.offset.length ? attrs.offset.split('-') : false) : [];
                var reorders = attrs.reorder ? (attrs.reorder.length ? attrs.reorder.split('-') : false) : [];


                // Equal Columns if not defined
                if (!cols.length) {
                    el.parent().addClass('col-xs col-sm col-md col-lg');
                } else {
                    // Defaults
                    cols[0] = cols[0] ? cols[0] : 12;
                    cols[1] = cols[1] ? cols[1] : cols[0];
                    cols[2] = cols[2] ? cols[2] : cols[1];
                    cols[3] = cols[3] ? cols[3] : cols[2];

                    // Add col Classes
                    angular.forEach(cols, function(col, i) {
                        if (col) {
                            el.parent().addClass('col-' + sizes[i] + '-' + col);
                        }
                    });
                }


                // Offsets
                if (offsets.length) {
                    offsets[0] = offsets[0] ? offsets[0] : false;
                    offsets[1] = offsets[1] ? offsets[1] : false;
                    offsets[2] = offsets[2] ? offsets[2] : false;
                    offsets[3] = offsets[3] ? offsets[3] : false;

                    angular.forEach(offsets, function(offset, i) {
                        if (offset) {
                            el.parent().addClass('col-' + sizes[i] + '-offset-' + offset);
                        }
                    });
                }




                // Reorders
                if (reorders.length) {
                    reorders[0] = reorders[0] ? reorders[0] : false;
                    reorders[1] = reorders[1] ? reorders[1] : false;
                    reorders[2] = reorders[2] ? reorders[2] : false;
                    reorders[3] = reorders[3] ? reorders[3] : false;

                    angular.forEach(reorders, function(reorder, i) {
                        if (reorder) {
                            if (reorder.indexOf('/') > -1) {
                                var both = reorder.split('/');
                                for (var x = 0; x < both.length; x++) {
                                    el.parent().addClass(both + '-' + sizes[x]);
                                }
                            } else {
                                el.parent().addClass(reorder + '-' + sizes[i]);
                            }
                        }
                    });
                }
            }
        };
    });

    // Element Resize Events (Thanks to Daniel Buchner @csuwildcat)
    (function() {
        var attachEvent = document.attachEvent;
        var isIE = navigator.userAgent.match(/Trident/);
        var requestFrame = (function() {
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function(fn) {
                    return window.setTimeout(fn, 20);
                };
            return function(fn) {
                return raf(fn);
            };
        })();

        var cancelFrame = (function() {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                window.clearTimeout;
            return function(id) {
                return cancel(id);
            };
        })();

        function resizeListener(e) {
            var win = e.target || e.srcElement;
            if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
            win.__resizeRAF__ = requestFrame(function() {
                var trigger = win.__resizeTrigger__;
                trigger.__resizeListeners__.forEach(function(fn) {
                    fn.call(trigger, e);
                });
            });
        }

        function objectLoad(e) {
            this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
            this.contentDocument.defaultView.addEventListener('resize', resizeListener);
        }

        window.nzGrid = {};

        window.nzGrid.addResizeListener = function(element, fn) {
            if (!element.__resizeListeners__) {
                element.__resizeListeners__ = [];
                if (attachEvent) {
                    element.__resizeTrigger__ = element;
                    element.attachEvent('onresize', resizeListener);
                } else {
                    if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                    var obj = element.__resizeTrigger__ = document.createElement('object');
                    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                    obj.__resizeElement__ = element;
                    obj.onload = objectLoad;
                    obj.type = 'text/html';
                    if (isIE) element.appendChild(obj);
                    obj.data = 'about:blank';
                    if (!isIE) element.appendChild(obj);
                }
            }
            element.__resizeListeners__.push(fn);
        };

        window.nzGrid.removeResizeListener = function(element, fn) {
            element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
            if (!element.__resizeListeners__.length) {
                if (attachEvent) element.detachEvent('onresize', resizeListener);
                else {
                    element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                    element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
                }
            }
        };
    })();
})();
