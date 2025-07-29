import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { ArrowRightSmall } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>2</Text>条工商股东信息
        </Text>
        <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View>
      </View>

      <View className="shareholder-list">
        {[1, 2].map((item, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              <View className="avatar">刘</View>
              <View className="info">
                <View className="name-row">
                  <Text className="name">刘录刚</Text>
                  <View className="relation" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/enterpriseManagement/index' })}>
                    <Text>关联6家企业</Text>
                    <ArrowRightSmall color="#1F55FF" size={'30rpx'} />
                  </View>
                </View>
                <Text className="tag">实际控制人</Text>
                <Text className="tag">受益所有人</Text>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">股东类型</Text>
                  <Text className="value">自然股东人</Text>
                </View>
                <View className="item">
                  <Text className="label">持股比例</Text>
                  <Text className="value">90%</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">认缴出资额</Text>
                  <Text className="value">900万</Text>
                </View>
                <View className="item">
                  <Text className="label">认缴出资日期</Text>
                  <Text className="value">2029-09-09</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">实缴出资额</Text>
                  <Text className="value">--</Text>
                </View>
                <View className="item">
                  <Text className="label">实缴出资日期</Text>
                  <Text className="value">--</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">任职职务</Text>
                  <Text className="value">执行公司事务的董事；经理；财务负责人</Text>
                </View>
              </View>
            </View>
            <View className="card-footer">{idx + 1}</View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
