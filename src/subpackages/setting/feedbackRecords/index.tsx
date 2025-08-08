import React, { useState, useEffect } from 'react'
import { Image, View, Text } from '@tarojs/components'
import './index.scss'
import { TextArea, Input } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { feedbackListAPI } from '@/api/setting'

function Index() {
  const [feedbackRecords, setFeedbackRecords] = useState<any>([])

  const getFeedbackRecords = async () => {
    try {
      feedbackListAPI({ pageNum: 1, pageSize: 10 }, res => {
        if (res.success) {
          setFeedbackRecords(res.data)
        }
      })
    } catch (error) {
      console.error('获取反馈记录失败:', error)
    }
  }

  useEffect(() => {
    getFeedbackRecords()
  }, [])

  // 转化时间戳
  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  return (
    <View className="detailPage">
      {feedbackRecords?.map((record: any) => (
        <View key={record.id} className="item">
          <View className="item_title">
            <Text className="content_text">{record.content}</Text>
          </View>
          <View className="item_img">
            {record?.images?.map((imgSrc: string, index: number) => (
              <Image key={index} src={`${imgSrc}`} className="item_img_item" mode="aspectFit" />
            ))}
          </View>
          <View onClick={() => Taro.navigateTo({ url: `/subpackages/setting/feedbackDetail/index?id=${record.id}` })} className="item_time">
            <Text className="time_text">{formatTimestamp(record.createTime)}</Text>
            <ArrowRight color="#333333" size="28rpx" />
          </View>
        </View>
      ))}
    </View>
  )
}

export default Index
