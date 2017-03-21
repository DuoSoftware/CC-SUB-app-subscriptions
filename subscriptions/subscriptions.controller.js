////////////////////////////////
// App : Plans
// File : Plans Controller
// Owner  : GihanHerath
// Modified by  : Kasun
// Modified date : 2017/02/15
// Version : 6.0.1.0
/////////////////////////////////

(function ()
{
  'use strict';

  angular
    .module('app.subscriptions')
    .controller('SubscriptionsController', SubscriptionsController);

  /** @ngInject */
  function SubscriptionsController($scope, $timeout, $mdDialog, $mdMedia, $mdSidenav, $filter, $charge, $errorCheck, notifications)
  {
    var vm = this;

    vm.appInnerState = "default";
    vm.pageTitle="Create Plan";
    vm.checked = [];
    vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];

    vm.selectedPlan = {};
    vm.toggleSidenav = toggleSidenav;

    vm.responsiveReadPane = undefined;
    vm.activeInvoicePaneIndex = 0;
    vm.dynamicHeight = false;

    vm.scrollPos = 0;
    vm.scrollEl = angular.element('#content');
    vm.selectedMailShowDetails = false;
    //vm.subscriptions = [{
    //  'user':'User 1',
    //  'plan':'Plan 1',
    //  'type':'Plan type 1',
    //  'lastBillingDate':new Date(),
    //  'nextScheduledDate':new Date(),
    //  'status':'Active'
    //},{
    //  'user':'User 2',
    //  'plan':'Plan 2',
    //  'type':'Plan type 2',
    //  'lastBillingDate':new Date(),
    //  'nextScheduledDate':new Date(),
    //  'status':'Stopped'
    //},{
    //  'user':'User 3',
    //  'plan':'Plan 3',
    //  'type':'Plan type 3',
    //  'lastBillingDate':new Date(),
    //  'nextScheduledDate':new Date(),
    //  'status':'Active'
    //},{
    //  'user':'User 2',
    //  'plan':'Plan 4',
    //  'type':'Plan type 4',
    //  'lastBillingDate':new Date(),
    //  'nextScheduledDate':new Date(),
    //  'status':'Stopped'
    //}];

    $scope.subscriptionHistory = [{
      'date':new Date(),
      'plan':'Plan 1',
      'amount':20,
      'status':'Active'
    },{
      'date':new Date(),
      'plan':'Plan 2',
      'amount':40,
      'status':'Active'
    },{
      'date':new Date(),
      'plan':'Plan 3',
      'amount':20,
      'status':'Stopped'
    }];
    vm.selectedSubscription = {};

    // Methods
    vm.closeReadPane = closeReadPane;
    vm.addInvoice = toggleinnerView;
    vm.selectSubscription = selectSubscription;

    $scope.showFilers=true;
    $scope.submitPlan=submitPlan;
    $scope.plan={
      billing_cycle: "auto"
    };
    $scope.isReadLoaded;
    $scope.items = [];

    $scope.BaseCurrency = "";
    $scope.currencyRate = 1;
    $scope.decimalPoint = 2;
    $scope.content={};
    //////////

    // Watch screen size to activate responsive read pane
    $scope.$watch(function ()
    {
      return $mdMedia('gt-md');
    }, function (current)
    {
      vm.responsiveReadPane = !current;
    });

    // Watch screen size to activate dynamic height on tabs
    $scope.$watch(function ()
    {
      return $mdMedia('xs');
    }, function (current)
    {
      vm.dynamicHeight = current;
    });

    /**
     * Close read pane
     */
    function closeReadPane()
    {
      vm.activePlanPaneIndex = 0;

      $timeout(function ()
      {
        vm.scrollEl.scrollTop(vm.scrollPos);
      }, 650);
      $scope.showFilers=true;
    }

    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId)
    {
      $mdSidenav(sidenavId).toggle();
    }

    /**
     * Toggle innerview
     *
     */

    function toggleinnerView(state){
      if(vm.appInnerState === "default"){
        vm.appInnerState = "add";
        vm.pageTitle="View current plan";
        $scope.showFilers=false;
      }else{
        vm.appInnerState = "default";
        vm.pageTitle="Change Plan";
      }
    }

    function selectSubscription(subscription)
    {
      $scope.openSubscription(subscription);
      vm.showFilters=false;
      $scope.showInpageReadpane = true;
      //$timeout(function ()
      //{
      //  vm.activePlanPaneIndex = 1;
      //
      //  // Store the current scrollPos
      //  vm.scrollPos = vm.scrollEl.scrollTop();
      //
      //  // Scroll to the top
      //  vm.scrollEl.scrollTop(0);
      //});
    }

    $scope.openSubscription = function(subscription) {
      $scope.isReadLoaded = false;

      $charge.plan().getPlanByCode(subscription.code).success(function(data){
        vm.selectedSubscription=data;
        vm.selectedSubscription.startDate=subscription.startDate;
        vm.selectedSubscription.endDate=subscription.endDate;
        vm.selectedSubscription.lastBillDate=subscription.lastBillDate;
        //vm.selectedSubscription.email_addr=subscription.email_addr;
        vm.selectedSubscription.orderStatus=subscription.status;
        vm.selectedSubscription.guAccountId=subscription.guAccountId;
        vm.selectedSubscription.guOrderId=subscription.guOrderId;

        $charge.tax().getTaxGrpByIDs(vm.selectedSubscription.taxID).success(function(data) {
          var taxid=data.groupDetail[0].taxid;
          $charge.tax().getTaxByIDs(taxid).success(function(data) {
            //vm.selectedPlan = plan;
            vm.selectedSubscription.taxType = data[0].amounttype;
            vm.selectedSubscription.taxAmount = data[0].amount;

          }).error(function(data) {
            console.log(data);
            //vm.selectedPlan = plan;
            vm.selectedSubscription.taxType = "-1";
            vm.selectedSubscription.taxAmount = 0;
          })

        }).error(function(data) {
          console.log(data);
          //vm.selectedPlan = plan;
          vm.selectedSubscription.taxType = "-1";
          vm.selectedSubscription.taxAmount = 0;
        })

        $charge.profile().getByID(subscription.guAccountId).success(function(data) {

            vm.selectedSubscription.email_addr=data[0].email_addr;

          }).error(function(data) {
            console.log(data);
            vm.selectedSubscription.email_addr="";

          })
      }).error(function(data){
        //
        vm.selectedSubscription.startDate=subscription.startDate;
        vm.selectedSubscription.endDate=subscription.endDate;
        vm.selectedSubscription.lastBillDate=subscription.lastBillDate;
        vm.selectedSubscription.email_addr="";
        vm.selectedSubscription.orderStatus=subscription.status;
        vm.selectedSubscription.guAccountId=subscription.guAccountId;
        vm.selectedSubscription.guOrderId=subscription.guOrderId;

        vm.selectedSubscription.taxType = "-1";
        vm.selectedSubscription.taxAmount = 0;
      })
      //vm.selectedSubscription = subscription;
    };

    var skipAuditTrails=0;
    var takeAuditTrails=100;
    $scope.auditTrailList=[];
    vm.isAuditTrailLoaded = true;
    $scope.moreAuditTrailLoaded = false;

    $scope.getAuditTrailDetails = function (order){


      var orderId=order.guAccountId;
      $scope.noAuditTrailLabel=false;
      vm.isAuditTrailLoaded = true;
      $charge.audit().getByAccountId(orderId,skipAuditTrails,takeAuditTrails,'desc').success(function(data)
      {
        console.log(data);
        skipAuditTrails+=takeAuditTrails;
        //$scope.auditTrailList=data;
        for (var i = 0; i < data.length; i++) {
          var objAuditTrail=data[i];
          //objAuditTrail.id=i+1;
          //objAuditTrail.createdDate=objAuditTrail.createdDate.split(' ')[0];
          $scope.auditTrailList.push(objAuditTrail);

        }

        if(data.length<takeAuditTrails)
        {
          vm.isAuditTrailLoaded = false;
        }
        $scope.moreAuditTrailLoaded = true;

      }).error(function(data)
      {
        console.log(data);
        //if(data.error=="No found!")
        //{
        //  $scope.noAuditTrailLabel=true;
        //}
        $scope.moreAuditTrailLoaded = true;
        vm.isAuditTrailLoaded = false;
        //$scope.auditTrailList=[];
      })
    }

    $scope.searchmoreAuditTrails = function (order){
      $scope.moreAuditTrailLoaded = false;
      $scope.getAuditTrailDetails(order);
    }

    $scope.sortBy = function(propertyName,status,property) {

      $scope.$watch(function () {
        vm.subscriptions=$filter('orderBy')(vm.subscriptions, propertyName, $scope.reverse);
      });

      $scope.reverse =!$scope.reverse;
      if(status!=null) {
        if(property=='User')
        {
          $scope.showUser = status;
          $scope.showType = false;
          $scope.showLast = false;
          $scope.showNext = false;
          $scope.showState = false;
          $scope.showState = false;
        }
        if(property=='Type')
        {
          $scope.showUser = false;
          $scope.showType = status;
          $scope.showLast = false;
          $scope.showNext = false;
          $scope.showState = false;
          $scope.showState = false;
        }
        if(property=='Last')
        {
          $scope.showUser = false;
          $scope.showType = false;
          $scope.showLast = status;
          $scope.showNext = false;
          $scope.showState = false;
          $scope.showState = false;
        }
        if(property=='Next')
        {
          $scope.showUser = false;
          $scope.showType = false;
          $scope.showLast = false;
          $scope.showState = false;
          $scope.showNext = status;
          $scope.showState = false;
        }
        if(property=='Code')
        {
          $scope.showUser = false;
          $scope.showType = false;
          $scope.showLast = false;
          $scope.Code = status;
          $scope.showNext = false;
          $scope.showState = false;
        }
        if(property=='Status')
        {
          $scope.showUser = false;
          $scope.showType = false;
          $scope.showLast = false;
          $scope.showNext = false;
          $scope.showState = false;
          $scope.showState = status;
        }
      }
    };

    $scope.showMoreUserInfo=false;
    $scope.contentExpandHandler = function () {
      $scope.reverseMoreLess =! $scope.reverseMoreLess;
      if($scope.reverseMoreLess){
        $scope.showMoreUserInfo=true;
      }else{
        $scope.showMoreUserInfo=false;
      }
    };

    $scope.showInpageReadpane = false;
    $scope.switchInfoPane = function (state, subscription) {
      if(state=='show'){
        $scope.showInpageReadpane = true;
        $scope.$watch(function () {
          vm.selectedListItem = subscription;
        });
        selectSubscription(subscription);
        skipAuditTrails=0;
        $scope.auditTrailList=[];
        $scope.getAuditTrailDetails(subscription);
      }else if(state=='close'){
        if($scope.inpageReadPaneEdit){
          $scope.cancelEdit();
          $scope.$watch(function () {
            vm.selectedListItem = subscription;
          });
        }else{
          $scope.showInpageReadpane = false;
          $scope.inpageReadPaneEdit=false;
        }
      }
    }

    $scope.tempEditPlan=[];
    $scope.editPlan = function (plan) {
      $scope.tempEditPlan=plan;
      vm.editSelectedPlan = plan;
      vm.editSelectedPlan.rate = parseInt(plan.rate);
      vm.editSelectedPlan.unitPrice = parseInt(plan.unitPrice);
      vm.editSelectedPlan.billingInterval = parseInt(plan.billingInterval);
      vm.editSelectedPlan.billingCycle = parseFloat(plan.billingCycle);
      vm.editSelectedPlan.trailDays = parseInt(plan.trailDays);
      if(vm.editSelectedPlan.billingCycle == -1){
        vm.editSelectedPlan.billingCycleType = "auto";
      }
      else{
        vm.editSelectedPlan.billingCycleType = "fixed";
      }
      $scope.inpageReadPaneEdit=true;
    };
    $scope.cancelEdit = function () {
      vm.editPlanForm.$pristine = false;
      vm.editPlanForm.$dirty = false;
      $scope.inpageReadPaneEdit=false;
      $scope.clearform();
    }

    $scope.showStopSubscriptionConfirm = function(ev,schedule,type) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you like to stop this Subscription?')
        .textContent('You cannot revert this action again for a active Subscription!')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('No!');

      $mdDialog.show(confirm).then(function() {
        if(type=='Immediate')
        {
          $scope.stopSubscriptionImmediately(schedule);
        }
        else if(type=='EOM')
        {
          $scope.stopSubscriptionEOM(schedule);
        }
      }, function() {

      });
    };

    $scope.stopSubscriptionImmediately = function (schedule) {
      var stopSubscriptionData={
        "email":schedule.email_addr,
        "oldplanCode":schedule.code,
        "changeType": "immediate"
      }

      $charge.subscription().stopSubscriptionImmediate(stopSubscriptionData).success(function(data){
        if(data.response=="successed") {
          notifications.toast("Subscription has Stopped", "success");

          skip = 0;
          vm.subscriptions=[];
          $scope.items = [];
          $scope.loading=true;
          $scope.more();
        }
        else if(data.response=="failed"){
          $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
          {
            var result=Response;
            notifications.toast(result,"error");
          }).onError(function(data)
          {
            console.log(data);
          });
        }
      }).error(function(data){
        //
        if(data.response=="failed"){
          $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
          {
            var result=Response;
            notifications.toast(result,"error");
          }).onError(function(data)
          {
            console.log(data);
          });
        }
        else{
          notifications.toast(data,"error");
        }
        console.log(data);
      })
    }

    $scope.stopSubscriptionEOM = function (schedule) {
      var stopSubscriptionData={
        "email":schedule.email_addr,
        "oldplanCode":schedule.code,
        "changeType": "endofsubscription"
      }

      $charge.subscription().stopSubscriptionImmediate(stopSubscriptionData).success(function(data){
        if(data.response=="successed") {
          notifications.toast("Subscription will Stop at the end of Billing Circle", "success");

          skip = 0;
          vm.subscriptions=[];
          $scope.items = [];
          $scope.loading=true;
          $scope.more();
        }
        else if(data.response=="failed"){
          $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
          {
            var result=Response;
            notifications.toast(result,"error");
          }).onError(function(data)
          {
            console.log(data);
          });
        }
      }).error(function(data){
        //
        if(data.response=="failed"){
          $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
          {
            var result=Response;
            notifications.toast(result,"error");
          }).onError(function(data)
          {
            console.log(data);
          });
        }
        else{
          notifications.toast(data,"error");
        }
        console.log(data);
      })
    }

    $scope.isLoading = true;
    $scope.isdataavailable=true;
    $scope.hideSearchMore=false;

    var skip=0;
    var take=100;
    $scope.loading = true;

    $scope.more = function(filter){

      $scope.isLoading = true;
      $charge.order().all(skip,take,'desc',filter).success(function(data)
      {
        console.log(data);

        if($scope.loading)
        {
          skip += take;

          for (var i = 0; i < data.length; i++) {
            $scope.items.push(data[i]);
          }
          vm.subscriptions=$scope.items;
          //$timeout(function () {
          //  vm.plans=$scope.items;
          //},0);
          vm.searchMoreInit = false;

          $scope.isLoading = false;
          $scope.loading = false;
          $scope.isdataavailable=true;
          if(data.length<take){
            $scope.isdataavailable=false;
            $scope.hideSearchMore=true;
          }

        }

      }).error(function(data)
      {
        console.log(data);
        $scope.isSpinnerShown=false;
        $scope.isdataavailable=false;
        $scope.isLoading = false;
        $scope.hideSearchMore=true;
      })

    };
    // we call the function twice to populate the list
    $scope.more("");

    $scope.applyFilters = function (filter){
      skip=0;
      vm.subscriptions=[];
      $scope.items = [];
      $scope.loading=true;
      $scope.more(filter);
    }

    $scope.clearform = function (){
      $scope.content={};
      vm.editSelectedPlan={};
      $scope.content.billingCycleType="auto";
      $scope.content.trailDays=30;
      billingCycleHandler("auto");
    }

    vm.submitted=false;

    function submitPlan (planForm){

      if(planForm == 'changePlanForm'){
        if (vm.changePlanForm.$valid == true) {
          vm.submitted=true;
          if($scope.content.billingCycleType=="auto")
          {
            $scope.content.billingCycle=-1;
          }
          //$scope.content.unitPrice=JSON.stringify($scope.content.unitPrice);
          $scope.content.rate=$scope.currencyRate;

          var planObject = $scope.content;
          console.log(planObject);
          $charge.plan().createPlan(planObject).success(function(data){
            console.log(data);
            if(data.status==true)
            {
              notifications.toast("Successfully Plan Created","success");
              $scope.clearform();
              vm.submitted=false;

              $scope.editOff = false;
              vm.pageTitle = "Create Plan";

              skip=0;
              $scope.items = [];
              $scope.loading=true;
              $scope.more();
              //$window.location.href='#/paymentlist';
            }
            else if(data.status==false)
            {
              notifications.toast(data.error,"error");

              console.log(data);
              vm.submitted=false;
            }

          }).error(function(data){
            //
            if(data==201)
            {
              notifications.toast("Successfully Plan Created","success");
              $scope.clearform();
            }
            else
            {
              notifications.toast(data,"error");
              console.log(data);
            }
            vm.submitted=false;
          })
        }else{
          angular.element(document.querySelector('#changePlanForm')).find('.ng-invalid:visible:first').focus();
        }
        //toggleinnerView('add');
      }
      else if(planForm == 'editPlanForm'){
        if (vm.editPlanForm.$valid == true) {
          vm.submitted=true;
          if(vm.editSelectedPlan.billingCycleType=="auto")
          {
            vm.editSelectedPlan.billingCycle=-1;
          }
          //$scope.content.unitPrice=JSON.stringify($scope.content.unitPrice);
          //vm.editSelectedPlan.rate=$scope.currencyRate;

          var planObject = vm.editSelectedPlan;
          console.log(planObject);
          $charge.plan().updatePlan(planObject).success(function(data){
            console.log(data);
            if(data.Result==true)
            {
              notifications.toast("Successfully Plan Modified","success");
              $scope.clearform();
              vm.submitted=false;

              skip=0;
              $scope.items = [];
              $scope.loading=true;
              $scope.more();
              $scope.cancelEdit();
              //$window.location.href='#/paymentlist';
            }
            else if(data.Result==false)
            {
              notifications.toast(data.error,"error");

              console.log(data);
              vm.submitted=false;
            }

          }).error(function(data){
            //
            //if(data==201)
            //{
            //  notifications.toast("Successfully Plan Modified","success");
            //  $scope.clearform();
            //}
            //else
            //{
            //  notifications.toast(data,"error");
            //  console.log(data);
            //}
            notifications.toast(data,"error");
            console.log(data);
            vm.submitted=false;
          })
        }else{
          angular.element(document.querySelector('#editPlanForm')).find('.ng-invalid:visible:first').focus();
        }
      }

    }

    $scope.searchKeyPress = function (event,keyword,length){
      if(event.keyCode === 13)
      {
        console.log("Function Reached!");
        //$scope.loadByKeywordPlan(keyword,length);
      }
    }

    var skipPlanSearch, takePlanSearch;
    var tempList;
    $scope.loadByKeywordPlan= function (keyword,length) {
      if($scope.items.length==100) {
        //
        if(length==undefined)
        {
          keyword="undefined";
          length=0;
        }
        var searchLength=length;
        //if(keyword.toLowerCase().startsWith($scope.expensePrefix.toLowerCase()))
        //{
        //  keyword=keyword.substr($scope.expensePrefix.length);
        //  console.log(keyword);
        //  searchLength=1;
        //}

        //if (keyword.length == searchLength) {
        //  console.log(keyword);
        //  //
        //  skipPlanSearch = 0;
        //  takePlanSearch = 100;
        //  tempList = [];
        //  $charge.profile().filterByKey(keyword, skipPlanSearch, takePlanSearch).success(function (data) {
        //    for (var i = 0; i < data.length; i++) {
        //      tempList.push(data[i]);
        //    }
        //    vm.plans = tempList;
        //    //skipProfileSearch += takeProfileSearch;
        //    //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
        //  }).error(function (data) {
        //    vm.plans = [];
        //  });
        //}
        //else if (keyword.length == 0 || keyword == null) {
        //  vm.plans = $scope.items;
        //}

        if(searchLength==0||searchLength==undefined)
        {
          $scope.loading=true;
          $scope.more();
        }
      }
    }

  }
})();
