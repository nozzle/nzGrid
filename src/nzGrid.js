(function() {
    'use strict';

    var module = angular.module('nzGrid', []);

    module.factory('nzGrid', function($timeout) {
        var service = {
            breaks: {
                sm: 48,
                md: 63,
                lg: 75,
            },
            fontSize: parseFloat(angular.element("body").css("font-size")),
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

                        var throttleResize = nzGrid.throttle(resize, 16);

                        addResizeListener(el[0], throttleResize);

                        el.on('$destroy', function() {
                            removeResizeListener(el[0], throttleResize);
                        });

                        function resize() {

                            var width = el.width() / nzGrid.fontSize;
                            removeAll();

                            if (width < nzGrid.breaks.sm) {
                                el.addClass('row-xs');
                                return;
                            }
                            if (width < nzGrid.breaks.md) {
                                el.addClass('row-sm');
                                return;
                            }
                            if (width < nzGrid.breaks.lg) {
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
                            el.addClass('col-xs');
                            return;
                        }

                        for (var i = 0; i < sizes.length; i++) {
                            sizes[i] = sizes[i].trim();
                        }

                        var colSizes = {};

                        colSizes.xs = sizes[0] ? sizes[0] : colSizes.sm;
                        colSizes.sm = sizes[1] ? sizes[1] : (colSizes.xs ? colSizes.xs : colSizes.md);
                        colSizes.md = sizes[2] ? sizes[2] : (colSizes.sm ? colSizes.sm : colSizes.lg);
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
