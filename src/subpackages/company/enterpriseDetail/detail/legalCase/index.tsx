import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'

function Index() {
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>2</Text>条司法案件
        </Text>
      </View>
      <View className="enterprise-card-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, idx) => (
          <View className="enterprise-card" key={idx}>
            <View className="leftArrow">
              <ArrowRightSize6 color="#9C9C9C" size={'28rpx'} />
            </View>
            <View className="enterprise-title">中山大某电机股份有限公司、东莞中汽宏某汽车有限公司买卖合同纠纷民事一审民事判决书</View>
            <View className="enterprise-tag-box">
              <View className="enterprise-tag">民事案件</View>
            </View>
            <View className="enterprise-text">
              原告/上诉人：<Text style={{ color: '#1B5BFF' }}>西安经发城市服务有限公司</Text>
            </View>
            <View className="enterprise-text">
              被告/被上诉人：<Text style={{ color: '#1B5BFF' }}>西安经发城市服务有限公司</Text>
            </View>
            <View className="enterprise-text">
              案由：<Text style={{ color: '#333333' }}>- -</Text>
            </View>
            <View className="enterprise-text">
              案号：<Text style={{ color: '#333333' }}>陕西省</Text>
            </View>
            <View className="enterprise-text">
              审理法院：<Text style={{ color: '#333333' }}>2024-09-09</Text>
            </View>
            <View className="enterprise-text">
              裁判日期：<Text style={{ color: '#333333' }}>2024-09-09</Text>
            </View>
            <View className="enterprise-text">
              最新进程：<Text style={{ color: '#333333' }}>- -</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
