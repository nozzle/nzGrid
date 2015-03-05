(function() {

    var module = angular.module('demo', ['nzGrid']);

    module.config(function(nzGridConfig) {
        nzGridConfig.breaks = {
            sm: 600,
            md: 900,
            lg: 1200
        };
    });

    module.controller('mainController', function() {

    });


})();
