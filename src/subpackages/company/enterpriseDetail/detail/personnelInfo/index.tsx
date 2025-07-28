import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'

function Index() {
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>2</Text>条工商股东信息
        </Text>
      </View>

      <View className="enterprise-card-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, idx) => (
          <View className="enterprise-card" key={idx}>
            <View className="enterprise-card-top">
              <Text className="name">张三</Text>
              <View className="info">
                <Text className="relation">直接持股</Text>
                <Text className="relation">直接持股</Text>
                <Text className="relation">直接持股</Text>
                <Text className="relation">直接持股</Text>
              </View>
            </View>
            <View
              className="enterprise-card-bottom"
              onClick={() => {
                Taro.navigateTo({
                  url: '/subpackages/company/enterpriseDetail/detail/enterpriseManagement/index'
                })
              }}
            >
              关联6家企业
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
