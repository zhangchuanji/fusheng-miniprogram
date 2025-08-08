import React, { useState } from 'react'
import { Image, View, Text } from '@tarojs/components'
import './index.scss'
import { TextArea, Input } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import { feedbackDetailAPI } from '@/api/setting'

function Index() {
  const [feedbackRecords, setFeedbackRecords] = useState<any>({})

  useLoad(options => {
    const { id } = options
    getFeedbackDetail(id)
  })

  function getFeedbackDetail(id: any) {
    feedbackDetailAPI({ id }, res => {
      setFeedbackRecords(res.data)
    })
  }

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
      <View className="item">
        <Text className="content_text">{feedbackRecords?.content}</Text>
        <View className="item_img">
          {(feedbackRecords?.images || []).map((imgSrc: string, index: number) => (
            <Image key={index} src={`${imgSrc}`} className="item_img_item" mode="aspectFit" />
          ))}
        </View>
        <View className="item_time">
          <Text className="time_text">{formatTimestamp(feedbackRecords?.createTime || 0)}</Text>
        </View>
      </View>
    </View>
  )
}
export default Index
