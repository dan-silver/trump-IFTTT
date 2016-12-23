export interface Action {
  name: string,
  code: string,
  cssClasses: string[]
}

export interface User {
  displayName: string,
  email: string,
  uid: string,
  actions: {}
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
    name:"Trump visits Russia",
    code:"visit-russia",
    cssClasses: ["mdl-color--purple-300", "plane-background"]
  }
]