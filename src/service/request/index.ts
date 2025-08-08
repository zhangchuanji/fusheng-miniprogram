import Taro from '@tarojs/taro'
import type { TaroRequestConfig, TaroInterceptors, GlobalInterceptors } from './type'

class TaroRequest {
  private globalInterceptors: GlobalInterceptors = {
    request: {
      success: [],
      failure: []
    },
    response: {
      success: [],
      failure: []
    }
  }

  private instanceInterceptors?: TaroInterceptors
  private baseConfig: Partial<Taro.request.Option>

  constructor(config?: { baseURL?: string; timeout?: number; header?: Record<string, any>; interceptors?: TaroInterceptors }) {
    this.baseConfig = {
      timeout: config?.timeout || 120000,
      header: config?.header || {}
    }

    if (config?.baseURL) {
      this.baseConfig.url = config.baseURL
    }

    this.instanceInterceptors = config?.interceptors

    // 添加默认的全局拦截器
    this.addGlobalRequestInterceptor(
      config => {
        return config
      },
      err => {
        console.error('请求失败:', err)
        return Promise.reject(err)
      }
    )

    this.addGlobalResponseInterceptor(
      res => {
        // ('请求成功:', res)
        return res
      },
      err => {
        console.error('响应失败:', err)
        Taro.showToast({
          title: err.data.msg,
          icon: 'error',
          duration: 2000
        })
        this.handleError(err)
        return Promise.reject(err)
      }
    )
  }

  // 添加全局请求拦截器
  addGlobalRequestInterceptor(successFn: (config: Taro.request.Option) => Taro.request.Option, failureFn?: (err: any) => any) {
    this.globalInterceptors.request.success.push(successFn)
    if (failureFn) {
      this.globalInterceptors.request.failure.push(failureFn)
    }
  }

  // 添加全局响应拦截器
  addGlobalResponseInterceptor(successFn: (res: any) => any, failureFn?: (err: any) => any) {
    this.globalInterceptors.response.success.push(successFn)
    if (failureFn) {
      this.globalInterceptors.response.failure.push(failureFn)
    }
  }

  // 错误处理
  private handleError(error: any) {
    const showMessage = (message: string, type: 'success' | 'error' | 'loading' | 'none' = 'none') => {
      Taro.showToast({
        title: message,
        icon: type,
        duration: 2000
      })
    }

    if (error.errMsg) {
      // Taro request 错误
      const errMsg = error.errMsg
      if (errMsg.includes('timeout')) {
        showMessage('请求超时', 'error')
      } else if (errMsg.includes('CONNECTION_REFUSED')) {
        showMessage('服务器连接失败，请稍后重试', 'error')
      } else if (errMsg.includes('fail')) {
        showMessage('网络错误，请检查网络连接', 'error')
      } else {
        showMessage('请求失败', 'error')
      }
    } else if (error.statusCode) {
      // HTTP状态错误
      const status = error.statusCode
      switch (status) {
        case 401:
          showMessage('未授权', 'error')
          break
        case 403:
          showMessage('拒绝访问', 'error')
          break
        case 404:
          showMessage('请求的资源不存在', 'error')
          break
        case 500:
          showMessage('服务器错误', 'error')
          break
        default:
          showMessage(`请求失败: ${status}`, 'error')
      }
    }
  }

  // 执行请求拦截器
  private executeRequestInterceptors(config: TaroRequestConfig): Taro.request.Option {
    let processedConfig = { ...config }

    try {
      // 执行全局请求成功拦截器
      for (const interceptor of this.globalInterceptors.request.success) {
        processedConfig = interceptor(processedConfig)
      }

      // 执行实例请求成功拦截器
      if (this.instanceInterceptors?.requestSuccessFn) {
        processedConfig = this.instanceInterceptors.requestSuccessFn(processedConfig)
      }

      // 执行单次请求成功拦截器
      if (config.interceptors?.requestSuccessFn) {
        processedConfig = config.interceptors.requestSuccessFn(processedConfig)
      }

      return processedConfig
    } catch (error) {
      // 执行请求失败拦截器
      for (const interceptor of this.globalInterceptors.request.failure) {
        error = interceptor(error)
      }

      if (this.instanceInterceptors?.requestFailureFn) {
        error = this.instanceInterceptors.requestFailureFn(error)
      }

      if (config.interceptors?.requestFailureFn) {
        error = config.interceptors.requestFailureFn(error)
      }

      throw error
    }
  }

  // 执行响应拦截器
  private executeResponseInterceptors(res: any, config: TaroRequestConfig, isSuccess: boolean = true): any {
    let processedRes = res

    try {
      if (isSuccess) {
        // 执行全局响应成功拦截器
        for (const interceptor of this.globalInterceptors.response.success) {
          processedRes = interceptor(processedRes)
        }

        // 执行实例响应成功拦截器
        if (this.instanceInterceptors?.responseSuccessFn) {
          processedRes = this.instanceInterceptors.responseSuccessFn(processedRes)
        }

        // 执行单次响应成功拦截器
        if (config.interceptors?.responseSuccessFn) {
          processedRes = config.interceptors.responseSuccessFn(processedRes)
        }
      }

      return processedRes
    } catch (error) {
      // 执行响应失败拦截器
      for (const interceptor of this.globalInterceptors.response.failure) {
        error = interceptor(error)
      }

      if (this.instanceInterceptors?.responseFailureFn) {
        error = this.instanceInterceptors.responseFailureFn(error)
      }

      if (config.interceptors?.responseFailureFn) {
        error = config.interceptors.responseFailureFn(error)
      }

      throw error
    }
  }

