////////////////////////////////
// App : Inventory
// File : AddInventoryController
// Owner  : GihanHerath
// Last changed date : 2016/12/28
// Version : 6.0.0.15
/////////////////////////////////

(function ()
{
  'use strict';

  angular
    .module('app.subscriptions')
    .controller('AddNewSubsUserController', AddNewSubsUserController);

  /** @ngInject */
  function AddNewSubsUserController($mdDialog, selectedMail, category, $scope, $mdToast, notifications, $charge)
  {
    var vm = this;


    vm.hiddenCC = true;
    vm.hiddenBCC = true;

    vm.submitted=false;

    $scope.contentuser={};

    $scope.contentuser.category=category;

    // If replying
    if ( angular.isDefined(selectedMail) )
    {
      vm.form.to = selectedMail.from.email;
      vm.form.subject = 'RE: ' + selectedMail.subject;
      vm.form.message = '<blockquote>' + selectedMail.message + '</blockquote>';
    }

    // Methods
    vm.closeDialog = closeDialog;

    //////////

    function closeDialog()
    {
      $mdDialog.hide();
    }

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.checkRequired=true;

    $scope.submit = function()
    {

      vm.submitted=true;
      if(vm.editForm.$valid)
      {
        $scope.contentuser.billAddress=document.getElementById('autocomplete').value;
        $scope.contentuser.country=document.getElementById('country').value;

        var userObj = $scope.contentuser;

        $charge.profile().store(userObj).success(function(data){
          //console.log(data);

          if(data.response=="succeeded")
          {
            notifications.toast("Successfully Created the Profile","success");
            var userObjModified = {
              "profileId":data.data.profileid,
              "first_name":$scope.contentuser.firstName,
              "last_name":$scope.contentuser.lastName,
              "email_addr":$scope.contentuser.email,
              "phone":$scope.contentuser.phone,
              "bill_addr":$scope.contentuser.billAddress,
              "status":true,
              "stripeCustId":null
            }
            $mdDialog.hide(userObjModified);
          }
          else
          {
            notifications.toast("Creating Profile Failed","error");

          }

        }).error(function(data){
          //console.log(data);
          notifications.toast("Creating Profile Failed","error");

        })
      }
      else
      {
        vm.submitted=false;
        angular.element(document.querySelector('#newUserForm')).find('.ng-invalid:visible:first').focus();
      }


      //
    }

    $scope.clearNewUserDetails = function() {
      vm.submitted=false;

      $scope.contentuser={};
      document.getElementById('autocomplete').value = '';
      document.getElementById('locality').value = '';
      document.getElementById('country').value = '';
      document.getElementById('postal_code').value = '';
      $scope.contentuser.category=category;
    }

  }
})();
