import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { ArrowRight } from '@nutui/icons-react-taro'

function Index() {
  return (
    <View className="detailPage">
      <Image src={require('@/assets/setting/aboutLogo.png')} className="item_logo" />
      <View className="item">
        <View className="item_title">用户协议</View>
        <ArrowRight color="#B6B6B6" size={'28rpx'} />
      </View>
      <View className="item">
        <View className="item_title">隐私政策</View>
        <ArrowRight color="#B6B6B6" size={'28rpx'} />
      </View>
      <View className="item">
        <View className="item_title">当前版本</View>
        <View className="item_version">1.1.0</View>
      </View>
      <View className="item_text">某某公司 版权所有</View>
    </View>
  )
}

export default Index
