import {actions, Action, User} from './common';

declare var angular;

const config = {
  apiKey: "AIzaSyC-8RA-yIW0pNfPjFrOS8G0eCEAlh8QbO0",
  authDomain: "trump-ifttt.firebaseapp.com",
  databaseURL: "https://trump-ifttt.firebaseio.com",
  storageBucket: "trump-ifttt.appspot.com",
  messagingSenderId: "248784558301" 
};

firebase.initializeApp(config);

const database = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();


const app = angular.module('trump', []);

app.controller('TrumpController', function TrumpController($scope) {
  $scope.actions = actions;

  let completeLogin = function(existingUser?:User):Promise<User> {
    return new Promise<User>((resolve, reject) => {
      if (existingUser) {
        // this line 
        // existingUser.actions = existingUser.actions || {};
        return resolve(existingUser);
      }

      return resolve(getUserFromGoogleSignin().then((newUser) => {
        newUser.actions = {placeholder:true};
        return saveUserToDb(newUser, false);
      }));
    }).then((user) => {
      $scope.$apply();
      return user;
    })
  }

  $scope.completeLogin = completeLogin;

  $scope.actionIsEnabled = function(action:Action) {
    let user = $scope.getUser();
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
    $scope.$apply();
    return saveUserToDb(user, true);
  }

  let saveUserToDb = function(user:User, includeActions:boolean):firebase.Promise<any> {
    let userData:User = {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid
    };

    if (includeActions) {
        userData.actions = user.actions
    }

    return firebase.database().ref('users/' + user.uid).update(userData);
  }

  $scope.disableAction = (action:Action) => {
    completeLogin(guser).then((user) => {
      toggleAction(false, user, action);
    })
  }


  $scope.setupAction = (action:Action) => {
    completeLogin(guser).then((user) => {
      return toggleAction(true, user, action);
    }).then(() => {
      configureAction(action);
    });
  }

  let signout = function():firebase.Promise<any> {
    return firebase.auth().signOut();
  }

  $scope.signout = signout;

  let getUserFromGoogleSignin = function():Promise<User> {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithPopup(provider).then(function(result) {
        resolve(result.user);
      });
    });
  }

  $scope.signin = getUserFromGoogleSignin;

  // try to restore a session
  let guser;
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





  // https://internal-api.ifttt.com/maker

  let configureAction = (action:Action) => {
    $scope.selectedAction = action;

    var dialog:any = document.querySelector('dialog');
    
    dialog.showModal()
  }
  $scope.configureAction = configureAction;

  $scope.closeActionDialog = () => {
    var dialog:any = document.querySelector('dialog');
    dialog.close();
  }
});