(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./common":2,"./users":3}],2:[function(require,module,exports){
"use strict";
exports.actions = [
    {
        name: "Trump orders launch of nuclear weapon",
        code: "nuke-order",
        cssClasses: ["mdl-color--grey-300", "explosion_background"]
    },
    {
        name: "Trump fires cabinet member",
        code: "fire-cabinet",
        cssClasses: ["mdl-color--light-blue-300", "trump-background"]
    },
    {
        name: "Trump bans Muslim immigration",
        code: "muslim-immigration",
        cssClasses: ["mdl-color--cyan-300", "mosque-background"]
    },
    {
        name: "Trump leaks classified documents",
        code: "leak-documents",
        cssClasses: ["mdl-color--orange-300", "documents-background"]
    },
    {
        name: "Trump visits Russia",
        code: "visit-russia",
        cssClasses: ["mdl-color--purple-300", "plane-background"]
    },
    {
        name: "Congress votes to impeach Trump",
        code: "impeach-trump",
        cssClasses: ["mdl-color--lime-300", "congress-background"]
    }
];
const config = {
    apiKey: "AIzaSyC-8RA-yIW0pNfPjFrOS8G0eCEAlh8QbO0",
    authDomain: "trump-ifttt.firebaseapp.com",
    databaseURL: "https://trump-ifttt.firebaseio.com",
    storageBucket: "trump-ifttt.appspot.com",
    messagingSenderId: "248784558301"
};
firebase.initializeApp(config);
exports.database = firebase.database();
exports.provider = new firebase.auth.GoogleAuthProvider();

},{}],3:[function(require,module,exports){
"use strict";
const common_1 = require("./common");
exports.completeLogin = (existingUser) => {
    return new Promise((resolve, reject) => {
        if (existingUser) {
            return resolve(existingUser);
        }
        return resolve(exports.getFromGoogleSignin().then((user) => {
            return exports.saveToDb(user, false, false);
        }));
    }).then((user) => {
        return new Promise((resolve, reject) => {
            firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
                let userDb = snapshot.val();
                if (userDb) {
                    user.actions = userDb.actions || {};
                    user.makerKey = userDb.makerKey;
                    return resolve(user);
                }
                reject('error loading user');
            });
        });
    });
};
exports.saveToDb = (user, includeActions, includeMakerKey) => {
    let userData = {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid
    };
    if (includeActions) {
        userData.actions = user.actions;
    }
    if (includeMakerKey) {
        userData.makerKey = user.makerKey;
    }
    return firebase.database().ref('users/' + user.uid).update(userData).then(() => {
        return user;
    });
};
exports.getFromGoogleSignin = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInWithPopup(common_1.provider).then((result) => {
            resolve(result.user);
        });
    });
};

},{"./common":2}]},{},[1]);
