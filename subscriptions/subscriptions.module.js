////////////////////////////////
// App : Subscription
// Owner  : Gihan Herath
// Last changed date : 2018/06/04
// Version : 6.1.0.22
// Modified By : Gihan
/////////////////////////////////

(function ()
{
  'use strict';

  angular
    .module('app.subscription', [])
    .config(config)
    .filter('parseDate',parseDateFilter);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider, mesentitlementProvider)
  {

    // State
    $stateProvider
      .state('app.subscription', {
        url    : '/subscription',
        views  : {
          'subscription@app': {
            templateUrl: 'app/main/subscriptions/subscriptions.html',
            controller : 'SubscriptionsController as vm'
          }
        },
        resolve: {
          security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){

            return $q(function(resolve, reject) {
              $timeout(function() {
                // if (true) {
                if ($rootScope.isBaseSet2) {
                  resolve(function () {
                    mesentitlementProvider.setStateCheck("subscription");

                    var entitledStatesReturn = mesentitlement.stateDepResolver('subscription');

                    if(entitledStatesReturn !== true){
                      return $q.reject("unauthorized");
                    };
                  });
                } else {
                  return $location.path('/setupguide');
                }
              });
            });
          }]
        },
        bodyClass: 'subscription'
      });

    // //Api
    // msApiProvider.register('cc_invoice.invoices', ['app/data/cc_invoice/invoices.json']);

    // Navigation

    msNavigationServiceProvider.saveItem('subscription', {
      title    : 'Subscription',
      icon     : 'icon-leaf',
      state    : 'app.subscription',
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
