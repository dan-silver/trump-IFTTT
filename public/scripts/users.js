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
//# sourceMappingURL=users.js.map