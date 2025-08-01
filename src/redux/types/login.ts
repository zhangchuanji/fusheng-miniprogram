export interface IUserInfo {
  openid: string
  userInfo: any
  id?: number
  nickname?: string
  avatar?: string
  routineOpenid?: string
  mobile?: string
  companyName?: string
  name?: string
  targetCompanyServe?: string
}

export interface ILoginState {
  loginStatus: number
  userInfo: IUserInfo | null
}
