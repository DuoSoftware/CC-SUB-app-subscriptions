////////////////////////////////
// App : Subscription
// Owner  : Gihan Herath
// Last changed date : 2017/03/17
// Version : 6.1.0.1
// Modified By : GihanHerath
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
          security: ['$q','mesentitlement', function($q,mesentitlement){
            var entitledStatesReturn = mesentitlement.stateDepResolver('subscriptions');

            if(entitledStatesReturn !== true){
              return $q.reject("unauthorized");
            };
          }]
        },
        bodyClass: 'subscriptions'
      });

    //Api
    msApiProvider.register('cc_invoice.invoices', ['app/data/cc_invoice/invoices.json']);

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
