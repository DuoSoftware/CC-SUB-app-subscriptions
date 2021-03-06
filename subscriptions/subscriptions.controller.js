(function ()
{
    'use strict';

    angular
        .module('app.subscription')
        .controller('SubscriptionsController', SubscriptionsController)
        .directive('iframeAutoHeight', function ($interval) {
            var stepSize = 100,
                stepInterval = 500,
                stepSizeMax = stepSize * 2;

            return {
                restrict: 'C',
                link: function (scope, element, attrs) {
                    var iframe = document.getElementById('addUpdateCardSubsId'),
                        iahi, h;

                    scope.start = function () {
                        if (!angular.isDefined(iahi)) {
                            iahi = $interval(function () {
                                try {
                                    if (iframe.contentWindow.document.body) {
                                        h = iframe.contentWindow.document.body.scrollHeight;
                                        iframe.style.height = ((h > stepSizeMax) ? (h - stepSize) : stepSize) + "px";
                                        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
                                    }
                                }
                                catch(err) {
                                    scope.stop();
                                }
                            }, stepInterval);
                        }
                    };

                    scope.stop = function () {
                        if (angular.isDefined(iahi)) {
                            $interval.cancel(iahi);
                            iahi = undefined;
                        }
                    };

                    scope.$on('$destroy', function () {
                        scope.stop();
                    });

                    scope.start();
                }
            }
        });

    /** @ngInject */
    function SubscriptionsController($scope, $timeout, $mdDialog, $document, $mdMedia, $mdSidenav, $location, $filter, $charge, $errorCheck, notifications, $azureSearchHandle, logHelper, $rootScope, $http)
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

        $scope.showUser = false;
        $scope.showCode = false;
        $scope.showType = false;
        $scope.showLast = false;
        $scope.showNext = false;
        $scope.showState = false;

        //$charge.order().all(skip,take,'asc',filter).success(function(data)
        //{
        //	console.log(data);
        //
        //	if($scope.loading)
        //	{
        //		skip += take;
        //
        //		for (var i = 0; i < data.length; i++) {
        //			$scope.items.push(data[i]);
        //		}
        //		vm.subscriptions=$scope.items;
        //		//$timeout(function () {
        //		//  vm.plans=$scope.items;
        //		//},0);
        //		vm.searchMoreInit = false;
        //
        //		$scope.isLoading = false;
        //		$scope.loading = false;
        //		$scope.isdataavailable=true;
        //		if(data.length<take){
        //			$scope.isdataavailable=false;
        //			$scope.hideSearchMore=true;
        //		}
        //
        //	}
        //
        //}).error(function(data)
        //{
        //	console.log(data);
        //	$scope.isSpinnerShown=false;
        //	$scope.isdataavailable=false;
        //	$scope.isLoading = false;
        //	$scope.hideSearchMore=true;
        //})

        //	var dbNamePart1="";
        //	var dbNamePart2="";
        //	var dbName="";
        //	var filter="";
        //var data={};
        //	dbNamePart1=getDomainName().split('.')[0];
        //	dbNamePart2=getDomainExtension();
        //	dbName=dbNamePart1+"_"+dbNamePart2;
        //	//filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
        ////and status eq 'active'
        //if(status=='')
        //{
        //  data={
        //    "search": "*",
        //    "filter": "(domain eq '"+dbName+"' and status ne 'Stopped')",
        //    "orderby" : "endDate asc",
        //    "top":take,
        //    "skip":skip
        //  }
        //}
        //else if(status=='All')
        //{
        //  data={
        //    "search": "*",
        //    "filter": "(domain eq '"+dbName+"')",
        //    "orderby" : "endDate asc",
        //    "top":take,
        //    "skip":skip
        //  }
        //}
        //else
        //{
        //  data={
        //    "search": "*",
        //    "filter": "(domain eq '"+dbName+"' and status eq '"+status+"')",
        //    "orderby" : "endDate asc",
        //    "top":take,
        //    "skip":skip
        //  }
        //}
        //
        //$charge.azuresearch().getAllSubscriptionPost(data).success(function(data)
        //{
        //  //console.log(data);
        //
        //  if($scope.loading)
        //  {
        //    skip += take;
        //
        //    for (var i = 0; i < data.value.length; i++) {
        //      for (var j = 0; j < $scope.profileList.length; j++) {
        //        if($scope.profileList[j].profileId==data.value[i].guAccountId)
        //        {
        //          data.value[i].first_name=$scope.profileList[j].first_name;
        //          data.value[i].last_name=$scope.profileList[j].last_name;
        //          break;
        //        }
        //      }
        //      $scope.items.push(data.value[i]);
        //    }
        //    vm.subscriptions=$scope.items;
        //    //$timeout(function () {
        //    //  vm.plans=$scope.items;
        //    //},0);profileId
        //    vm.searchMoreInit = false;
        //
        //    $scope.isLoading = false;
        //    $scope.loading = false;
        //    $scope.isdataavailable=true;
        //    if(data.length<take){
        //      $scope.isdataavailable=false;
        //      $scope.hideSearchMore=true;
        //    }
        //
        //  }
        //
        //}).error(function(data)
        //{
        //  //console.log(data);
        //  $scope.isSpinnerShown=false;
        //  $scope.isdataavailable=false;
        //  $scope.isLoading = false;
        //  $scope.hideSearchMore=true;
        //}) = {};

        // Methods
        vm.closeReadPane = closeReadPane;
        vm.addInvoice = toggleinnerView;
        vm.selectSubscription = selectSubscription;

        $scope.showFilers=true;
        $scope.submitSubscription=submitSubscription;
        $scope.plan={
            billing_cycle: "auto"
        };
        $scope.isReadLoaded;
        $scope.items = [];

        $scope.BaseCurrency = "";
        $scope.currencyRate = 1;
        $scope.decimalPoint = 2;
        $scope.content={
            startDate:new Date()
        };
        $scope.subscriptionUser={};
        $scope.tempNewDate = new Date();
        $scope.paymentRetryHistory = {};
        $scope.paymentRetryHistory.paymentFailedDate = null;
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

        $scope.$watch(function () {
            if($scope.loaderArr.length == 4){
                $scope.isReadLoaded = true;
            }
        })

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

        function getDomainName() {
            var _st = gst("domain");
            return (_st != null) ? _st : ""; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
        }

        function getDomainExtension() {
            var _st = gst("extension_mode");
            if(_st=="sandbox"||_st=="ssandbox"){
                _st="test";
            }
            return (_st != null) ? _st : "test"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
        }

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
                vm.pageTitle="View current Subscriptions";
                $scope.showFilers=false;
            }else{
                vm.appInnerState = "default";
                vm.pageTitle="Change Subscriptions";
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

        $scope.addonPlansList=[];
        $scope.paymentRetryHistory={};
        $scope.loaderArr = [];

        $scope.openSubscription = function(subscription) {
            $scope.loaderArr = [];
            $scope.isReadLoaded = false;
            $scope.paymentRetryHistoryView = false;

            $charge.plan().getPlanByCode(subscription.code).success(function(data){
                vm.selectedSubscription=data;
                vm.selectedSubscription.startDate=subscription.startDate;
                vm.selectedSubscription.endDate= new Date(subscription.endDate);
                vm.selectedSubscription.lastBillDate=subscription.lastBillDate;
                //vm.selectedSubscription.email_addr=subscription.email_addr;
                vm.selectedSubscription.orderStatus=subscription.status;
                vm.selectedSubscription.guAccountId=subscription.guAccountId;
                vm.selectedSubscription.guOrderId=subscription.guOrderId;
                vm.selectedSubscription.guDetailID=subscription.guDetailID;
                vm.selectedSubscription.first_name=subscription.first_name;
                vm.selectedSubscription.class=subscription.class;
                vm.selectedSubscription.remark=subscription.remarks;//endofsubscription

                $charge.tax().getTaxGrpByIDs(vm.selectedSubscription.taxID).success(function(data) {
                    if(data)var taxid=data.groupDetail[0].taxid;
                    $charge.tax().getTaxByIDs(taxid).success(function(data) {
                        //vm.selectedPlan = plan;
                        vm.selectedSubscription.taxType = data[0].amounttype;
                        vm.selectedSubscription.taxAmount = data[0].amount;

                        $scope.loaderArr.push('ok');
                    }).error(function(data) {
                        //console.log(data);
                        //vm.selectedPlan = plan;
                        vm.selectedSubscription.taxType = "-1";
                        vm.selectedSubscription.taxAmount = 0;
                        $scope.loaderArr.push('ok');
                    })

                }).error(function(data) {
                    //console.log(data);
                    //vm.selectedPlan = plan;
                    vm.selectedSubscription.taxType = "-1";
                    vm.selectedSubscription.taxAmount = 0;
                })
                $charge.profile().getByIDWithStripeKey(subscription.guAccountId).success(function(data) {

                    vm.selectedSubscription.email_addr=data[0].email_addr;
                    vm.selectedSubscription.category=data[0].category;
                    vm.selectedSubscription.createdDate=data[0].createddate;
                    vm.selectedSubscription.contact=data[0].business_contact_no;
                    vm.selectedSubscription.hasCards=data[0].stripeCustId;
                    vm.selectedSubscription.gatewayType=data[0].gatewayType;
                    if(data[0].bill_zip_post != '' && data[0].bill_city != '' && data[0].bill_country != '')
                        vm.selectedSubscription.billAddress=data[0].bill_zip_post+', '+data[0].bill_city+', '+data[0].bill_country;
                    if(data[0].ship_zip_post != '' && data[0].ship_city != '' && data[0].ship_country != '')
                        vm.selectedSubscription.shipAddress=data[0].ship_zip_post+', '+data[0].ship_city+', '+data[0].ship_country;
                    $scope.loaderArr.push('ok');

                }).error(function(data) {
                    //console.log(data);
                    vm.selectedSubscription.email_addr="";
                    $scope.loaderArr.push('ok');

                    $scope.infoJson= {};
                    $scope.infoJson.message =JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.error( $scope.infoJson);

                })
                $scope.addonPlansList=[];
                $charge.order().getAddonsByOrderId(subscription.guOrderId).success(function(data) {
                    //console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        $scope.addonPlansList.push(data[i]);

                    }
                    $scope.loaderArr.push('ok');

                }).error(function(data) {
                    //console.log(data);
                    $scope.loaderArr.push('ok');

                    $scope.infoJson= {};
                    $scope.infoJson.message =JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.error( $scope.infoJson);

                })
                $scope.paymentRetryHistory={};
                $charge.notification().getPaymentRetryHistory(subscription.guAccountId, subscription.code).success(function(data) {
                    //console.log(data);
                    $scope.paymentRetryHistory=data;

                    $scope.paymentRetryHistory.paymentFailedDate=$scope.paymentRetryHistory.failedDate;
                    $scope.paymentRetryHistory.paymentFirstFailedDate="";
                    $scope.paymentRetryHistory.paymentSecondFailedDate="";
                    $scope.paymentRetryHistory.paymentThiredFailedDate="";

                    $scope.paymentRetryHistory.paymentFirstSuccessDate="";
                    $scope.paymentRetryHistory.paymentSecondSuccessDate="";
                    $scope.paymentRetryHistory.paymentThiredSuccessDate="";

                    $scope.paymentRetryHistory.firstRetryOn="";
                    $scope.paymentRetryHistory.secondRetryOn="";
                    $scope.paymentRetryHistory.thiredRetryOn="";

                    if($scope.paymentRetryHistory.attempted==0)
                    {
                        $scope.paymentRetryHistory.firstAttemptStatus="";
                        $scope.paymentRetryHistory.secondAttemptStatus="";
                        $scope.paymentRetryHistory.thiredAttemptStatus="";

                        $scope.paymentRetryHistory.status="Failed";

                        $scope.paymentRetryHistory.firstRetryOn=$scope.paymentRetryHistory.nextRetryOn;
                    }
                    else if($scope.paymentRetryHistory.attempted==1)
                    {
                        $scope.paymentRetryHistory.firstAttemptStatus=$scope.paymentRetryHistory.status;
                        $scope.paymentRetryHistory.secondAttemptStatus="";
                        $scope.paymentRetryHistory.thiredAttemptStatus="";

                        $scope.paymentRetryHistory.secondRetryOn=$scope.paymentRetryHistory.nextRetryOn;

                        $scope.paymentRetryHistory.paymentFirstDate=$scope.paymentRetryHistory.lastRetryOn;

                        if($scope.paymentRetryHistory.status=="Success")
                        {
                            $scope.paymentRetryHistory.paymentFirstSuccessDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                        else if($scope.paymentRetryHistory.status=="Failed")
                        {
                            $scope.paymentRetryHistory.paymentFirstFailedDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                    }
                    else if($scope.paymentRetryHistory.attempted==2)
                    {
                        $scope.paymentRetryHistory.firstAttemptStatus="Failed";
                        $scope.paymentRetryHistory.secondAttemptStatus=$scope.paymentRetryHistory.status;
                        $scope.paymentRetryHistory.thiredAttemptStatus="";

                        $scope.paymentRetryHistory.thiredRetryOn=$scope.paymentRetryHistory.nextRetryOn;

                        $scope.paymentRetryHistory.paymentSecondDate=$scope.paymentRetryHistory.lastRetryOn;

                        if($scope.paymentRetryHistory.status=="Success")
                        {
                            $scope.paymentRetryHistory.paymentSecondSuccessDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                        else if($scope.paymentRetryHistory.status=="Failed")
                        {
                            $scope.paymentRetryHistory.paymentSecondFailedDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                    }
                    else if($scope.paymentRetryHistory.attempted==3)
                    {
                        $scope.paymentRetryHistory.firstAttemptStatus="Failed";
                        $scope.paymentRetryHistory.secondAttemptStatus="Failed";
                        $scope.paymentRetryHistory.thiredAttemptStatus=$scope.paymentRetryHistory.status;

                        $scope.paymentRetryHistory.paymentThiredDate=$scope.paymentRetryHistory.lastRetryOn;

                        if($scope.paymentRetryHistory.status=="Success")
                        {
                            $scope.paymentRetryHistory.paymentThiredSuccessDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                        else if($scope.paymentRetryHistory.status=="Failed")
                        {
                            $scope.paymentRetryHistory.paymentThiredFailedDate=$scope.paymentRetryHistory.lastRetryOn;
                        }
                    }
                    $scope.loaderArr.push('ok');

                }).error(function(data) {
                    //console.log(data);
                    $scope.loaderArr.push('ok');

                    $scope.infoJson= {};
                    $scope.infoJson.message =JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.error( $scope.infoJson);

                })
                $scope.loaderArr.push('ok');

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
                $scope.loaderArr.push('ok');

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='subscriptions';
                logHelper.error( $scope.infoJson);
            })
            //vm.selectedSubscription = subscription;
        };

        // -- function has removed --
        //$scope.auditTrailList=[];
        //$scope.getAuditTrailDetails = function (order)
        //$scope.searchmoreAuditTrails = function (order)

        var skipOrderHistory=0;
        var takeOrderHistory=100;
        vm.paymentHistoryList=[];
        vm.isOrderHistoryLoaded = true;
        $scope.moreOrderHistoryLoaded = false;

        $scope.getOrderHistoryDetails = function (order){

            var planCode=order.code;
            var accId=order.guAccountId;
            vm.isOrderHistoryLoaded = true;
            $charge.orderhistory().getOrderHistoryByAccID(accId,skipOrderHistory,takeOrderHistory,'desc').success(function(data)
            {
                //console.log(data);
                skipOrderHistory+=takeOrderHistory;
                for (var i = 0; i < data.result.length; i++) {
                    var objOrderHistory=data.result[i];
                    objOrderHistory.startDate=moment(objOrderHistory.startDate).format('L');
                    objOrderHistory.endDate=moment(objOrderHistory.endDate).format('L');
                    objOrderHistory.createDate=moment(objOrderHistory.createDate).format('L');
                    vm.paymentHistoryList.push(objOrderHistory);

                }

                if(data.result.length<takeOrderHistory)
                {
                    vm.isOrderHistoryLoaded = false;
                }
                $scope.moreOrderHistoryLoaded = true;

            }).error(function(data)
            {
                //console.log(data);
                $scope.moreOrderHistoryLoaded = true;
                vm.isOrderHistoryLoaded = false;

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='subscriptions';
                logHelper.error( $scope.infoJson);
            })
        }

        $scope.searchmoreOrderHistory = function (order){
            $scope.moreOrderHistoryLoaded = false;
            $scope.getOrderHistoryDetails(order);
        }

        $scope.$watch(function () {
            vm.subscriptionContentHeight = window.innerHeight - 145;
        });

        $scope.toggleEdit = function () {

            // if($scope.editOff==true)
            // {
            // 	if(vm.changePlanForm.$pristine && vm.changePlanForm.$dirty ){
            // 		var confirm = $mdDialog.confirm()
            // 			.title('Are you sure?')
            // 			.textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
            // 			.ariaLabel('Are you sure?')
            // 			.targetEvent()
            // 			.ok('Yes')
            // 			.cancel('Stay');
            //
            // 		$mdDialog.show(confirm).then(function() {
            // 			vm.changePlanForm.$pristine = false;
            // 			vm.changePlanForm.$dirty = false;
            // 			$scope.editOff = false;
            // 			vm.pageTitle = "Create Plan";
            // 		}, function() {
            // 		});
            // 	}else {
            // 		$scope.editOff = false;
            // 		vm.pageTitle = "Create Plan";
            // 	}
            // 	vm.activePlanPaneIndex = 0;
            // }
            // else
            // {
            $scope.editOff = true;
            //vm.pageTitle = "View Subscription";
            //skip=0;
            //$scope.items = [];
            //$scope.more();
            vm.activePlanPaneIndex = 1;
            $scope.showInpageReadpane = false;
            // }
        };

        $scope.sortBy = function(propertyName,status,property) {

            if(propertyName == 'lastBillingDate'){
                angular.forEach(vm.subscriptions, function (sub) {
                    sub.lastBillDate = new Date(sub.lastBillDate);
                });
            }
            vm.subscriptions=$filter('orderBy')(vm.subscriptions, propertyName, $scope.reverse);

            $scope.reverse =!$scope.reverse;
            if(status!=null) {
                if(property=='User')
                {
                    $scope.showUser = status;
                    $scope.showCode = false;
                    $scope.showType = false;
                    $scope.showLast = false;
                    $scope.showNext = false;
                    $scope.showState = false;
                }
                if(property=='Code')
                {
                    $scope.showUser = false;
                    $scope.showCode = status;
                    $scope.showType = false;
                    $scope.showLast = false;
                    $scope.showNext = false;
                    $scope.showState = false;
                }
                if(property=='Type')
                {
                    $scope.showUser = false;
                    $scope.showCode = false;
                    $scope.showType = status;
                    $scope.showLast = false;
                    $scope.showNext = false;
                    $scope.showState = false;
                }
                if(property=='Last')
                {
                    $scope.showUser = false;
                    $scope.showCode = false;
                    $scope.showType = false;
                    $scope.showLast = status;
                    $scope.showNext = false;
                    $scope.showState = false;
                }
                if(property=='Next')
                {
                    $scope.showUser = false;
                    $scope.showCode = false;
                    $scope.showType = false;
                    $scope.showLast = false;
                    $scope.showNext = status;
                    $scope.showState = false;
                }
                if(property=='Status')
                {
                    $scope.showUser = false;
                    $scope.showCode = false;
                    $scope.showType = false;
                    $scope.showLast = false;
                    $scope.showNext = false;
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
            var inpageReadElement = document.getElementById('subscription-inpage-read');
            if(state=='show'){
                $scope.showInpageReadpane = true;
                $scope.$watch(function () {
                    vm.selectedListItem = subscription;
                });
                selectSubscription(subscription);
                //skipAuditTrails=0;
                //$scope.auditTrailList=[];
                //$scope.getAuditTrailDetails(subscription);
                skipOrderHistory=0;
                vm.paymentHistoryList=[];
                $scope.getOrderHistoryDetails(subscription);
                if(inpageReadElement != undefined) inpageReadElement.setAttribute('style','width:70%');
            }else if(state=='close'){
                if($scope.inpageReadPaneEdit){
                    //$scope.cancelEdit();
                    $scope.$watch(function () {
                        vm.selectedListItem = subscription;
                    });
                }else{
                    $scope.showInpageReadpane = false;
                    $scope.inpageReadPaneEdit=false;
                }
                inpageReadElement.setAttribute('style','width:0%');
            }
        }

        //$scope.tempEditPlan=[];
        //$scope.editPlan = function (plan)
        //$scope.cancelEdit = function ()

        $scope.stopPaneOpen = false;
        $scope.openSubscriptionStopPane = function () {
            $scope.stopPaneOpen = true;
        }

        $scope.closeSubscriptionStopPane = function () {
            $scope.stopPaneOpen = false;
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
                if(data.response=="succeeded") {
                    notifications.toast("Subscription has Stopped", "success");

                    $scope.infoJson= {};
                    $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription has Stopped';//JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.info( $scope.infoJson);

                    skip = 0;
                    vm.subscriptions=[];
                    $scope.items = [];
                    $scope.loading=true;
                    $scope.more("");
                    $scope.stopPaneOpen = false;
                    $scope.showInpageReadpane = false;
                }
                else if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription Stopping Failed; '+result;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                    });
                }
            }).error(function(data){
                //
                if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription Stopping Failed; '+result;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                    });
                }
                else{
                    notifications.toast(data,"error");
                }
                //console.log(data);
            })
        }

        $scope.stopSubscriptionEOM = function (schedule) {
            var stopSubscriptionData={
                "email":schedule.email_addr,
                "oldplanCode":schedule.code,
                "changeType": "endofsubscription"
            }

            $charge.subscription().stopSubscriptionImmediate(stopSubscriptionData).success(function(data){
                if(data.response=="succeeded") {
                    notifications.toast("Subscription will Stop at the end of Billing Circle", "success");

                    $scope.infoJson= {};
                    $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription will Stop at the end of Billing Circle';//JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.info( $scope.infoJson);

                    skip = 0;
                    vm.subscriptions=[];
                    $scope.items = [];
                    $scope.loading=true;
                    $scope.more("");
                    $scope.stopPaneOpen = false;
                    $scope.showInpageReadpane = false;
                }
                else if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription Stopping Failed; '+result;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                    });
                }
            }).error(function(data){
                //
                if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message =schedule.code+' - '+schedule.email_addr+' - '+'Subscription Stopping Failed; '+result;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                    });
                }
                else{
                    notifications.toast(data,"error");
                }
                //console.log(data);
            })
        }

        $scope.openSubscriptionRestartPane = function(ev,schedule) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Would you like to restart this Subscription?')
                .textContent('You can revert this again for a active Subscription!')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('No!');

            $mdDialog.show(confirm).then(function() {

                vm.submittedRestart=true;
                var restartObj={};
                if(schedule.class!="Trial")
                {
                    restartObj={
                        "startDate":moment(new Date()).format('YYYY-MM-DD'),
                        "qty":1,
                        "email":schedule.email_addr,
                        "planCode":schedule.code,
                        "addOns":schedule.addOnCodes,
                        "coupon":"",
                        "note":"",
                        "guDetailID":schedule.guDetailID,
                        "dueDate":moment(new Date()).format('YYYY-MM-DD'),
                        "isScheduled":true,
                        "guOrderId":schedule.guOrderId
                    };
                }
                else
                {
                    restartObj={
                        "startDate":moment(new Date()).format('YYYY-MM-DD'),
                        "qty":1,
                        "email":schedule.email_addr,
                        "planCode":schedule.code,
                        "addOns":schedule.addOnCodes,
                        "coupon":"",
                        "note":"",
                        "guDetailID":schedule.guDetailID,
                        "dueDate":moment(new Date()).format('YYYY-MM-DD'),
                        //"isScheduled":true,
                        "isTrial":true,
                        "guOrderId":schedule.guOrderId
                    };
                }

                $charge.subscription().createSubscription(restartObj).success(function(data){
                    //console.log(data);
                    if(data.response=="succeeded")
                    {
                        notifications.toast("Successfully Subscription restarted","success");
                        vm.submittedRestart=false;
                        $scope.applyFilters("");
                        $scope.switchInfoPane('close',vm.selectedPlan);
                    }
                    else if(data.response=="failed")
                    {
                        notifications.toast(data.error,"error");

                        //console.log(data);
                        vm.submittedRestart=false;
                    }

                }).error(function(data){
                    //
                    //notifications.toast("Subscription restart failed :"+data.error,"error");
                    var errorMsg = "Subscription restart failed";
                    for (key in data.error) {
                        errorMsg = data.error[key][0];
                        break;
                    }
                    notifications.toast(errorMsg, "error");
                    vm.submittedRestart=false;
                })

            }, function() {

            });
        };


        $scope.scheduledDateEditing=false;

        $scope.editNextScheduledDate = function(){
            $scope.scheduledDateEditing=true;
            $scope.originalNextscheduledDate=angular.copy(vm.selectedSubscription.endDate);
        }

        $scope.cancelEditNextScheduledDate = function(){
            $scope.scheduledDateEditing=false;
            vm.selectedSubscription.endDate=angular.copy($scope.originalNextscheduledDate);
        }

        $scope.nextSheduleUpdating = false;
        $scope.saveNextScheduledDate = function(selectedSubscription){
            //updateSubscription
            $scope.nextSheduleUpdating = true;
            var updateInfo={
                "email":selectedSubscription.email_addr,
                "planCode":selectedSubscription.code,
                "endDate": moment(selectedSubscription.endDate).format('YYYY-MM-DD')
            };

            $charge.subscription().updateSubscription(updateInfo).success(function(data){
                if(data.response=="succeeded") {
                    notifications.toast("Next subscription date updated", "success");

                    $scope.infoJson= {};
                    $scope.infoJson.message ='Subscription updated';//JSON.stringify(data);
                    $scope.infoJson.app ='subscriptions';
                    logHelper.info( $scope.infoJson);

                    skip = 0;
                    vm.subscriptions=[];
                    $scope.items = [];
                    $scope.nextSheduleUpdating = false;
                    $scope.more("");
                    $scope.stopPaneOpen = false;
                    $scope.showInpageReadpane = false;
                }
                else if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message ='Subscription update Failed;';
                        $scope.nextSheduleUpdating = false;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                        $scope.nextSheduleUpdating = false;
                    });
                    vm.selectedSubscription.endDate=angular.copy($scope.originalNextscheduledDate);
                }
            }).error(function(data){
                //
                if(data.response=="failed"){
                    $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                    {
                        var result=Response;
                        notifications.toast(result,"error");

                        $scope.infoJson= {};
                        $scope.infoJson.message ='Subscription update Failed;';
                        $scope.nextSheduleUpdating = false;
                        $scope.infoJson.app ='subscriptions';
                        logHelper.error( $scope.infoJson);
                    }).onError(function(data)
                    {
                        //console.log(data);
                        $scope.nextSheduleUpdating = false;
                    });
                }
                else{
                    notifications.toast(data,"error");
                    $scope.nextSheduleUpdating = false;
                }
                vm.selectedSubscription.endDate=angular.copy($scope.originalNextscheduledDate);
                //console.log(data);
            });

            $scope.scheduledDateEditing=false;
        }

        var skipProfiles=0;
        var takeProfiles=100;
        $scope.profileList=[];
        vm.loadingProfiles = false;

        $scope.loadProfiles = function(){
            //
            vm.loadingProfiles = true;

            $azureSearchHandle.getClient().SearchRequest("profile",skipProfiles,takeProfiles,'desc',"").onComplete(function(Response)
            {
                if(vm.loadingProfiles)
                {
                    skipProfiles += takeProfiles;
                    //

                    for (var i = 0; i < Response.length; i++) {
                        //
                        $scope.profileList.push(Response[i]);

                    }

                    vm.loadingProfiles = false;
                    if(Response.length<takeProfiles){
                        $scope.more("");
                    }
                    else
                    {
                        $scope.loadProfiles();
                    }
                }

            }).onError(function(data)
            {
                //console.log(data);
                vm.loadingProfiles = false;
                $scope.more("");

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='subscriptions';
                logHelper.error( $scope.infoJson);
            });

        };
        $scope.loadProfiles();

        var skipPlans=0;
        var takePlans=100;
        $scope.planList=[];
        vm.loadingPlans = false;

        $scope.loadPlans = function(){
            //
            vm.loadingPlans = true;

            $azureSearchHandle.getClient().SearchRequest("plan",skipPlans,takePlans,'desc',"Active").onComplete(function(Response)
            {
                if(vm.loadingPlans)
                {
                    skipPlans += takePlans;
                    //

                    for (var i = 0; i < Response.length; i++) {
                        //
                        $scope.planList.push(Response[i]);

                    }

                    vm.loadingPlans = false;
                    if(Response.length<takePlans){

                    }
                    else
                    {
                        $scope.loadPlans();
                    }
                }

            }).onError(function(data)
            {
                //console.log(data);
                vm.loadingPlans = false;

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='subscriptions';
                logHelper.error( $scope.infoJson);
            });

        };
        // $scope.loadPlans();

        $scope.isLoading = true;
        $scope.isdataavailable=true;
        $scope.hideSearchMore=false;

        var skip=0;
        var take=100;
        $scope.loading = true;

        $scope.more = function(status){

            $scope.isLoading = true;

            $azureSearchHandle.getClient().SearchRequest("subscription",skip,take,'asc',status).onComplete(function(Response)
            {
                if($scope.loading)
                {
                    skip += take;

                    for (var i = 0; i < Response.length; i++) {
                        for (var j = 0; j < $scope.profileList.length; j++) {
                            if($scope.profileList[j].profileId==Response[i].guAccountId)
                            {
                                Response[i].first_name=$scope.profileList[j].first_name;
                                Response[i].last_name=$scope.profileList[j].last_name;
                                break;
                            }
                        }
                        $scope.items.push(Response[i]);
                    }
                    vm.subscriptions=$scope.items;
                    //$timeout(function () {
                    //  vm.plans=$scope.items;
                    //},0);profileId
                    vm.searchMoreInit = false;

                    $scope.isLoading = false;
                    $scope.loading = false;
                    $scope.isdataavailable=true;
                    if(Response.length<take){
                        $scope.isdataavailable=false;
                        $scope.hideSearchMore=true;
                    }

                }

            }).onError(function(data)
            {
                //console.log(data);
                $scope.isSpinnerShown=false;
                $scope.isdataavailable=false;
                $scope.isLoading = false;
                $scope.hideSearchMore=true;

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='subscriptions';
                logHelper.error( $scope.infoJson);
            });

        };
        // we call the function twice to populate the list
        //$scope.more("");

        $scope.applyFilters = function (filter){
            skip=0;
            vm.subscriptions=[];
            $scope.items = [];
            $scope.loading=true;
            $scope.more(filter);
        }

        vm.querySearch =  function (query) {

            //Custom Filter
            //
            var results=[];
            var len=0;

            if($scope.profileList!="" && $scope.profileList!=undefined)
            {
                for (var i = 0, len = $scope.profileList.length; i<len; ++i){
                    //console.log($scope.allBanks[i].value.value);first_name last_name

                    if($scope.profileList[i].first_name!="" && $scope.profileList[i].first_name!=undefined)
                    {
                        if($scope.profileList[i].first_name.toLowerCase().indexOf(query.toLowerCase()) == 0)
                        {
                            results.push($scope.profileList[i]);
                        }
                        else if($scope.profileList[i].last_name.toLowerCase().indexOf(query.toLowerCase()) == 0)
                        {
                            results.push($scope.profileList[i]);
                        }
                    }
                }
            }
            return results;
        }

        vm.querySearchPlan =  function (query) {

            //Custom Filter
            //
            var results=[];
            var len=0;

            if(vm.plans!="" && vm.plans!=undefined)
            {
                for (var i = 0, len = vm.plans.length; i<len; ++i){
                    //console.log($scope.allBanks[i].value.value);first_name last_name

                    if(vm.plans[i].name!="" && vm.plans[i].name!=undefined)
                    {
                        if(vm.plans[i].name.toLowerCase().indexOf(query.toLowerCase()) == 0)
                        {
                            results.push(vm.plans[i]);
                        }
                    }
                }
            }
            return results;
        }

        $scope.planAddonList=[];

        $scope.loadingPlanDetails = false;
        // Kasun_Wijeratne_20_JUNE_2018
        // $scope.toggleAddonSelection
        // Kasun_Wijeratne_20_JUNE_2018 - END
        $scope.checkBasePlanForAddons= function (selectedPlan) {
            $scope.planAddonList=[];
            if(selectedPlan != null && selectedPlan.type=="Base-Plan")
            {
                $scope.loadingPlanDetails = true;
                var basePlanCode = selectedPlan.code;
                $charge.plan().getAddOnsFullForBasePlan(basePlanCode).success(function(data){
                    //console.log(data);
                    $scope.planAddonList=data;

                }).error(function(data){
                    //

                })

                $charge.plan().getPlanByCode(selectedPlan.code).success(function(data){
                    $scope.subscriptionUser.selectedPlan.trailDays = data.trailDays;
                    $scope.subscriptionUser.selectedPlan.billingInterval = data.billingInterval;
                    $scope.subscriptionUser.selectedPlan.priceScheme = data.priceScheme;
                    $scope.loadingPlanDetails = false;
                }).error(function (res) {
                    notifications.toast("Error loading plan details", "error");
                    $scope.loadingPlanDetails = false;
                });
            }
        }

        var skipSubsProfile,takeSubsProfile;
        var tempProfileListSupp;
        $scope.filteredUsersSupp = [];
        vm.isAutoDisabled = false;
        //var autoElem = angular.element('#invoice-auto');
        $scope.searchMreSupp=false;
        $scope.loadProfileByKeyword= function (keyword,category) {
            //
            $scope.waitForSearchMoreKeywordSupp=keyword;
            if(!$scope.searchMreSupp) {
                //
                if ($scope.profileList.length >= 100) {
                    if (keyword != undefined) {
                        if (keyword.length == 3) {
                            vm.isAutoDisabled = true;
                            skipSubsProfile = 0;
                            takeSubsProfile = 10;
                            var tempProfileListSupp = [];
                            $scope.filteredUsersSupp = [];
                            $charge.profile().filterByCatKey(skipSubsProfile,takeSubsProfile,category,keyword).success(function (data) {
                                for (var i = 0; i < data.length; i++) {
                                    var obj = data[i];
                                    if(obj.profile_type=='Individual')
                                    {
                                        tempProfileListSupp.push({
                                            profilename : obj.first_name,
                                            profileId : obj.profileId,
                                            othername : obj.last_name,
                                            profile_type : obj.profile_type,
                                            bill_addr:obj.bill_addr,
                                            category:obj.category,
                                            email:obj.email_addr
                                        });
                                    }
                                    else if(obj.profile_type=='Business') {
                                        tempProfileListSupp.push({
                                            profilename : obj.business_name,
                                            profileId : obj.profileId,
                                            othername : obj.business_contact_name,
                                            profile_type : obj.profile_type,
                                            bill_addr:obj.bill_addr,
                                            category:obj.category,
                                            email:obj.email_addr

                                        });
                                    }

                                }
                                $scope.filteredUsersSupp = tempProfileListSupp;
                                vm.isAutoDisabled = false;
                                //autoElem.focus();
                                setTimeout(function(){
                                    document.querySelector('#acProfileId').focus();
                                },0);
                                if (data.length < take)
                                    $scope.searchMreSupp = true;
                                $timeout.cancel($scope.waitForSearchMoreSupp);
                                //skip += take;
                                //$scope.loadPaging(keyword, rows, index, status, skip, take);
                            }).error(function (data) {
                                vm.isAutoDisabled = false;
                                setTimeout(function(){
                                    document.querySelector('#acProfileId').focus();
                                },0);
                                //autoElem.empty();
                                //
                                //vm.products = [];
                                //vm.selectedProduct = null;
                            });
                        }
                        else if(keyword.length>3)
                        {
                            //
                            skipSubsProfile = 0;
                            takeSubsProfile = 10;
                            tempProfileListSupp = [];
                            vm.isAutoDisabled = true;
                            $scope.filteredUsersSupp = [];
                            $charge.profile().filterByCatKey(skipSubsProfile,takeSubsProfile,category,keyword).success(function (data) {
                                for (var i = 0; i < data.length; i++) {
                                    var obj = data[i];
                                    if(obj.profile_type=='Individual')
                                    {
                                        tempProfileListSupp.push({
                                            profilename : obj.first_name,
                                            profileId : obj.profileId,
                                            othername : obj.last_name,
                                            profile_type : obj.profile_type,
                                            bill_addr:obj.bill_addr,
                                            category:obj.category,
                                            email:obj.email_addr
                                        });
                                    }
                                    else if(obj.profile_type=='Business') {
                                        tempProfileListSupp.push({
                                            profilename : obj.business_name,
                                            profileId : obj.profileId,
                                            othername : obj.business_contact_name,
                                            profile_type : obj.profile_type,
                                            bill_addr:obj.bill_addr,
                                            category:obj.category,
                                            email:obj.email_addr

                                        });
                                    }

                                }
                                $scope.filteredUsersSupp = tempProfileListSupp;
                                vm.isAutoDisabled = false;
                                setTimeout(function(){
                                    document.querySelector('#acProfileId').focus();
                                },0);

                                if (data.length < takeSubsProfile)
                                    $scope.searchMreSupp = true;
                                $timeout.cancel($scope.waitForSearchMoreSupp);
                            }).error(function (data) {
                                vm.isAutoDisabled = false;
                                setTimeout(function(){
                                    document.querySelector('#acProfileId').focus();
                                },0);
                                //autoElem.empty();
                            });
                        }
                        else if (keyword.length == 0 || keyword == null) {
                            $scope.filteredUsersSupp = $scope.profileList;
                            $scope.searchMreSupp = false;
                        }
                    }
                    else if (keyword == undefined) {
                        $scope.filteredUsersSupp = $scope.profileList;
                        $scope.searchMreSupp = false;
                    }
                }
            }
            else if (keyword == undefined || keyword.length == 0) {
                $scope.filteredUsersSupp = $scope.profileList;
                $scope.searchMreSupp = false;
            }
        }


        $scope.toggleProfileSearchMre= function (ev) {
            //
            if (ev.keyCode === 8) {
                $timeout.cancel($scope.waitForSearchMoreSupp);
                $scope.waitForSearchMoreSupp = $timeout(function myFunction() {
                    // do something
                    if($scope.searchMreSupp)
                    {
                        $scope.searchMreSupp = false;
                        //$scope.loadProfileByKeyword($scope.waitForSearchMoreKeywordSupp,'Supplier');
                    }
                },1000);
                //$scope.searchMreSupp = false;
            }
        }

        $scope.clearform = function (){
            $scope.content={};
            $scope.content.startDate=new Date();
            $scope.subscriptionUser={};
            //vm.editSelectedPlan={};
        }

        vm.submitted=false;

        function submitSubscription (subscriptionForm){

            if(subscriptionForm == 'subscriptionForm'){
                if (vm.subscriptionForm.$valid == true && $scope.subscriptionUser.selectedPlan) {
                    vm.submitted=true;

                    $scope.content.email=$scope.subscriptionUser.selectedUser.email_addr;
                    $scope.content.planCode=$scope.subscriptionUser.selectedPlan.code;
                    $scope.content.addOns=[];
                    for(var i=0; i<$scope.planAddonList.length; i++)
                    {
                      if($scope.planAddonList[i].isChecked)
                      {
                        $scope.content.addOns.push({
                          "code": $scope.planAddonList[i].code,
                          "qty": $scope.planAddonList[i].qty
                        })
                      }
                    }
                    if($scope.content.startDate == undefined)
                    {
                        $scope.content.startDate = moment(new Date()).format('YYYY-MM-DD');
                    }
                    else
                    {
                        $scope.content.startDate = moment($scope.content.startDate).format('YYYY-MM-DD');
                    }

                    if($scope.content.coupon == undefined)
                    {
                        $scope.content.coupon = "";
                    }

                    if($scope.content.note == undefined)
                    {
                        $scope.content.note = "";
                    }

                    var subscriptionObject = $scope.content;
                    //console.log(planObject);createSubscription
                    $charge.subscription().createSubscription(subscriptionObject).success(function(data){
                        //console.log(data);
                        if(data.response=="succeeded")
                        {
                            notifications.toast("Successfully Subscribed to Plan '"+$scope.subscriptionUser.selectedPlan.name+"'","success");
                            $scope.clearform();
                            vm.submitted=false;

                            $scope.infoJson= {};
                            $scope.infoJson.message ='Subscription added';//JSON.stringify(data);
                            $scope.infoJson.app ='subscriptions';
                            logHelper.info( $scope.infoJson);

                            var subsLength = $scope.items.length;
                            skip = 0;
                            vm.subscriptions=[];
                            //$scope.items = [];
                            //$scope.loading=true;
                            //$scope.more("");
                            $scope.stopPaneOpen = false;
                            $scope.showInpageReadpane = false;
                            closeReadPane();
                            $scope.refreshSubscriptionListLoop(subsLength);
                        }
                        else if(data.response=="failed")
                        {
                            notifications.toast(data.error,"error");

                            //console.log(data);
                            vm.submitted=false;
                        }

                    }).error(function(data){
                        //
                        if(data==201)
                        {
                            notifications.toast("Successfully Subscribed to Plan '"+$scope.subscriptionUser.selectedPlan.name+"'","success");
                            $scope.clearform();
                        }
                        else
                        {
                            //notifications.toast(data,"error");
                            //console.log(data);
                            $errorCheck.getClient().LoadErrorList(data.error).onComplete(function(Response)
                            {
                                var result=Response;
                                notifications.toast(result,"error");

                                $scope.infoJson= {};
                                $scope.infoJson.message =result;
                                $scope.infoJson.app ='plans';
                                logHelper.error( $scope.infoJson);
                                //$scope.errorlist=Response;
                                //for(var i=0; i<$scope.errorlist.length; i++)
                                //{
                                //  var errmsg=$scope.errorlist[i];
                                //  if(data.error[errmsg])
                                //  {
                                //    notifications.toast(data.error[errmsg][0],"error");
                                //  }
                                //}
                            }).onError(function(data)
                            {
                                //console.log(data);
                            });
                        }
                        vm.submitted=false;
                    })
                }else{
                    angular.element(document.querySelector('#subscriptionForm')).find('.ng-invalid:visible:first').focus();
                    if(!$scope.subscriptionUser.selectedPlan)
                    {
                        notifications.toast("Select a plan to continue!","error");
                    }
                }
                //toggleinnerView('add');
            }

        }

        $scope.refreshSubscriptionListLoop = function (length){
            if($scope.items.length != length+1)
            {
                $scope.items = [];
                $scope.loading=true;
                $scope.isLoading = true;

                $azureSearchHandle.getClient().SearchRequest("subscription",0,100,'asc','').onComplete(function(Response)
                {
                    if($scope.loading)
                    {

                        for (var i = 0; i < Response.length; i++) {
                            for (var j = 0; j < $scope.profileList.length; j++) {
                                if($scope.profileList[j].profileId==Response[i].guAccountId)
                                {
                                    Response[i].first_name=$scope.profileList[j].first_name;
                                    Response[i].last_name=$scope.profileList[j].last_name;
                                    break;
                                }
                            }
                            $scope.items.push(Response[i]);
                        }
                        //$timeout(function () {
                        //  vm.plans=$scope.items;
                        //},0);profileId
                        vm.searchMoreInit = false;

                        $scope.isLoading = false;
                        $scope.loading = false;
                        $scope.isdataavailable=true;
                        if(Response.length<100){
                            $scope.isdataavailable=false;
                            $scope.hideSearchMore=true;
                        }
                        $scope.refreshSubscriptionListLoop(length);

                    }

                }).onError(function(data)
                {
                    //console.log(data);
                    $scope.isSpinnerShown=false;
                    $scope.isdataavailable=false;
                    $scope.isLoading = false;
                    $scope.hideSearchMore=true;

                    $scope.refreshSubscriptionListLoop(length);
                });
            }
            else
            {
                vm.subscriptions=$scope.items;
                $scope.isLoading = false;
            }
        }

        $scope.searchKeyPress = function (event,keyword,length){
            if(event.keyCode === 13)
            {
                //console.log("Function Reached!");
                $scope.loadByKeywordSubscription(keyword,length);
            }
        }

        // Kasun_Wijeratne_16_05_2017
        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
            $scope.BaseCurrency=data[0].RecordFieldData;
            //$scope.selectedCurrency = $scope.BaseCurrency;

        }).error(function(data) {
            //console.log(data);
            $scope.BaseCurrency="USD";
            //$scope.selectedCurrency = $scope.BaseCurrency;
        })
        // Kasun_Wijeratne_16_05_2017

        var skipSubscriptionSearch, takeSubscriptionSearch;
        var tempList;
        $scope.loadByKeywordSubscription= function (keyword,length) {
            if($scope.items.length>=100) {
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

                if (keyword.length == searchLength) {
                    //console.log(keyword);
                    //
                    skipSubscriptionSearch = 0;
                    takeSubscriptionSearch = 100;
                    tempList = [];

                    var dbName="";
                    dbName=getDomainName().split('.')[0]+"_"+getDomainExtension();
                    //filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
                    var data={
                        "search": keyword+"*",
                        "searchFields": "email,code",
                        "filter": "(domain eq '"+dbName+"')",
                        "orderby" : "endDate asc",
                        "top":takeSubscriptionSearch,
                        "skip":skipSubscriptionSearch
                    }

                    $charge.azuresearch().getAllSubscriptionPost(data).success(function (data) {
                        for (var i = 0; i < data.value.length; i++) {
                            tempList.push(data.value[i]);
                        }
                        vm.subscriptions = tempList;
                        //skipProfileSearch += takeProfileSearch;
                        //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
                    }).error(function (data) {
                        vm.subscriptions = [];
                    });
                }
                else if (keyword.length == 0 || keyword == null) {
                    vm.subscriptions = $scope.items;
                }

                if(searchLength==0||searchLength==undefined)
                {
                    $scope.loading=true;
                    $scope.more("");
                }
            }
        }

        $scope.showPaymentRetryHistry = function () {
            $scope.paymentRetryHistoryView = true;
            // var element = document.getElementsByTagName('md-tab-content');
            // angular.forEach(element, function (elem) {
            // 	$timeout(function(){
            // 		elem.scrollTop = elem.scrollHeight - elem.clientHeight;
            // 		// angular.element("tab-content-8").animate({ scrollTop: element.scrollHeight - element.clientHeight });
            // 	},0);
            // })
            var elem = angular.element('#moreRetryAnchor').closest("[role='tabpanel']");
            $timeout(function(){
                //elem[0].scrollTop = elem[0].scrollHeight - elem[0].clientHeight;
                elem.animate({ scrollTop: elem[0].scrollHeight - elem[0].clientHeight }, 'fast');
            },0);
        }

        $(document).on('click', '#myBtn', function(){
            //debugger;
            var elem = document.getElementById('myModal');
            $('.content-wrapper').append(elem);
            //elem.remove();
        });


        // Kasun_Wijeratne_27_NOV_2017
        $scope.accGeneralLoaded = true;
        vm.userInfo = {};
        $scope.getUserInfoByID = function(user) {
            try{
                //$charge.myAccountEngine().getUserInfoByID(user.profileId).success(function (response) {
                //	response.data = response;
                //	vm.userInfo = response.data.Result;
                //	if($rootScope.tenantType == 'member'){
                //		vm.userInfo.UserType = 'Member';
                //		vm.userInfo.domain = domain;
                //	}
                //	if (response.data.Result.UserType === "admin") {
                //		$scope.isUserAdmin = true;
                //	}
                //
                //	$scope.accGeneralLoaded = true;
                //}).error(function (data) {
                //	console.log(data);
                //});
                $charge.profile().getByIDWithStripeKey(user.profileId).success(function(data) {
                    //console.log(data);
                    vm.userInfo=data[0];

                    $scope.addUpdateCardDetails(user);

                    // $scope.isLoading = false;
                }).error(function(data) {
                    //console.log(data);
                    $scope.accGeneralLoaded = true;
                })

            }catch(ex){
                ex.app = "myAccount";
                logHelper.error(ex);
            }
        }

        $scope.cardloadform = "";
        $scope.cardLastDigits = {};

        $scope.cardEditEnabled = false;

        $scope.addUpdateCardDetails = function (customer){

            var cardDetails = {};
            $scope.cardEditEnabled = false;
            if(vm.userInfo.stripeCustId!=null)
            {
                $charge.paymentgateway().getPaymentGatewayDetails(customer.profileId).success(function (response) {

                    var cardDetailDigits = response.data[0];
                    if(cardDetailDigits) {
                        $scope.cardLastDigits = cardDetailDigits;

                    }else{
                        $scope.cardLastDigits = {};
                    }

                }).error(function(data) {
                    var cardloadfail = data;
                    $scope.cardLastDigits = {};

                });

                cardDetails = {
                    "profileId": customer.profileId,
                    "redirectUrl": "https://app.cloudcharge.com/planEmbededForm/planSubscriptionScript.php/?method=cardFormShellResponse",
                    "action": "update"
                };
            }
            else
            {
                $scope.cardLastDigits = {};

                cardDetails = {
                    "profileId": customer.profileId,
                    "redirectUrl": "https://app.cloudcharge.com/planEmbededForm/planSubscriptionScript.php/?method=cardFormShellResponse",
                    "action": "insert"
                };
                //$location.absUrl()
            }

            $charge.paymentgateway().addUpdateCard(cardDetails).success(function(data)
            {
                //
                $scope.cardloadform = data;
                if(vm.userInfo.gatewayType=="adyen" || vm.userInfo.gatewayType==null)
                {
                    $scope.cardloadform = $scope.cardloadform.toString().replace("adyen.createEncryptedForm(form, options);", "");
                }
                //angular.element("#addUpdateCardSubsId").empty();
                //angular.element("#addUpdateCardSubsId").append($scope.cardloadform);

                var iframe = document.getElementById('addUpdateCardSubsId');
                // iframe.append($scope.cardloadform);
                if (iframe) {
                    iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);

                    iframe.document.open();
                    iframe.document.write($scope.cardloadform);
                    iframe.document.close();
                    $scope.showMoreUserInfo=false;
                    $scope.accGeneralLoaded = true;
                }

                $timeout(function () {
                    $scope.cardEditEnabled = true;
                },1000);

            }).error(function(data)
            {
                //console.log(dataErrorInvoice);
                //$scope.orderScheduledList.push(objOrderSchedule);
                $scope.accGeneralLoaded = true;

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='Subscription';
                logHelper.error( $scope.infoJson);
            })
        }

        $scope.$watch(function () {
            var iframe = document.getElementById('addUpdateCardSubsId');
            // iframe.append($scope.cardloadform);
            if (iframe) {
                iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);
                if(iframe.document.children[0].children[1].children[1]){
                    var elem = iframe.document.children[0].children[1].children[1].getAttribute('style');

                    if(elem.indexOf('display: block') !== -1){
                        $('#addUpdateCardSubsId').css('height', 550 + 'px');
                    }
                }
            }

        });

        window.updateCardDone=function(){
            /* have access to $scope here*/
            if($scope.subscriptionUser.selectedUser != null && $scope.cardEditEnabled && vm.userInfo.first_name)
            {
                //notifications.toast("reached!","success");
                //$scope.cardEditEnabled = false;
                //vm.userInfo = {};
                //var selectedUser = angular.copy($scope.subscriptionUser.selectedUser);
                //$scope.subscriptionUser.selectedUser = "";
                //$scope.subscriptionUser.selectedUser = selectedUser;
            }
        }

        $scope.addNewUser = function(ev)
        {
            //console.log("yes");
            //$scope.content.user = "";
            $mdDialog.show({
                controller: 'AddNewSubsUserController',
                templateUrl: 'app/main/subscriptions/dialogs/composeNewUser-dialog.html',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: undefined,
                    category: "Customer"
                },
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
                .then(function(user) {
                    if(user != undefined)
                    {
                        $scope.profileList.push(user);
                        $scope.subscriptionUser.selectedUser=user;
                        vm.searchText1=user.first_name;
                    }
                })

        }

        var skipPlan=0;
        var takePlan=100;
        vm.plans= [];
        $scope.isPlansLoading = false;
        $scope.morePlans = function(selectedPlan, status){

            $scope.isPlansLoading = true;
            $azureSearchHandle.getClient().SearchRequest("plan",skipPlan,takePlan,'desc',status).onComplete(function(Response)
            {
                if($scope.loading)
                {
                    skipPlan += takePlan;

                    for (var i = 0; i < Response.length; i++) {
                        Response[i].isSelected = false;
                        vm.plans.push(Response[i]);
                    }
                    //$timeout(function () {
                    //	vm.plans=$scope.items;
                    //});
                    //$timeout(function () {
                    //  vm.plans=$scope.items;
                    //},0);bofoxoc@evyush.com/dimezif@12hosting.net
                    vm.searchMoreInit = false;

                    $scope.isPlansLoading = false;
                    $scope.isdataavailable=true;

                    if(Response.length<takePlan){
                        $scope.isdataavailable=false;
                        $scope.hideSearchMore=true;
                    }
                }

            }).onError(function(data)
            {
                //console.log(data);
                $scope.isSpinnerShown=false;
                $scope.isdataavailable=false;
                $scope.isPlansLoading = false;
                $scope.hideSearchMore=true;

                $scope.infoJson= {};
                $scope.infoJson.message =JSON.stringify(data);
                $scope.infoJson.app ='Subscription';
                logHelper.error( $scope.infoJson);
            });

        };
        $scope.morePlans("","Active");

        $scope.loadUserDetails = function (user) {
            $scope.accGeneralLoaded = false;
            $scope.getUserInfoByID(user);
        }

        $scope.selectPlanForSubscription = function (plan) {
            angular.forEach(vm.plans, function (p) {
                if(plan.code == p.code){
                    plan.isSelected =true;
                }else{
                    p.isSelected = false;
                }
            });
            $scope.subscriptionUser.selectedPlan = plan;
            $scope.checkBasePlanForAddons($scope.subscriptionUser.selectedPlan);
        }
        // Kasun_Wijeratne_27_NOV_2017 - END
    }
})();
