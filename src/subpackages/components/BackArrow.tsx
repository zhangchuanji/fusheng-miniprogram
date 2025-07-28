import React, { useEffect, useState } from 'react'
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

const BackArrow: React.FC = () => {
  const [capsuleInfo, setCapsuleInfo] = useState({ top: 0, height: 32 })

  useEffect(() => {
    const info = Taro.getMenuButtonBoundingClientRect()
    setCapsuleInfo({ top: info.top, height: info.height })
  }, [])

  return (
    <View
      className="back-arrow"
      style={{
        position: 'fixed',
        top: `${capsuleInfo.top + capsuleInfo.height / 2 - 20}px`,
        left: '8px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={() => Taro.navigateBack()}
    >
      <Image src={require('@/assets/login/login3.png')} style={{ width: '44rpx', height: '44rpx', display: 'block' }} mode="aspectFit" />
    </View>
  )
}

export default BackArrow
