import {actions} from './common';

declare var firebase, angular;

var config = {
  apiKey: "AIzaSyC-8RA-yIW0pNfPjFrOS8G0eCEAlh8QbO0",
  authDomain: "trump-ifttt.firebaseapp.com",
  databaseURL: "https://trump-ifttt.firebaseio.com",
  storageBucket: "trump-ifttt.appspot.com",
  messagingSenderId: "248784558301"
};
firebase.initializeApp(config);



var provider = new firebase.auth.GoogleAuthProvider();

function signin() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(user);
    debugger;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    debugger;
    console.log(error);
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}



var app = angular.module('trump', []);

app.controller('TrumpController', function TrumpController($scope) {
  $scope.actions = actions;
});