  // 主要的请求方法 - 支持success/fail回调
  request<T = any>(config: TaroRequestConfig): Taro.RequestTask<T> {
    // 合并基础配置
    const mergedConfig: TaroRequestConfig = {
      ...this.baseConfig,
      ...config,
      header: {
        ...this.baseConfig.header,
        ...config.header
      }
    }

    // 如果有baseURL，处理URL拼接
    if (this.baseConfig.url && !config.url?.startsWith('http')) {
      mergedConfig.url = this.baseConfig.url + (config.url || '')
    }

    // 保存原始的success和fail回调
    const originalSuccess = mergedConfig.success
    const originalFail = mergedConfig.fail

    try {
      // 执行请求拦截器
      const processedConfig = this.executeRequestInterceptors(mergedConfig)

      // 重写success回调
      processedConfig.success = res => {
        try {
          // 将原始配置附加到响应对象上
          ;(res as any).config = mergedConfig
          // 执行响应拦截器
          const processedRes = this.executeResponseInterceptors(res, mergedConfig, true)
          // 调用原始success回调
          if (originalSuccess) {
            originalSuccess(processedRes)
          }
        } catch (error) {
          // 如果响应拦截器抛出错误，调用fail回调
          this.executeResponseInterceptors(error, mergedConfig, false)
          if (originalFail) {
            originalFail(error)
          }
        }
      }

      // 重写fail回调
      processedConfig.fail = err => {
        try {
          // 执行响应失败拦截器
          this.executeResponseInterceptors(err, mergedConfig, false)
        } catch (error) {
          // 拦截器处理错误
        }
        // 调用原始fail回调
        if (originalFail) {
          originalFail(err)
        }
      }

      // 发起请求
      return Taro.request(processedConfig as Taro.request.Option<T>)
    } catch (error) {
      // 请求拦截器错误处理
      for (const interceptor of this.globalInterceptors.request.failure) {
        error = interceptor(error)
      }

      if (this.instanceInterceptors?.requestFailureFn) {
        error = this.instanceInterceptors.requestFailureFn(error)
      }

      if (config.interceptors?.requestFailureFn) {
        error = config.interceptors.requestFailureFn(error)
      }

      // 如果有fail回调，调用它
      if (originalFail) {
        originalFail(error)
      }

      // 返回一个模拟的RequestTask
      return {
        abort: () => {},
        onHeadersReceived: () => {},
        offHeadersReceived: () => {},
        onChunkReceived: () => {},
        offChunkReceived: () => {},
        then: () => Promise.resolve(),
        catch: () => Promise.resolve()
      } as unknown as Taro.RequestTask<T>
    }
  }

  // 便捷方法 - 保持success/fail风格
  get<T = any>(config: Omit<TaroRequestConfig, 'method'>): Taro.RequestTask<T> {
    return this.request({ ...config, method: 'GET' })
  }

  post<T = any>(config: Omit<TaroRequestConfig, 'method'>): Taro.RequestTask<T> {
    return this.request({ ...config, method: 'POST' })
  }

  put<T = any>(config: Omit<TaroRequestConfig, 'method'>): Taro.RequestTask<T> {
    return this.request({ ...config, method: 'PUT' })
  }

  delete<T = any>(config: Omit<TaroRequestConfig, 'method'>): Taro.RequestTask<T> {
    return this.request({ ...config, method: 'DELETE' })
  }

  patch<T = any>(config: Omit<TaroRequestConfig, 'method'>): Taro.RequestTask<T> {
    return this.request({ ...config, method: 'PATCH' })
  }

  // Promise风格的方法
  // async requestAsync<T = any>(config: TaroRequestConfig): Promise<T> {
  //   const mergedConfig: TaroRequestConfig = {
  //     ...this.baseConfig,
  //     ...config,
  //     header: {
  //       ...this.baseConfig.header,
  //       ...config.header
  //     }
  //   }

  //   if (this.baseConfig.url && !config.url?.startsWith('http')) {
  //     mergedConfig.url = this.baseConfig.url + (config.url || '')
  //   }

  //   try {
  //     const processedConfig = this.executeRequestInterceptors(mergedConfig)

  //     const res = await new Promise<T>((resolve, reject) => {
  //       Taro.request({
  //         ...processedConfig,
  //         success: (res) => {
  //           resolve(res as T)
  //         },
  //         fail: (err) => {
  //           reject(err)
  //         }
  //       })
  //     })

  //     const processedRes = this.executeResponseInterceptors(res, mergedConfig, true)
  //     return processedRes

  //   } catch (error) {
  //     this.executeResponseInterceptors(error, mergedConfig, false)
  //     throw error
  //   }
  // }

  // getAsync<T = any>(config: Omit<TaroRequestConfig, 'method'>): Promise<T> {
  //   return this.requestAsync({ ...config, method: 'GET' })
  // }

  // postAsync<T = any>(config: Omit<TaroRequestConfig, 'method'>): Promise<T> {
  //   return this.requestAsync({ ...config, method: 'POST' })
  // }
}

export default TaroRequest
