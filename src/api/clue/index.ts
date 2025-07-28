import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { clueListURL, clueCreateURL, clueDeleteURL, clueFollowUpCreateURL, clueFollowUpPageURL, clueFollowUpUpdateURL } from '@/service/config'
import type { IResponse } from '../types'

// 获得线索列表
export const clueListAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueListURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}

// 创建线索
export const clueCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: clueCreateURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}

// 删除线索
export const clueDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: clueDeleteURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}

// 创建线索跟进
export const clueFollowUpCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: clueFollowUpCreateURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}

// 获得线索跟进分页
export const clueFollowUpPageAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpPageURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}

// 更新线索跟进
export const clueFollowUpUpdateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: clueFollowUpUpdateURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => {})
}
