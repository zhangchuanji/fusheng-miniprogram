import { refreshTokenAPI } from '@/api/login'
import { BASE_URL, TIME_OUT } from './config'
import TaroRequest from './request'
import { appURL } from './url'
import Taro from '@tarojs/taro'

// 创建Taro请求实例的工厂函数
const createTaroRequest = (baseURL: string) => {
  return new TaroRequest({
    baseURL,
    timeout: TIME_OUT,
    header: {
      'tenant-id': '1'
    },
    interceptors: {
      requestSuccessFn: config => {
        // 在请求拦截器中动态获取token
        const tokenData = Taro.getStorageSync('token')

        if (tokenData) {
          const token = tokenData.accessToken
          config.header = {
            ...config.header,
            Authorization: `Bearer ${token}`
          }
        }
        return config
      },
      requestFailureFn: error => {
        console.log('Taro请求失败', error)
        return error
        // return Promise.reject(error)
      },
      responseSuccessFn: res => {
        // 统一处理响应数据
        if (res.statusCode === 200) {
          if (res.data.code == 0) {
            return res.data
          } else if (res.data.code == 401) {
            Taro.reLaunch({
              url: '/pages/login/index'
            })
            refreshTokenAPI({ refreshToken: Taro.getStorageSync('token').refreshToken }, response => {
              if (response.success) {
                // 刷新成功，更新token和登录时间
                Taro.setStorageSync('token', response.data)
                Taro.setStorageSync('loginTime', Date.now())
              }
            })
            return res.data
          } else {
            throw res.data
          }
        } else {
          throw res
        }
      },
      responseFailureFn: error => {
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
export const taroPut = taroRequest.put.bind(taroRequest)
export const taroDelete = taroRequest.delete.bind(taroRequest)
