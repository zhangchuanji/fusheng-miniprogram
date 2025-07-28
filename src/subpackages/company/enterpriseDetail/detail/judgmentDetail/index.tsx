import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const [stepsList, setStepsList] = useState([1, 2, 3])
  return (
    <View className="detailPage">
      <View className="enterprise-card">
        <View className="enterprise-title">中山大某电机股份有限公司、东莞中汽宏某汽车有限公司买卖合同纠纷民事一审民事判决书</View>
        <View className="enterprise-date">
          <View className="enterprise-date-text">裁判日期：<Text style={{ color: '#333333' }}>2024-09-09</Text></View>
          <View className="enterprise-date-text">发布日期：<Text style={{ color: '#333333' }}>2024-09-09</Text></View>
        </View>
        <View className="enterprise-content">
          <View className="enterprise-content-title">案号：<Text style={{ color: '#333333' }}>12312414</Text></View>
          <View className="enterprise-content-title">案由：<Text style={{ color: '#333333' }}>--</Text></View>
          <View className="enterprise-content-title">法院：<Text style={{ color: '#333333' }}>中山市第一人民法院</Text></View>
        </View>
      </View>
      <View className="card">
        <View className="card-title">文书正文</View>
        <View className="card-content"></View>
      </View>
    </View>
  )
}

export default Index
