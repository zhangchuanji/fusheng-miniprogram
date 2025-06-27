export interface IResponse<T = any> {
  success: boolean
  data?: T
  errMsg?: any
}
