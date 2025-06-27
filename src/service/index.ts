import { BASE_URL, TIME_OUT } from './config'
import TaroRequest from './request'
import { appURL } from './url'

// 创建Taro请求实例的工厂函数
const createTaroRequest = (baseURL: string) => {
  return new TaroRequest({
    baseURL,
    timeout: TIME_OUT,
    header: {
      'Authorization': `Bearer test1`,
      'tenant-id': '1'
    },
    interceptors: {
      requestSuccessFn: (config) => {
        return config
      },
      requestFailureFn: (error) => {
        console.log('Taro请求失败', error)
        return error
        // return Promise.reject(error)
      },
      responseSuccessFn: (res) => {
        // 统一处理响应数据
        if (res.statusCode === 200) {
          if (res.data.code == 0) {
            return res.data
          } else {
            throw res.data
          }
        } else {
          throw res
        }
      },
      responseFailureFn: (error) => {
        console.log('Taro响应失败', error)
        return error
        // return Promise.reject(error)
      }
    }
  })
}

// 创建不同的请求实例
export const taroRequest = createTaroRequest(BASE_URL + appURL)

// 简化的请求方法，可以直接替换原生Taro.request
export const taroHttpRequest = taroRequest.request.bind(taroRequest)
export const taroGet = taroRequest.get.bind(taroRequest)
export const taroPost = taroRequest.post.bind(taroRequest)
