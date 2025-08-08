import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { feedbackCreateURL, feedbackListURL, feedbackDetailURL, userAgreementURL, getAreaURL, loginInfoURL, loginInfoUpdateURL, updateMobileURL, configCompanyUpdateURL, configCompanyPostURL, configCompanyGetURL, configCompanySectorURL } from '@/service/config'
import type { IResponse } from '../types'

export const userAgreementAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: userAgreementURL,
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

export const getAreaAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: getAreaURL,
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

export const loginInfoAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: loginInfoURL,
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

export const loginInfoUpdateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: loginInfoUpdateURL,
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

export const updateMobileAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: updateMobileURL,
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

export const configCompanyGetAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: configCompanyGetURL,
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

export const configCompanyPostAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: configCompanyPostURL,
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

export const configCompanyUpdateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: configCompanyUpdateURL,
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

export const configCompanySectorAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: configCompanySectorURL,
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

export const feedbackCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: feedbackCreateURL,
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

export const feedbackListAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: feedbackListURL,
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

export const feedbackDetailAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: feedbackDetailURL,
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
