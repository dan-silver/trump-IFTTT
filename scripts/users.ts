import {actions, Action, User, provider} from './common';

export let completeLogin = function(existingUser?:User):Promise<User> {
  return new Promise<User>((resolve, reject) => {
    if (existingUser) {
      existingUser.actions = existingUser.actions || {};
      return resolve(existingUser);
    }

    return resolve(getFromGoogleSignin().then((newUser) => {
      newUser.actions = {placeholder:true};
      return saveToDb(newUser, false, false);
    }));
  });
}


export let saveToDb = (user:User, includeActions:boolean, includeMakerKey:boolean):firebase.Promise<any> => {
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

export let getFromGoogleSignin = ():Promise<User> => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithPopup(provider).then(function(result) {
        resolve(result.user);
      });
    });
  }
