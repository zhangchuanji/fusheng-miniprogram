import { BASE_URL, TIME_OUT } from './config'
import TaroRequest from './request'
import { appURL } from './url'
import Taro from '@tarojs/taro'
import { refreshTokenAPI } from '@/api/login'

// 先创建taroRequest实例
const createTaroRequest = (baseURL: string) => {
  const request = new TaroRequest({
    baseURL,
    timeout: TIME_OUT,
    header: {
      'tenant-id': '1'
    },
    interceptors: {
      requestSuccessFn: config => {
        // 添加token到请求头
        const token = Taro.getStorageSync('token')
        if (token && token.accessToken) {
          config.header = config.header || {}
          config.header.Authorization = `Bearer ${token.accessToken}`
        }
        return config
      },
      requestFailureFn: error => {
        return error
      },
      responseSuccessFn: res => {
        // 统一处理响应数据
        if (res.statusCode === 200) {
          if (res.data.code == 0) {
            return res.data
          } else if (res.data.code == 401) {
            // 实现token无感刷新
            const storedToken = Taro.getStorageSync('token')
            if (!storedToken || !storedToken.refreshToken) {
              // 没有refreshToken，直接跳转到登录页
              Taro.removeStorageSync('token')
              Taro.removeStorageSync('loginTime')
              Taro.removeStorageSync('userOpenid')
              Taro.reLaunch({ url: '/pages/login/index' })
              return Promise.reject(res.data)
            }

            // 构造原始请求配置
            const originalRequest = {
              url: res.config?.url || '',
              method: res.config?.method || 'GET',
              data: res.config?.data,
              header: res.config?.header || {},
              request
            }

            console.log(request, '==========')

            // 如果正在刷新token，将请求加入队列
            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject, originalRequest })
              })
            }

            isRefreshing = true

            return new Promise((resolve, reject) => {
              refreshTokenAPI({ refreshToken: storedToken.refreshToken }, response => {
                isRefreshing = false

                if (response.success) {
                  // 刷新成功，更新本地存储
                  Taro.setStorageSync('token', response.data)
                  Taro.setStorageSync('loginTime', Date.now())

                  // 处理队列中的请求
                  processQueue(null, response.data.accessToken)

                  // 重新发送原始请求
                  originalRequest.header.Authorization = `Bearer ${response.data.accessToken}`
                  // 直接返回Promise
                  resolve(taroRequest.request(originalRequest))
                } else {
                  // 刷新失败，清除本地数据并跳转到登录页
                  Taro.removeStorageSync('token')
                  Taro.removeStorageSync('loginTime')
                  Taro.removeStorageSync('userOpenid')

                  processQueue(response, null)

                  Taro.reLaunch({ url: '/pages/login/index' })
                  reject(response)
                }
              })
            })
          } else {
            throw res.data
          }
        } else {
          throw res
        }
      },
      responseFailureFn: error => {
        console.error('Request failed:', error)
        return error
      }
    }
  })

  return request
}

// 创建不同的请求实例
export const taroRequest = createTaroRequest(BASE_URL + appURL)

// 然后定义使用taroRequest的函数
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
  originalRequest: any
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error)
    } else {
      if (token) {
        originalRequest.header = originalRequest.header || {}
        originalRequest.header.Authorization = `Bearer ${token}`
      }
      // 现在可以正确使用taroRequest
      originalRequest.request({
        ...originalRequest,
        success: resolve,
        fail: reject
      })
    }
  })
  failedQueue = []
}

// 简化的请求方法，可以直接替换原生Taro.request
export const taroHttpRequest = taroRequest.request.bind(taroRequest)
export const taroGet = taroRequest.get.bind(taroRequest)
export const taroPost = taroRequest.post.bind(taroRequest)
export const taroPut = taroRequest.put.bind(taroRequest)
export const taroDelete = taroRequest.delete.bind(taroRequest)
