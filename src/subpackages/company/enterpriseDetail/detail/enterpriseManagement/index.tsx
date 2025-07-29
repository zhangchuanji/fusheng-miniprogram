import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

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
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="enterprise-card-left" />
            <View className="enterprise-card-right">
              <View className="right-title">杭州XX科技有限公司</View>
              <View className="right-text">
                直接持股比例：
                <Text style={{ color: '#333333' }}>95%</Text>
              </View>
              <View className="right-text">
                担任职位：
                <Text style={{ color: '#333333' }}>法定代表人、股东、执行董事、经理</Text>
              </View>
              <View className="right-text">
                注册资本：
                <Text style={{ color: '#333333' }}>100万人民币</Text>
              </View>
              <View className="right-text">
                成立日期：
                <Text style={{ color: '#333333' }}> 2012-09-09</Text>
              </View>
              <View className="right-text">
                所在地区：
                <Text style={{ color: '#333333' }}>广东省</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
