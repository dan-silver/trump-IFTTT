import {actions, Action, User, provider} from './common';

export let completeLogin = (existingUser?:User):Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    if (existingUser) {
      return resolve(existingUser);
    }

    return resolve(getFromGoogleSignin().then((user) => {
      return saveToDb(user, false, false);
    }));
  }).then((user) => {
    return new Promise<User>((resolve, reject) => {
      firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
        let userDb:User = snapshot.val();
        if (userDb) {
          user.actions = userDb.actions || {};
          user.makerKey = userDb.makerKey;
          return resolve(user);
        }
        reject('error loading user');
      });
    });
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

  return firebase.database().ref('users/' + user.uid).update(userData).then(() => {
    return user;
  });
}

export let getFromGoogleSignin = ():Promise<User> => {
  return new Promise((resolve, reject) => {
    firebase.auth().signInWithPopup(provider).then((result) => {
      resolve(result.user);
    });
  });
}