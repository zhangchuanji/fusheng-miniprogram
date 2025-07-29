import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { clueListURL, clueCreateURL, clueDeleteURL, clueFollowUpDeleteURL, clueFollowUpCreateURL, clueFollowUpPageURL, clueFollowUpUpdateURL, uploadFileURL, clueFollowUpHistoryURL, clueFollowUpDetailURL } from '@/service/config'
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

// 删除线索跟进
export const clueFollowUpDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: clueFollowUpDeleteURL + '?id=' + data.id,
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

// 获取线索跟进详情
export const clueFollowUpDetailAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpDetailURL,
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

// 获取历史记录
export const clueFollowUpHistoryAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpHistoryURL,
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

// 上传文件
export const uploadFileAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: uploadFileURL,
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
