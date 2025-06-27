import Taro  from '@tarojs/taro'

// 定义Taro请求配置接口
export interface TaroRequestConfig extends Taro.request.Option {
  // 拦截器配置
  interceptors?: TaroInterceptors
}

// 定义拦截器接口
export interface TaroInterceptors {
  requestSuccessFn?: (config: Taro.request.Option) => Taro.request.Option
  requestFailureFn?: (err: any) => any
  responseSuccessFn?: (res: any) => any
  responseFailureFn?: (err: any) => any
}

// 定义全局拦截器
export interface GlobalInterceptors {
  request: {
    success: ((config: Taro.request.Option) => Taro.request.Option)[]
    failure: ((err: any) => any)[]
  }
  response: {
    success: ((res: any) => any)[]
    failure: ((err: any) => any)[]
  }
}
