var indexController = angular.module('indexController', []);

indexController.config(function($interpolateProvider){
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
})

indexController.controller('indexCtrl', function($scope, $http){
  $scope.searchs = {
    search1: { query: '', result: '', done: false },
    search2: { query: '', result: '', done: false, last: true },
    compared: '',
    api_key: 'api_key=a9117b73f9f2c07107b7268d17d9966c',
    link1: 'https://api.themoviedb.org/3/search/movie?query=',
    link2: 'https://api.themoviedb.org/3/movie/'
  }

  $scope.search_movies = function(query, storage, searchs){
    $http.get(searchs.link1 + query + '&' + searchs.api_key).success(function(result){
      console.log(result);
      if(storage.last){
        result.results = result.results.filter(function(movie){ return movie.id !== searchs.search1.result.id; });
      }
      storage.result = result.results;
    })
  }

  $scope.search_single = function(info, storage, searchs){
    $http.get(searchs.link2 + info.id + '/credits?' + searchs.api_key).success(function(result){
      console.log(result);
      result.title = info.title;
      result.id = info.id;
      storage.result = result;
      storage.done = true;

    }).then(function(){
      if(storage.last){
        searchs.compared = compareMovies(searchs);
      }
    })


  }

  $scope.resetSearchs = function(){
    $scope.searchs = {
        search1: { query: '', result: '', done: false },
        search2: { query: '', result: '', done: false, last: true },
        compared: '',
        api_key: 'api_key=a9117b73f9f2c07107b7268d17d9966c',
        link1: 'https://api.themoviedb.org/3/search/movie?query=',
        link2: 'https://api.themoviedb.org/3/movie/'
      }
  }

  function compareMovies(searchs){
    var results = {
      one: searchs.search1.result,
      two: searchs.search2.result
    }, compared = [];

    //setting all of the actors role attribute to "Actor"
    results.one.cast = results.one.cast.map(function(person){ return { role: [{ job: "Actor", movie: results.one.title }], name: person.name }; });
    results.two.cast = results.two.cast.map(function(person){ return { role: [{ job: "Actor", movie: results.two.title }], name: person.name }; });

    results.one.crew = results.one.crew.map(function(person){ return { role: [{ job: person.job, movie: results.one.title }] , name: person.name }; });
    results.two.crew = results.two.crew.map(function(person){ return { role: [{ job: person.job, movie: results.two.title }], name: person.name }; });

    results.one = results.one.cast.concat(results.one.crew);
    results.two = results.two.cast.concat(results.two.crew);

    //Here 'duplicate' people are having their roles concated into one array
    var mapAR = [], filterAR = [];
    results.one = results.one.map(function(person){
      var duplicates = results.one.filter(function(Person){ return person.name === Person.name && mapAR.indexOf(person.name) === -1; });

      if(duplicates.length > -1){
        mapAR.push(person.name);
        person.role = duplicates.reduce(function(agg, curr){
          return agg.concat(curr.role);
        }, []);
      }

      return person;
    })
    results.one = results.one.filter(function(person){
      var check = filterAR.indexOf(person.name) === -1;
      filterAR.push(person.name);

      return check;
    })

    mapAR = [], filterAR = [];
    results.two = results.two.map(function(person){
      var duplicates = results.two.filter(function(Person){ return person.name === Person.name && mapAR.indexOf(person.name) === -1; });

      if(duplicates.length > -1){
        mapAR.push(person.name);
        person.role = duplicates.reduce(function(agg, curr){
          return agg.concat(curr.role);
        }, []);
      }

      return person;
    })
    results.two = results.two.filter(function(person){
      var check = filterAR.indexOf(person.name) === -1;
      filterAR.push(person.name);

      return check;
    })

    compared = results.one.filter(function(person){ return results.two.map(function(Person){ return Person.name; }).indexOf(person.name) !== -1; }).map(function(person){
      person.role2 = results.two[results.two.map(function(Person){ return Person.name; }).indexOf(person.name)].role;
      return person;
    }).map(function(person){
      person.role = person.role.concat(results.two[results.two.map(function(Person){ return Person.name; }).indexOf(person.name)].role);
      return person;
    });
    return compared;
  }
})
