/**
* Detect Element Resize
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

(function () {
	var attachEvent = document.attachEvent,
		stylesCreated = false;
	
	if (!attachEvent) {
		var requestFrame = (function(){
			var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
								function(fn){ return window.setTimeout(fn, 20); };
			return function(fn){ return raf(fn); };
		})();
		
		var cancelFrame = (function(){
			var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
								   window.clearTimeout;
		  return function(id){ return cancel(id); };
		})();

		function resetTriggers(element){
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

		function checkTriggers(element){
			return element.offsetWidth != element.__resizeLast__.width ||
						 element.offsetHeight != element.__resizeLast__.height;
		}
		
		function scrollListener(e){
			var element = this;
			resetTriggers(this);
			if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
			this.__resizeRAF__ = requestFrame(function(){
				if (checkTriggers(element)) {
					element.__resizeLast__.width = element.offsetWidth;
					element.__resizeLast__.height = element.offsetHeight;
					element.__resizeListeners__.forEach(function(fn){
						fn.call(element, e);
					});
				}
			});
		};
		
		/* Detect CSS Animations support to detect element display/re-attach */
		var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx  = '';
		{
			var elm = document.createElement('fakeelement');
			if( elm.style.animationName !== undefined ) { animation = true; }    
			
			if( animation === false ) {
				for( var i = 0; i < domPrefixes.length; i++ ) {
					if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animationstartevent = startEvents[ i ];
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
	
	window.addResizeListener = function(element, fn){
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
					if(e.animationName == animationName)
						resetTriggers(element);
				});
			}
			element.__resizeListeners__.push(fn);
		}
	};
	
	window.removeResizeListener = function(element, fn){
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
            debounce: debounce
        };

        return service;

        function debounce(callback, limit) {
            var timeout = false;
            return function() {
                if (timeout) {
                    $timeout.cancel(timeout);
                }
                timeout = $timeout(function() {
                    timeout = false;
                    callback.call();
                }, limit);
            };
        }
    });

    module.directive("row", function(nzGrid) {
        return {
            restrict: "EA",
            compile: function(el, attributes) {
                return {
                    pre: function(scope, el) {
                        // Vars
                        var size;

                        // Add the row class
                        el.addClass('row');

                        // Make the Debouncer
                        var debounceResize = nzGrid.debounce(resize, 50);

                        // Init the first resize
                        resize();

                        // Add the resize listeners
                        addResizeListener(el[0], debounceResize);

                        // Cleanup crew
                        el.on('$destroy', function() {
                            removeResizeListener(el[0], debounceResize);
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
            }
        };
    });

    module.directive("col", function() {
        return {
            restrict: "EA",
            transclude: true,
            replace: true,
            template: '<div class="col-inner" ng-transclude></div>',
            compile: function(el, attrs) {
                return {
                    pre: function(scope, el, attrs) {

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
                                console.log(reorder);
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
                    },
                };
            }
        };
    });
})();
