import React, { useState } from 'react'
import { Image, View, Text } from '@tarojs/components'
import './index.scss'
import { TextArea, Input } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const feedbackRecords = [
    {
      id: 1,
      title: '功能建议反馈',
      content:
        '希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间模式功能，希望可以增加夜间',
      image: ['home/home1.png', 'home/home2.png', 'home/home3.png', 'home/home4.png', 'home/home5.png', 'home/home6.png', 'home/home7.png', 'home/home8.png', 'home/home9.png'],
      time: '2024-01-15 14:30'
    },
    {
      id: 2,
      title: 'Bug反馈',
      content: '登录页面偶尔出现白屏问题',
      image: ['enterprise/enterprise1.png', 'enterprise/enterprise2.png', 'enterprise/enterprise3.png', 'enterprise/enterprise4.png', 'enterprise/enterprise5.png', 'enterprise/enterprise6.png', 'enterprise/enterprise7.png', 'enterprise/enterprise8.png', 'enterprise/enterprise9.png'],
      time: '2024-01-14 09:15'
    }
  ]

  return (
    <View className="detailPage">
      {feedbackRecords.map(record => (
        <View key={record.id} className="item">
          <View className="item_title">
            <Text className="title_text">{record.title}</Text>
            <Text className="content_text">{record.content}</Text>
          </View>
          <View className="item_img">
            {record.image.map((imgSrc, index) => (
              <Image key={index} src={`http://36.141.100.123:10013/glks/assets/${imgSrc}`} className="item_img_item" mode="aspectFit" />
            ))}
          </View>
          <View onClick={() => Taro.navigateTo({ url: `/pages/setting/feedbackDetail/index?id=${record.id}` })} className="item_time">
            <Text className="time_text">{record.time}</Text>
            <ArrowRight  color="#333333" size="28rpx" />
          </View>
        </View>
      ))}
    </View>
  )
}

export default Index
