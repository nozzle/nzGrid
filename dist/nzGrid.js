(function() {
    'use strict';

    window.nzGrid = angular.extend({
        rowAttribute: 'row',
        colAttribute: 'col',
    }, window.nzGrid || {});

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

    module.directive(window.nzGrid.rowAttribute, function(nzGrid, $timeout, $interval) {
        return {
            restrict: "EA",
            link: function(scope, el, attrs) {
                // Vars
                var size = '';

                // Add the row class
                el.addClass('row');


                // Make the Debouncer
                var tResize = nzGrid.throttle(resize, 32);


                // Align
                var sizes = ['xs', 'sm', 'md', 'lg'];
                var aligns = attrs.align ? (attrs.align.length ? attrs.align.split('-') : false) : [];
                if (aligns.length) {

                    angular.forEach(aligns, function(align, i) {
                        if (align) {
                            el.addClass(align + '-' + sizes[i]);
                        }
                    });
                }


                // Use col-xs or static attribute as the permanent size (awesome for performance)
                if (angular.isDefined(attrs.static)) {
                    if (!attrs.static) {
                        el.addClass('row-xs');
                        return;
                    }
                    el.addClass('row-' + attrs.static);
                    return;
                }


                // Add the resize listeners
                window.nzGrid.addResizeListener(el[0], tResize);
                angular.element(window).on('resize', tResize);

                // Init the first resize for a bit
                $timeout(resize, 50);

                // Cleanup crew
                el.on('$destroy', function() {
                    window.nzGrid.removeResizeListener(el[0], tResize);
                    angular.element(window).off('resize', tResize);
                });

                function resize() {

                    var width = el[0].offsetWidth;
                    var newSize = detect();

                    if (newSize != size) {
                        removeAll();
                        size = newSize;
                        el.addClass(size);
                    }

                    if (attrs.nzGridBroadcast) {
                        scope.$broadcast('nzGrid.resize');
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

    module.directive(window.nzGrid.colAttribute, function() {
        return {
            restrict: "EA",
            replace: true,
            link: function(scope, el, attrs) {

                // Wrap the element in a parent div
                el.wrap('<div>');

                // Vars
                var sizes = ['xs', 'sm', 'md', 'lg'];
                var cols = attrs[window.nzGrid.colAttribute].length ? attrs[window.nzGrid.colAttribute].split('-') : false;
                var offsets = attrs.offset ? (attrs.offset.length ? attrs.offset.split('-') : false) : [];
                var reorders = attrs.reorder ? (attrs.reorder.length ? attrs.reorder.split('-') : false) : [];

                // Cleanup crew
                el.on('$destroy', function() {
                    el.unwrap();
                });

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

                    angular.forEach(offsets, function(offset, i) {
                        if (offset) {
                            el.parent().addClass('col-' + sizes[i] + '-offset-' + offset);
                        }
                    });
                }




                // Reorders
                if (reorders.length) {

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

    // Element Resize Events (Thanks to Sebastian Decima @sdecima)
    (function() {
        var attachEvent = document.attachEvent,
            stylesCreated = false;

        if (!attachEvent) {
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

            /* Detect CSS Animations support to detect element display/re-attach */
            var animation = false,
                animationstring = 'animation',
                keyframeprefix = '',
                animationstartevent = 'animationstart',
                domPrefixes = 'Webkit Moz O ms'.split(' '),
                startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
                pfx = ''; {
                var elm = document.createElement('fakeelement');
                if (elm.style.animationName !== undefined) {
                    animation = true;
                }

                if (animation === false) {
                    for (var i = 0; i < domPrefixes.length; i++) {
                        if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                            pfx = domPrefixes[i];
                            animationstring = pfx + 'Animation';
                            keyframeprefix = '-' + pfx.toLowerCase() + '-';
                            animationstartevent = startEvents[i];
                            animation = true;
                            break;
                        }
                    }
                }
            }

            var animationName = 'resizeanim';
            var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
            var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
        }

        function resetTriggers(element) {
            var triggers = element.__resizeTriggers__,
                expand = triggers.firstElementChild,
                contract = triggers.lastElementChild,
                expandChild = expand.firstElementChild;
            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;
            expandChild.style.width = expand.offsetWidth + 1 + 'px';
            expandChild.style.height = expand.offsetHeight + 1 + 'px';
            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
        };

        function checkTriggers(element) {
            return element.offsetWidth != element.__resizeLast__.width ||
                element.offsetHeight != element.__resizeLast__.height;
        }

        function scrollListener(e) {
            var element = this;
            resetTriggers(this);
            if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
            this.__resizeRAF__ = requestFrame(function() {
                if (checkTriggers(element)) {
                    element.__resizeLast__.width = element.offsetWidth;
                    element.__resizeLast__.height = element.offsetHeight;
                    element.__resizeListeners__.forEach(function(fn) {
                        fn.call(element, e);
                    });
                }
            });
        };


        function createStyles() {
            if (!stylesCreated) {
                //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
                var css = (animationKeyframes ? animationKeyframes : '') +
                    '.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
                    '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
                    head = document.head || document.getElementsByTagName('head')[0],
                    style = document.createElement('style');

                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }

                head.appendChild(style);
                stylesCreated = true;
            }
        }

        window.nzGrid.addResizeListener = function(element, fn) {
            if (attachEvent) element.attachEvent('onresize', fn);
            else {
                if (!element.__resizeTriggers__) {
                    if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                    createStyles();
                    element.__resizeLast__ = {};
                    element.__resizeListeners__ = [];
                    (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
                    element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
                        '<div class="contract-trigger"></div>';
                    element.appendChild(element.__resizeTriggers__);
                    resetTriggers(element);
                    element.addEventListener('scroll', scrollListener, true);

                    /* Listen for a css animation to detect element display/re-attach */
                    animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
                        if (e.animationName == animationName)
                            resetTriggers(element);
                    });
                }
                element.__resizeListeners__.push(fn);
            }
        };

        window.nzGrid.removeResizeListener = function(element, fn) {
            if (attachEvent) element.detachEvent('onresize', fn);
            else {
                element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
                if (!element.__resizeListeners__.length) {
                    element.removeEventListener('scroll', scrollListener);
                    element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
                }
            }
        }
    })();
})();
