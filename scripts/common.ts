export interface Action {
  name: string,
  code: string,
  cssClasses: string[]
}

export interface User {
  displayName: string,
  email: string,
  uid: string,
  actions?: {}
}

export const actions:Action[] = [
  {
    name:"Trump orders launch of nuclear weapon",
    code:"nuke-order",
    cssClasses: ["mdl-color--grey-300", "explosion_background"]
  },
  {
    name:"Trump fires cabinet member",
    code:"fire-cabinet",
    cssClasses: ["mdl-color--light-blue-300", "trump-background"]
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
    name:"Congress votes to impeach Trump",
    code:"impeach-trump",
    cssClasses: ["mdl-color--lime-300", "congress-background"]
  }
]