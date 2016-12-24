export interface Action {
  name: string,
  code: string,
  cssClasses: string[]
}

export interface User {
  displayName: string,
  email: string,
  uid: string,
  actions?: {},
  makerKey?: string
}

export const actions:Action[] = [
  {
    name:"Trump orders launch of nuclear weapon",
    code:"nuke-order",
    cssClasses: ["mdl-color--grey-300", "explosion_background"]
  },
  {
    name:"Trump bans Muslim immigration",
    code:"muslim-immigration",
    cssClasses: ["mdl-color--cyan-300", "mosque-background"]
  },
  {
    name:"Trump leaks classified documents",
    code:"leak-documents",
    cssClasses: ["mdl-color--orange-300", "documents-background"]
  },
  {
    name:"Trump visits Russia",
    code:"visit-russia",
    cssClasses: ["mdl-color--purple-300", "plane-background"]
  },
  {
    name:"Trump repeals Obamacare",
    code:"repeal-obamacare",
    cssClasses: ["mdl-color--blue-400", "doctor-background"]
  },
  {
    name:"Congress votes to impeach Trump",
    code:"impeach-trump",
    cssClasses: ["mdl-color--lime-300", "congress-background"]
  },
  {
    name:"Construction begins on the Mexican wall",
    code:"wall-construction",
    cssClasses: ["mdl-color--amber-300", "wall-background"]
  },
  {
    name:"Trump fires cabinet member",
    code:"fire-cabinet",
    cssClasses: ["mdl-color--light-blue-300", "trump-background"]
  },
  {
    name:"Trump creates deportation force",
    code:"deportation-force",
    cssClasses: ["mdl-color--red-400", "police-background"]
  }
]

const config = {
  apiKey: "AIzaSyC-8RA-yIW0pNfPjFrOS8G0eCEAlh8QbO0",
  authDomain: "trump-ifttt.firebaseapp.com",
  databaseURL: "https://trump-ifttt.firebaseio.com",
  storageBucket: "trump-ifttt.appspot.com",
  messagingSenderId: "248784558301" 
};

firebase.initializeApp(config);

export const database = firebase.database();
export const provider = new firebase.auth.GoogleAuthProvider();
