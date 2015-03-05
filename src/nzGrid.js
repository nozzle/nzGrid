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

    module.factory('nzGrid', function(nzGridConfig) {
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
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function() {
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
                        el.addClass('row');
                        var debounceResize = nzGrid.debounce(resize, 50);
                        var size;

                        resize();

                        addResizeListener(el[0], debounceResize);

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

                        el.wrap('<div>');

                        var sizes = attrs.col.length ? attrs.col.split('-') : false;

                        if (!sizes) {
                            el.parent().addClass('col-xs col-sm col-md col-lg');
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
                            el.parent().addClass('col-' + key + '-' + size);
                        });
                    },
                };
            }
        };
    });

})();
