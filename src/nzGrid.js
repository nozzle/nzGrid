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
