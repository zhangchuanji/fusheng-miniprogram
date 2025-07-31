import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'

function Index() {
  function goUserAgreement() {
    Taro.navigateTo({
      url: '/subpackages/setting/userAgreement/index'
    })
  }

  function goPrivacyPolicy() {
    Taro.navigateTo({
      url: '/subpackages/setting/privacyPolicy/index'
    })
  }

  return (
    <View className="detailPage">
      <Image src="http://36.141.100.123:10013/glks/assets/setting/aboutLogo.png" className="item_logo" />
      <View className="item" onClick={goUserAgreement}>
        <View className="item_title">用户协议</View>
        <ArrowRight color="#B6B6B6" size={'28rpx'} />
      </View>
      <View className="item" onClick={goPrivacyPolicy}>
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
