;(function(angular){
    angular.module('NpmSearchApp',['ngHelpers'])
        .service('NpmSearchService', NpmSearchService)
        .service('NpmGroups', NpmGroups)
        .controller('NpmSearchCtrl', NpmSearchCtrl)
    ;
    NpmSearchCtrl.$inject = [
       '$scope', '$window', 'NpmSearchService', 'NpmGroups'
    ];
    function NpmSearchCtrl($scope, $window, NpmSearchService, NpmGroups) {
        $scope.search = "";
        $scope.resullt = [];

        $scope.setKeyword = function(keyword) {
            $scope.keyword = keyword;
            $scope.result = [];
            $scope.group = $scope.findGroupByKeyword(keyword);
        };

        $scope.unsetKeyword = function(){
            $scope.keyword = null;
            $scope.group = null;
            $scope.result = [];
        };

        $scope.addResult = function(items) {
            if ($scope.keyword) {
                items.forEach(function(item){
                    item.keywords = item.keywords.filter(function(keyword){
                        return keyword !== $scope.keyword;
                    });
                });
            }
            $scope.result = $scope.result.concat(items);
        };

        $scope.search = function(query){
            if (! query) {
                $scope.result = [];
                return;
            }
            $scope.isLoading = true;
            NpmSearchService.find(query, $scope.keyword).success(function(response){
                $scope.result = [];
                if (Array.isArray(response.results)){
                    $scope.addResult(response.results);
                    $scope.total = response.total;
                }
                $scope.isLoading = false;
            }).error(function(){
                alert('Search error');
                $scope.isLoading = false;
            });
        };

        $scope.searchQuery = function(){
           $scope.search($scope.query);
        };

        $scope.findGroupByKeyword = function(keyword) {
            var i = -1;
            var l = NpmGroups.length;
            var group;
            while(++i < l) {
                group = NpmGroups[i];
                if (group.keywords.indexOf(keyword) > -1) {
                    return group;
                }
            }
        };

        $scope.loadMore = function() {
            $scope.isLoading = true;
            NpmSearchService.find($scope.query,$scope.keyword, $scope.result.length).success(function(response){
                if (Array.isArray(response.results)){
                   $scope.addResult(response.results);
                   $scope.total = response.total;
                }
                $scope.isLoading = false;
            }).error(function(){
                $scope.isLoading = false;
            });
        };

        $window.addEventListener('hashchange', function onHashChange(){
            var hash = $window.location.hash;
            if (hash.length > 1) {
                $scope.setKeyword(hash.slice(1));
            } else {
                $scope.unsetKeyword();
            }
            //if ($scope.query) {
            //    $scope.query = '';
            //}
            $scope.$apply();
        });

        $scope.$on('$destroy', function(){
            $window.removeEventListener('hashchange', onHashChange);
        });

        var keyword = $window.location.hash.slice(1);
        if (keyword.length > 0) {
            $scope.setKeyword(keyword);
        }
    }

    NpmSearchService.$inject = [
        '$http'
    ];
    function NpmSearchService($http) {
        return {
            fields : ['name', 'homepage', 'description', 'version', 'author', 'keywords'],
            size : 25,
            find : function(query, keywords, start) {
                if (Array.isArray(keywords)) {
                    query = 'keywords:' + keywords.join(',') + ' ' + query
                } else if (keywords) {
                    query = 'keywords:' + keywords + ' ' + query;
                }
                return $http({
                    url : 'http://npmsearch.com/query',
                    params : {
                        q : query,
                        fields : this.fields.join(','),
                        start : start||0,
                        size : this.size
                    }
                });
            }
        }
    }

    NpmGroups.$inject=[
        'initJson'
    ];
    function NpmGroups(initJson) {
        return initJson.npmGroups || [];
    }
})(angular);