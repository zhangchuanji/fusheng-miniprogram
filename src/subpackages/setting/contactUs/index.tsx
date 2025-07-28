import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

function Index() {
  return (
    <View className="detailPage">
      <View className="qrCodeBack">
        <View className="qrCode_box">{/* <Image src={require('@/assets/setting/bor.png')} className="qrCode_box_img" mode="aspectFit" /> */}</View>
      </View>
      <View className="qrCode_box_text">扫码添加客服微信</View>
      <View className="qrCode_box_text_version">客服电话：16678965467</View>
    </View>
  )
}

export default Index
