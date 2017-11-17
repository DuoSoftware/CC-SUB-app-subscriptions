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
	function SubscriptionsController($scope, $timeout, $mdDialog, $mdMedia, $mdSidenav, $filter, $charge, $errorCheck, notifications, $azureSearchHandle, logHelper)
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
		$scope.showUser = false;
		$scope.showCode = false;
		$scope.showType = false;
		$scope.showLast = false;
		$scope.showNext = false;
		$scope.showState = false;

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
			if(_st=="sandbox"){
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
				vm.selectedSubscription.endDate=subscription.endDate;
				vm.selectedSubscription.lastBillDate=subscription.lastBillDate;
				//vm.selectedSubscription.email_addr=subscription.email_addr;
				vm.selectedSubscription.orderStatus=subscription.status;
				vm.selectedSubscription.guAccountId=subscription.guAccountId;
				vm.selectedSubscription.guOrderId=subscription.guOrderId;
				vm.selectedSubscription.first_name=subscription.first_name;
				vm.selectedSubscription.class=subscription.class;
				vm.selectedSubscription.remark=subscription.remark;//endofsubscription

				$charge.tax().getTaxGrpByIDs(vm.selectedSubscription.taxID).success(function(data) {
					var taxid=data.groupDetail[0].taxid;
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
				//console.log(data);
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
				//console.log(data);
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
					$scope.cancelEdit();
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

					$timeout(function(){
						skip = 0;
					});
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

			//var dbNamePart1="";
			//var dbNamePart2="";
			//var dbName="";
			//var filter="";
			//dbNamePart1=getDomainName().split('.')[0];
			//dbNamePart2=getDomainExtension();
			//dbName=dbNamePart1+"_"+dbNamePart2;
			////filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
			//var data={
			//  "search": "*",
			//  "filter": "(domain eq '"+dbName+"')",
			//  "orderby" : "createddate desc",
			//  "top":takeProfiles,
			//  "skip":skipProfiles
			//}
			//
			//$charge.azuresearch().getAllProfilesPost(data).success(function(data)
			//{
			//  //console.log(data);
			//  if(vm.loadingProfiles)
			//  {
			//    skipProfiles += takeProfiles;
			//    //
			//
			//    for (var i = 0; i < data.value.length; i++) {
			//      //
			//      if(data.value[i].status==0)
			//      {
			//        data.value[i].status=false;
			//      }
			//      else
			//      {
			//        data.value[i].status=true;
			//      }
			//      data.value[i].createddate = new Date(data.value[i].createddate);
			//      $scope.profileList.push(data.value[i]);
			//
			//    }
			//
			//    vm.loadingProfiles = false;
			//    if(data.value.length<takeProfiles){
			//      $scope.more("");
			//    }
			//    else
			//    {
			//      $scope.loadProfiles();
			//    }
			//  }
			//}).error(function(data)
			//{
			//  //console.log(data);
			//  vm.loadingProfiles = false;
			//  $scope.more("");
			//})

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
		$scope.loadPlans();

		$scope.isLoading = true;
		$scope.isdataavailable=true;
		$scope.hideSearchMore=false;

		var skip=0;
		var take=100;
		$scope.loading = true;

		$scope.more = function(status){

			$scope.isLoading = true;
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
			//})

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

			if($scope.planList!="" && $scope.planList!=undefined)
			{
				for (var i = 0, len = $scope.planList.length; i<len; ++i){
					//console.log($scope.allBanks[i].value.value);first_name last_name

					if($scope.planList[i].name!="" && $scope.planList[i].name!=undefined)
					{
						if($scope.planList[i].name.toLowerCase().indexOf(query.toLowerCase()) == 0)
						{
							results.push($scope.planList[i]);
						}
					}
				}
			}
			return results;
		}

		$scope.planAddonList=[];

		$scope.checkBasePlanForAddons= function (selectedPlan) {
			$scope.planAddonList=[];
			if(selectedPlan != null && selectedPlan.type=="Base-Plan")
			{
				var basePlanCode = selectedPlan.code;
				$charge.plan().getAddonsforBasePlan(basePlanCode).success(function(data){
					//console.log(data);
					$scope.planAddonList=data;

				}).error(function(data){
					//

				})
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
				if (vm.subscriptionForm.$valid == true) {
					vm.submitted=true;

					$scope.content.email=$scope.subscriptionUser.selectedUser.email_addr;
					$scope.content.planCode=$scope.subscriptionUser.selectedPlan.code;
					$scope.content.addOns=[];
					for(var i=0; i<$scope.planAddonList.length; i++)
					{
						$scope.content.addOns.push({
							"code": $scope.planAddonList[i],
							"qty": 1
						})
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

							skip = 0;
							vm.subscriptions=[];
							$scope.items = [];
							$scope.loading=true;
							$scope.more("");
							$scope.stopPaneOpen = false;
							$scope.showInpageReadpane = false;
							closeReadPane();
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
					//console.log(planObject);
					$charge.plan().updatePlan(planObject).success(function(data){
						//console.log(data);
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

							//console.log(data);
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
						//console.log(data);
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


	}
})();
