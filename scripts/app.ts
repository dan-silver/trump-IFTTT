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
        return saveUserToDb(newUser, false, false);
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
    firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
      let userDb:User = snapshot.val();
      if (userDb) {
        user.actions = userDb.actions;
        user.makerKey = userDb.makerKey;
        $scope.$apply();
      }
    });
  }

  let toggleAction = (enabled:boolean, user:User, action:Action):firebase.Promise<any> => {
    user.actions[action.code] = enabled;
    $scope.$apply();
    return saveUserToDb(user, true, false);
  }

  let saveUserToDb = function(user:User, includeActions:boolean, includeMakerKey:boolean):firebase.Promise<any> {
    let userData:User = {
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

    return firebase.database().ref('users/' + user.uid).update(userData);
  }

  $scope.disableAction = (action:Action) => {
    completeLogin(guser).then((user) => {
      toggleAction(false, user, action);
    })
  }


  $scope.setupAction = (action:Action) => {
    completeLogin(guser).then(() => {
      return toggleAction(true, guser, action);
    }).then(() => {
      configureAction(action);
      $scope.$apply();
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
  let guser:User;
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


  // promise returns when dialog is closed
  // resolve if key is set
  let setMakerKey = ():Promise<any> => {
    return new Promise((resolve, reject) => {
      $scope.makerKey = guser.makerKey;

      // hack to remove placeholder
      // https://github.com/google/material-design-lite/issues/903
      setTimeout(() => {
        let input:any = document.querySelector('#makerKey').parentNode;
        let textField:any = input.MaterialTextfield;
        textField.checkDirty();
      }, 0);



      var dialog:any = document.getElementById('makerDialog');
      dialog.showModal();
      dialog.addEventListener("close", () => {
        if ($scope.makerKey)
          return resolve();
        else
          return reject();
      });
    });
  }


  $scope.setMakerKey = setMakerKey;


  $scope.$watch('makerKey', (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }

    guser.makerKey = $scope.makerKey;
    saveUserToDb(guser, false, true);

  }, true);


  let ensureMakerKeyIsSet = ():Promise<any> => {
    if (guser.makerKey) {
      return Promise.resolve();
    }

    return setMakerKey()
  }

  let configureAction = (action:Action) => {
    ensureMakerKeyIsSet().then(() => {
      $scope.selectedAction = action;
      var dialog:any = document.getElementById('actionDialog');

      dialog.showModal();
      $scope.$apply();
    });

  }
  $scope.configureAction = configureAction;

  $scope.closeDialogById = (id:string) => {
    var dialog:any = document.getElementById(id);
    dialog.close();
  }
});