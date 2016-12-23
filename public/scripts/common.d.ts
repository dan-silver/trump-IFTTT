export interface Action {
    name: string;
    code: string;
    cssClasses: string[];
}
export interface User {
    displayName: string;
    email: string;
    uid: string;
    actions?: {};
    makerKey?: string;
}
export declare const actions: Action[];
export declare const database: firebase.database.Database;
export declare const provider: firebase.auth.GoogleAuthProvider;
