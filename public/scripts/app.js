"use strict";
const common_1 = require("./common");
const users = require("./users");
const app = angular.module('trump', []);
app.controller('TrumpController', function TrumpController($scope) {
    $scope.actionIsEnabled = function (action) {
        let user = $scope.getUser();
        if (!user || user.actions == undefined) {
            return false;
        }
        return user.actions[action.code];
    };
    let toggleAction = (enabled, user, action) => {
        user.actions[action.code] = enabled;
        $scope.$apply();
        return users.saveToDb(user, true, false);
    };
    $scope.disableAction = (action) => {
        users.completeLogin(guser).then((user) => {
            $scope.$apply();
            toggleAction(false, user, action);
        });
    };
    let configureAction = (action) => {
        return ensureMakerKeyIsSet().then(() => {
            $scope.selectedAction = action;
            var dialog = document.getElementById('actionDialog');
            dialog.showModal();
            $scope.$apply();
        });
    };
    $scope.manualLogin = () => {
        users.completeLogin().then((user) => {
            guser = user;
            $scope.$apply();
        });
    };
    $scope.setupAction = (action) => {
        console.log("AAAAAAAaa");
        users.completeLogin(guser).then((user) => {
            guser = user;
            $scope.$apply();
            console.log("BBBBBBBBBBBBBBBB");
            debugger;
            $scope.$apply();
            return configureAction(action);
        }).then(() => {
            return toggleAction(true, guser, action);
        }).then(() => {
            $scope.$apply();
        });
    };
    let signout = function () {
        return firebase.auth().signOut();
    };
    // try to restore a session
    let guser;
    $scope.getUser = function () {
        return guser;
    };
    firebase.auth().onAuthStateChanged((user) => {
        // when log out
        if (!user) {
            guser = null;
            $scope.$apply();
            return;
        }
        users.completeLogin(user).then((user) => {
            guser = user;
            $scope.$apply();
        });
    });
    // promise returns when dialog is closed
    // resolve if key is set
    let setMakerKey = () => {
        return new Promise((resolve, reject) => {
            $scope.makerKey = guser.makerKey;
            // hack to remove placeholder
            // https://github.com/google/material-design-lite/issues/903
            setTimeout(() => {
                let input = document.querySelector('#makerKey').parentNode;
                let textField = input.MaterialTextfield;
                textField.checkDirty();
            }, 0);
            const dialog = document.getElementById('makerDialog');
            dialog.showModal();
            dialog.addEventListener("close", () => {
                if ($scope.makerKey)
                    return resolve();
                else {
                    return reject();
                }
            });
        });
    };
    $scope.$watch('makerKey', (newValue, oldValue) => {
        if (newValue === oldValue) {
            return;
        }
        guser.makerKey = $scope.makerKey;
        users.saveToDb(guser, false, true);
    }, true);
    let ensureMakerKeyIsSet = () => {
        if (guser && guser.makerKey) {
            return Promise.resolve();
        }
        return setMakerKey().catch(() => {
            const snackbarContainer = document.querySelector('#demo-snackbar-example');
            const data = {
                message: "We couldn't read your Maker key.",
                timeout: 2500
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
            throw 'no-maker-key';
        });
    };
    $scope.closeDialogById = (id) => {
        var dialog = document.getElementById(id);
        dialog.close();
    };
    $scope.actions = common_1.actions;
    $scope.completeLogin = users.completeLogin;
    $scope.setMakerKey = setMakerKey;
    $scope.configureAction = configureAction;
    $scope.signout = signout;
    $scope.signin = users.getFromGoogleSignin;
});
//# sourceMappingURL=app.js.map