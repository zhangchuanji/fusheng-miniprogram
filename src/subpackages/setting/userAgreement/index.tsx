import React, { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { userAgreementAPI } from '@/api/setting'
import './index.scss'

function Index() {
  const [content, setContent] = useState('')

  useEffect(() => {
    userAgreementAPI({ type: 'USER_AGREEMENT' }, res => {
      if (res.success) {
        setContent(res.data)
      }
    })
  }, [])

  return (
    <View className="detailPage">
      <View className="detailPage_title">用户协议</View>
      <View className="detailPage_content" dangerouslySetInnerHTML={{ __html: content }} />
    </View>
  )
}

export default Index
