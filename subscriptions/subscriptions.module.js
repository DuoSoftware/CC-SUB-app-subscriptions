////////////////////////////////
// App : Subscription
// Owner  : Gihan Herath
// Last changed date : 2017/08/24
// Version : 6.1.0.16
// Modified By : Kasun
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


    function gst(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        //debugger;
        return null;
    }
    /** Check for Super admin */
    var isSuperAdmin = gst('isSuperAdmin');
    /** Check for Super admin - END */

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
					  if ($rootScope.isBaseSet2 && isSuperAdmin != 'true') {
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

    if(isSuperAdmin != 'true'){
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
  }

  function parseDateFilter(){
    return function(input){
      return new Date(input);
    };
  }
})();
