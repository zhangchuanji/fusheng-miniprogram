import { taroGet } from '@/service'
import { EXAMPLE_URL } from '@/service/url'
import { IResponse } from './types'
import { IExampleRequest, IExampleResponse } from './types/example'

export const exampleAPI = (data: IExampleRequest, callback: (res: IResponse<IExampleResponse>) => void) => {
  taroGet({
    url: EXAMPLE_URL.exampleURL,
    params: data,
    success: (res) => {
      if (res.code == 0) {
        callback({
          success: true,
          data: res.data
        })
      } else {
        callback({
          success: false,
          data: res.data,
          errMsg: res.msg || '请求失败'
        })
      }
    },
    fail: (err) => {
      if (err instanceof Promise) {
        err.catch((errMsg) => {
          callback({
            success: false,
            errMsg: errMsg
          })
        })
      } else {
        callback({
          success: false,
          errMsg: err
        })
      }
    }
  }).catch(() => {
  })
}
