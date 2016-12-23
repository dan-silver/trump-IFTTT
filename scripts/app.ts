import {actions, Action, User} from './common';

declare var angular;

var config = {
  apiKey: "AIzaSyC-8RA-yIW0pNfPjFrOS8G0eCEAlh8QbO0",
  authDomain: "trump-ifttt.firebaseapp.com",
  databaseURL: "https://trump-ifttt.firebaseio.com",
  storageBucket: "trump-ifttt.appspot.com",
  messagingSenderId: "248784558301" 
};
firebase.initializeApp(config);

var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();


var app = angular.module('trump', []);

app.controller('TrumpController', function TrumpController($scope) {
  $scope.actions = actions;

  var completeLogin = function(existingUser?:User):Promise<User> {
    return new Promise<User>((resolve, reject) => {
      if (existingUser) {
        existingUser.actions = existingUser.actions || {};
        return resolve(existingUser);
      }

      return resolve(getUserFromGoogleSignin().then((newUser) => {
        newUser.actions = {placeholder:true};
        return saveUserToDb(newUser);
      }));
    }).then((user) => {
      $scope.$apply();
      return user;
    })
  }

  $scope.completeLogin = completeLogin;

  $scope.actionIsEnabled = function(action:Action) {
    let user = $scope.getUser();
    console.log(!user || user.actions == undefined)
    if (!user || user.actions == undefined) {
      return false;
    }
    return user.actions[action.code];
  }

  function listenForActions(user:User) {
    firebase.database().ref('users/' + user.uid + '/actions').once('value').then(function(snapshot) {
      let actions = snapshot.val();
      if (actions) {
        user.actions = actions;
        $scope.$apply();
      }
    });
  }

  let toggleAction = (enabled:boolean, user:User, action:Action):firebase.Promise<any> => {
    user.actions[action.code] = enabled;
    return saveUserToDb(user);
  }

  let saveUserToDb = function(user:User):firebase.Promise<any> {
    let userData:User = {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        actions: user.actions
    };

    return firebase.database().ref('users/' + user.uid).set(userData).then(() => {
      return user;
    });
  }

  $scope.disableAction = (action:Action) => {
    completeLogin(guser).then((user) => {
      toggleAction(false, user, action)
    })
    .then(() => {
      $scope.$apply();
    })
  }


  $scope.setupAction = (action:Action) => {
    completeLogin(guser).then((user) => {
      return toggleAction(true, user, action);
    }).then(() => {
      $scope.$apply();
    })
  }

  var signout = function():firebase.Promise<any> {
    return firebase.auth().signOut();
  }

  $scope.signout = signout;

  var getUserFromGoogleSignin = function():Promise<User> {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithPopup(provider).then(function(result) {
        console.log(result.user);
        resolve(result.user);
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  $scope.signin = getUserFromGoogleSignin;


  // try to restore a session
  var guser;
  $scope.getUser = function() {
    return guser;
  }
  firebase.auth().onAuthStateChanged((user) => {
    guser = user;
    if (user) {
      completeLogin(user).then((user) => {
        listenForActions(guser);
      });
    } else {
      guser = null;
      $scope.$apply();
    }
  });
});