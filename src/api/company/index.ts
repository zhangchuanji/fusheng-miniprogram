import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { getCompanyInfoURL, searchCompaniesURL, getProductSellingPointsURL, generateReportURL, enterpriseDetailURL } from '@/service/config'
import type { IResponse } from '../types'

// 获取产品卖点
export const getProductSellingPointsAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: getProductSellingPointsURL,
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

// 获取企业信息
export const companyInfoAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: getCompanyInfoURL,
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

// 搜索企业
export const searchCompaniesAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: searchCompaniesURL + '?name=' + data.name,
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

// 生成报告
export const generateReportAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: generateReportURL,
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

// 企业详情
export const enterpriseDetailAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: enterpriseDetailURL,
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
