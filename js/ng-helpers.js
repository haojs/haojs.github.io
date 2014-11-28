;(function(angular){
    angular.module('ngHelpers',[])
        .directive("ngAttrs", function(){
            return {
                link : function(scope, elem, attrs) {
                    scope.$watch(function(){
                        return scope.$eval(attrs.ngAttrs);
                    }, function(newValue, oldValue){
                        var name, newProp;
                        for(name in newValue) {
                            if (! newValue.hasOwnProperty(name)) continue;

                            newProp = newValue[name];
                            if (! oldValue.hasOwnProperty(name) || newProp != oldValue[name] || elem.attr(name) !== newProp)
                                elem.attr(name, newProp);
                        }
                        for (name in oldValue) {
                            if (name in newValue === false) elem.removeAttr(name);
                        }
                    }, true);
                }
            }
        })
        .value('keyAliases',{
            13 : 'enter',
            27 : ['escape', 'esc'],
            32 : 'space',
            37 : 'left',
            39 : 'right',
            38 : 'up',
            40 : 'down',
            46 : ['delete', 'del'],
            91 : 'backspace'
        })
        .value('onKeyOptions',{
            event : 'keypress'
        })
        .directive('onKey', ['onKeyOptions', 'onKeyCallback', function(options, callback){
            // TODO Add key sequences support
            return {
                link : function(scope, element, attr){
                    var events = scope.$eval(attr.onKeyEvent) || options.event;
                    element.on(events, function(e){
                        var binding = scope.$eval(attr.onKey, {$event:e});
                        callback(e, binding);
                    });
                }
            }
        }])
        .factory('onKeyCallback', ['keyAliases', function(aliases){
            return function(e, binding) {
                if (typeof binding === 'function') {
                    binding();
                    return;
                }
                if (! binding) return;

                var code = e.keyCode;
                if (code in aliases === false) return;

                var alias = aliases[code];
                if (Array.isArray(alias)) {
                    alias.forEach(function(alias){
                        if (alias in binding) binding[alias](e);
                    })
                } else {
                    if (alias in binding) binding[alias](e);
                }
            }
        }])
        .directive('onLastScroll', ['$window', function($window){
            return {
                link : function(scope, element, attr) {
                    // Scroll delay
                    var delay = 200;
                    // Scroll timer id
                    var timerId = null;
                    var initialHeight = element[0].offsetHeight;

                    // Detect whethen scrol ends
                    function isScrollEnd() {
                        var el, rect, offsetTop, prev;
                        el = element.get(0);
                        rect = el.getBoundingClientRect();
                        offsetTop = el.offsetTop;
                        prev = scope.$prevPosition;

                        //if (rect.top - $window.innerHeight / 4 < $window.innerHeight && offsetTop > prev) {
                        if (rect.bottom < 200 && el.offsetHeight > initialHeight) {
                            scope.$eval(attr.onLastScroll);
                            initialHeight = el.offsetHeight;
                        }
                    };

                    // Check scroll only when scroll ends or paused
                    $window.addEventListener('scroll', function onScroll() {
                        if (timerId) clearTimeout(timerId);

                        timerId = setTimeout(function(){
                            timerId = null;
                            isScrollEnd();
                        }, delay);
                    }, false);


                    if (attr.lastScrollFor) {
                        var length = 0;
                        scope.$watch(attr.lastScrollFor, function(newValue){
                            if (! newValue) return;
                            if (newValue.length < length) {
                                initialHeight = element[0].offsetHeight;
                            }
                            length = newValue.length;
                        });
                    }

                    scope.$on('$destroy', function(){
                        $window.removeEventListener('scroll', onScroll);
                    });
                }
            };
        }])
        .provider('initJson', function(){
            var provider = this;
            this.nodeId = 'initJson';
            return {
                $get : function() {
                    var script = document.getElementById(provider.nodeId);
                    if (! script) {
                        return {};
                    }

                    return JSON.parse(script.textContent);
                }
            }
        })
})(angular);