import { User } from './common';
export declare let completeLogin: (existingUser?: User) => Promise<User>;
export declare let saveToDb: (user: User, includeActions: boolean, includeMakerKey: boolean) => firebase.Promise<any>;
export declare let getFromGoogleSignin: () => Promise<User>;
