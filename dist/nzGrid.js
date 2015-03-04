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
            throttle: throttle
        };

        return service;

        function throttle(callback, limit) {
            var wait = false;
            return function() {
                if (!wait) {
                    callback.call();
                    wait = true;
                    $timeout(function() {
                        wait = false;
                    }, limit);
                }
            };
        }
    });

    module.directive("row", function(nzGrid) {
        return {
            restrict: "EA",
            compile: function(el, attributes) {
                return {
                    pre: function(scope, el, attributes) {
                        el.addClass('row');
                    },
                    post: function(scope, el, attrs) {

                        var throttleResize = nzGrid.throttle(resize, 50);

                        addResizeListener(el[0], throttleResize);

                        el.on('$destroy', function() {
                            removeResizeListener(el[0], throttleResize);
                        });

                        function resize() {

                            var width = el.width();
                            removeAll();

                            if (width <= nzGrid.breaks.sm) {
                                el.addClass('row-xs');
                                return;
                            }
                            if (width <= nzGrid.breaks.md) {
                                el.addClass('row-sm');
                                return;
                            }
                            if (width <= nzGrid.breaks.lg) {
                                el.addClass('row-md');
                                return;
                            }
                            el.addClass('row-lg');
                            return;

                        }

                        function removeAll() {
                            el.removeClass('row-xs row-sm row-md row-lg');
                        }
                    }
                };
            }
        };
    });

    module.directive("col", function() {
        return {
            restrict: "EA",
            transclude: true,
            template: '<div class="col-inner" ng-transclude></div>',
            compile: function(el, attrs) {
                return {
                    pre: function(scope, el, attrs) {

                        var sizes = attrs.col.length ? attrs.col.split('-') : false;

                        if (!sizes) {
                            el.addClass('col-xs col-sm col-md col-lg');
                            return;
                        }

                        for (var i = 0; i < sizes.length; i++) {
                            sizes[i] = sizes[i].trim();
                        }

                        var colSizes = {};

                        colSizes.xs = sizes[0] ? sizes[0] : 12;
                        colSizes.sm = sizes[1] ? sizes[1] : colSizes.xs;
                        colSizes.md = sizes[2] ? sizes[2] : colSizes.sm;
                        colSizes.lg = sizes[3] ? sizes[3] : colSizes.md;

                        angular.forEach(colSizes, function(size, key) {
                            el.addClass('col-' + key + '-' + size);
                        });
                    }
                };
            }
        };
    });

})();
