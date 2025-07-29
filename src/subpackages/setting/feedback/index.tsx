import React, { useState } from 'react'
import { Image, View } from '@tarojs/components'
import './index.scss'
import { TextArea, Input } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const [phone, setPhone] = useState('')
  const [image, setImage] = useState<string[]>([])
  const [textarea, setTextarea] = useState('')

  const getImage = () => {
    Taro.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log('选择图片成功:', res)
        // 处理选中的图片
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          setImage([...image, ...res.tempFilePaths]) // 设置第一张图片
        }
      },
      fail: err => {
        // 用户取消选择图片是正常行为，不需要当作错误处理
        if (err.errMsg && err.errMsg.includes('cancel')) {
          console.log('用户取消选择图片')
          return
        }
        // 其他错误才需要处理
        console.log('选择图片失败:', err)
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      },
    })
  }

  const handleClose = (index: number) => {
    setImage(image.filter((_: any, i: number) => i !== index))
    Taro.showToast({
      title: '删除成功',
      icon: 'none'
    })
  }

  return (
    <View className="detailPage">
      <View className="feedback_textarea">
        <TextArea autoSize maxLength={500} placeholder="遇到好用或者不爽，请你聊聊吧..." value={textarea} onChange={(e: any) => setTextarea(e)} />
        {image.length > 0 && (
          <View className="feedback_image_box">
            {image.map((item: any, index: number) => (
              <View className="feedback_image_box_item">
                <Image src="http://36.141.100.123:10013/glks/assets/setting/feedback_close.png" className="feedback_image_box_item_close" onClick={() => handleClose(index)} />
                <Image src={item} className="feedback_image" />
              </View>
            ))}
          </View>
        )}
        <View className="feedback_image_box_add">
          <Image onClick={() => getImage()} src="http://36.141.100.123:10013/glks/assets/setting/feedback_icon.png" className="feedback_icon" />
          <View className="feedback_image_box_add_text">0/500</View>
        </View>
      </View>
      <View className="feedback_input">
        <View>手机号</View>
        <View className="feedback_input_right">
          <Input placeholder="请输入手机号" value={phone} onChange={(e: any) => setPhone(e)} />
        </View>
      </View>
      <View className="feedback_tips">本次反馈会把发生问题的当前设备基础信息（如手机型号、系统版本、APP版本、客户端日志等）一起提交，帮助定位问题。</View>
      <View className="feedback_btn">提交</View>
      <View className="feedback_lishi">
        意见反馈记录
        <ArrowRight color="#2156FE" size="28rpx" />
      </View>
    </View>
  )
}

export default Index
