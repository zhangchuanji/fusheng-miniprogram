import React, { useEffect, useState } from 'react'
import { Image, View } from '@tarojs/components'
import './index.scss'
import { TextArea, Input } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { feedbackCreateAPI } from '@/api/setting'
import { BASE_URL } from '@/service/config'
import { getDeviceInfo, getFormattedDeviceInfo } from '@/utils/deviceInfo'

function Index() {
  const [phone, setPhone] = useState('')
  const [image, setImage] = useState<string[]>([])
  const [textarea, setTextarea] = useState('')
  const [phoneError, setPhoneError] = useState('') // 新增：手机号错误提示状态

  // 新增：手机号校验函数
  const validatePhone = (phoneNumber: string): boolean => {
    // 中国大陆手机号正则：1开头，第二位为3-9，总共11位数字
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phoneNumber)
  }

  // 新增：处理手机号输入变化
  const handlePhoneChange = (value: string) => {
    setPhone(value)
    // 实时校验
    if (value && !validatePhone(value)) {
      setPhoneError('请输入正确的手机号格式')
    } else {
      setPhoneError('')
    }
  }

  const getImage = () => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          res.tempFilePaths.forEach((item: any) => {
            uploadImage(item)
          })
        }
      },
      fail: err => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return
        }
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  }

  function uploadImage(fileItem: any) {
    const tokenData = Taro.getStorageSync('token')
    const token = tokenData?.accessToken
    Taro.uploadFile({
      url: `${BASE_URL}/app-api/infra/file/upload`,
      filePath: fileItem,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`,
        'tenant-id': '1'
      },
      formData: {
        fileName: 'feedback.png'
      },
      success: res => {
        let responseData: any
        try {
          responseData = JSON.parse(res.data)
        } catch (error) {
          console.error('解析响应数据失败:', error)
          responseData = res.data
        }

        const fileUrl = responseData?.data
        // 使用函数式更新，确保基于最新状态
        setImage(prevImage => [...prevImage, fileUrl])
      },
      fail: error => {
        console.error('上传失败:', error)
      }
    })
  }

  const feedbackCreate = async () => {
    if (!textarea) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    
    // 新增：手机号校验
    if (phone && !validatePhone(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    try {
      // 获取当前设备信息
      const currentDeviceInfo = await getFormattedDeviceInfo()

      feedbackCreateAPI(
        {
          content: textarea,
          images: image,
          phone: phone,
          contactMsg: currentDeviceInfo
        },
        res => {
          if (res.success) {
            Taro.showToast({ title: '反馈提交成功', icon: 'success' })
            // 清空表单
            setTextarea('')
            setImage([])
            setPhone('')
            setPhoneError('') // 清空错误提示
          }
        }
      )
    } catch (error) {
      console.error('提交反馈失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    }
  }

  const feedBacklistClick = () => {
    Taro.navigateTo({
      url: '/subpackages/setting/feedbackRecords/index'
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
          <View className="feedback_image_box_add_text">{textarea.length}/500</View>
        </View>
      </View>
      <View className="feedback_input">
        <View>手机号</View>
        <View className="feedback_input_right">
          <Input 
            placeholder="请输入手机号" 
            value={phone} 
            onChange={(e: any) => handlePhoneChange(e)}
            type="number" // 限制输入类型为数字
            maxLength={11} // 限制最大长度为11位
          />
          {phoneError && (
            <View className="phone_error_tip" style={{ color: '#ff4757', fontSize: '24rpx', marginTop: '8rpx' }}>
              {phoneError}
            </View>
          )}
        </View>
      </View>
      <View className="feedback_tips">本次反馈会把发生问题的当前设备基础信息（如手机型号、系统版本、APP版本、客户端日志等）一起提交，帮助定位问题。</View>
      <View className="feedback_btn" onClick={feedbackCreate}>
        提交
      </View>
      <View className="feedback_lishi" onClick={feedBacklistClick}>
        意见反馈记录
        <ArrowRight color="#2156FE" size="28rpx" />
      </View>
    </View>
  )
}

export default Index
