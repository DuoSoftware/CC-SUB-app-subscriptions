////////////////////////////////
// App : Subscription
// Owner  : Gihan Herath
// Last changed date : 2017/10/30
// Version : 6.1.0.17
// Modified By : Gihan
/////////////////////////////////

(function ()
{
  'use strict';

  angular
    .module('app.subscriptions', [])
    .config(config)
    .filter('parseDate',parseDateFilter);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider, mesentitlementProvider)
  {

    mesentitlementProvider.setStateCheck("plans");

    // State
    $stateProvider
      .state('app.subscriptions', {
        url    : '/subscriptions',
        views  : {
          'subscriptions@app': {
            templateUrl: 'app/main/subscriptions/subscriptions.html',
            controller : 'SubscriptionsController as vm'
          }
        },
        resolve: {
			security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){

			  return $q(function(resolve, reject) {
				  $timeout(function() {
					  if (true) {
					  //if ($rootScope.isBaseSet2) {
						  resolve(function () {
							  mesentitlementProvider.setStateCheck("subscriptions");

							  var entitledStatesReturn = mesentitlement.stateDepResolver('subscriptions');

							  if(entitledStatesReturn !== true){
								  return $q.reject("unauthorized");
							  };
						  });
					  } else {
						  return $location.path('/guide');
					  }
				  });
			  });
          }]
        },
        bodyClass: 'subscriptions'
      });

    // //Api
    // msApiProvider.register('cc_invoice.invoices', ['app/data/cc_invoice/invoices.json']);

    // Navigation

    msNavigationServiceProvider.saveItem('subscriptions', {
      title    : 'Subscriptions',
      icon     : 'icon-leaf',
      state    : 'app.subscriptions',
      /*stateParams: {
       'param1': 'page'
       },*/
      weight   : 6
    });
  }

  function parseDateFilter(){
    return function(input){
      return new Date(input);
    };
  }
})();
