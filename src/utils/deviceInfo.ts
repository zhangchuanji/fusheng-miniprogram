import Taro from '@tarojs/taro'

// 设备信息接口定义
export interface DeviceInfo {
  // 设备基础信息
  brand: string // 设备品牌
  model: string // 设备型号
  system: string // 操作系统及版本
  platform: string // 客户端平台
  
  // 微信相关信息
  version: string // 微信版本号
  SDKVersion: string // 基础库版本
  
  // 屏幕信息
  screenWidth: number // 屏幕宽度
  screenHeight: number // 屏幕高度
  pixelRatio: number // 设备像素比
  
  // 网络信息
  networkType?: string // 网络类型
  
  // 其他信息
  language: string // 语言
  fontSizeSetting: number // 用户字体大小设置
  statusBarHeight: number // 状态栏高度
  safeArea?: any // 安全区域
  
  // 时间戳
  timestamp: number // 获取信息的时间戳
}

/**
 * 获取设备基础信息
 * @returns Promise<DeviceInfo>
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()
    
    // 获取网络信息
    let networkType = 'unknown'
    try {
      const networkInfo = await Taro.getNetworkType()
      networkType = networkInfo.networkType
    } catch (error) {
      console.warn('获取网络信息失败:', error)
    }
    
    const deviceInfo: DeviceInfo = {
      // 设备基础信息
      brand: systemInfo.brand || 'unknown',
      model: systemInfo.model || 'unknown', 
      system: systemInfo.system || 'unknown',
      platform: systemInfo.platform || 'unknown',
      
      // 微信相关信息
      version: systemInfo.version || 'unknown',
      SDKVersion: systemInfo.SDKVersion || 'unknown',
      
      // 屏幕信息
      screenWidth: systemInfo.screenWidth || 0,
      screenHeight: systemInfo.screenHeight || 0,
      pixelRatio: systemInfo.pixelRatio || 1,
      
      // 网络信息
      networkType,
      
      // 其他信息
      language: systemInfo.language || 'zh_CN',
      fontSizeSetting: systemInfo.fontSizeSetting || 16,
      statusBarHeight: systemInfo.statusBarHeight || 0,
      safeArea: systemInfo.safeArea,
      
      // 时间戳
      timestamp: Date.now()
    }
    
    return deviceInfo
  } catch (error) {
    console.error('获取设备信息失败:', error)
    throw error
  }
}

/**
 * 获取格式化的设备信息字符串
 * @returns Promise<string>
 */
export const getFormattedDeviceInfo = async (): Promise<string> => {
  try {
    const deviceInfo = await getDeviceInfo()
    
    return `设备信息：
手机型号：${deviceInfo.brand} ${deviceInfo.model}
系统版本：${deviceInfo.system}
微信版本：${deviceInfo.version}
基础库版本：${deviceInfo.SDKVersion}
客户端平台：${deviceInfo.platform}
网络类型：${deviceInfo.networkType}
屏幕分辨率：${deviceInfo.screenWidth}x${deviceInfo.screenHeight}
设备像素比：${deviceInfo.pixelRatio}
语言设置：${deviceInfo.language}
字体大小：${deviceInfo.fontSizeSetting}
状态栏高度：${deviceInfo.statusBarHeight}px
获取时间：${new Date(deviceInfo.timestamp).toLocaleString()}`
  } catch (error) {
    return '获取设备信息失败'
  }
}

/**
 * 获取简化的设备信息（用于日志上报）
 * @returns Promise<object>
 */
export const getSimpleDeviceInfo = async () => {
  try {
    const deviceInfo = await getDeviceInfo()
    
    return {
      device: `${deviceInfo.brand} ${deviceInfo.model}`,
      system: deviceInfo.system,
      wechatVersion: deviceInfo.version,
      sdkVersion: deviceInfo.SDKVersion,
      platform: deviceInfo.platform,
      network: deviceInfo.networkType,
      timestamp: deviceInfo.timestamp
    }
  } catch (error) {
    console.error('获取简化设备信息失败:', error)
    return {
      device: 'unknown',
      system: 'unknown', 
      wechatVersion: 'unknown',
      sdkVersion: 'unknown',
      platform: 'unknown',
      network: 'unknown',
      timestamp: Date.now()
    }
  }
}