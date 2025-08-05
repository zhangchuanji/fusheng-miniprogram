import React, { useEffect, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { Button as NutButton } from '@nutui/nutui-react-taro'
import { Checkbox } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { useExampleActions } from '@/hooks/useExampleActions'
import BackArrow from '@/pages/components/BackArrow'
import { loginByCodeAPI, sendSmsCodeAPI } from '@/api/login'

function Index() {
  const { getExampleData, exampleData } = useExampleActions()
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [agreed, setAgreed] = useState(false)

  // 手机号正则验证
  const phoneRegex = /^1[3-9]\d{9}$/

  // 验证手机号格式
  const validatePhone = (phoneNumber: string) => {
    if (!phoneNumber) {
      return '请输入手机号'
    }
    if (!phoneRegex.test(phoneNumber)) {
      return '请输入正确的手机号格式'
    }
    return ''
  }

  // 处理手机号输入
  const handlePhoneInput = (e: any) => {
    const value = e.detail.value
    // 只保留数字字符
    const numericValue = value.replace(/[^0-9]/g, '')
    // 限制最大长度为11位
    const limitedValue = numericValue.slice(0, 11)
    setPhone(limitedValue)

    // 实时验证
    if (limitedValue.length > 0) {
      const error = validatePhone(limitedValue)
      setPhoneError(error)
    } else {
      setPhoneError('')
    }
  }

  useEffect(() => {
    getExampleData({
      pageNo: 1,
      pageSize: 10
    })
  }, [])

  const handleAgreementClick = (type: 'user' | 'privacy') => {
    // 处理协议点击事件
  }

  const sendSmsCode = async () => {
    // 验证手机号
    const error = validatePhone(phone)
    if (error) {
      setPhoneError(error)
      Taro.showToast({
        title: error,
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 检查是否同意协议
    if (!agreed) {
      Taro.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // MEMBER_LOGIN(1, "user-sms-login", "会员用户 - 手机号登陆"),
    // MEMBER_UPDATE_MOBILE(2, "user-update-mobile", "会员用户 - 修改手机"),
    // MEMBER_UPDATE_PASSWORD(3, "user-update-password", "会员用户 - 修改密码"),
    // MEMBER_RESET_PASSWORD(4, "user-reset-password", "会员用户 - 忘记密码"),

    // ADMIN_MEMBER_LOGIN(21, "admin-sms-login", "后台用户 - 手机号登录"),
    // ADMIN_MEMBER_REGISTER(22, "admin-sms-register", "后台用户 - 手机号注册"),
    // ADMIN_MEMBER_RESET_PASSWORD(23, "admin-reset-password", "后台用户 - 忘记密码");

    sendSmsCodeAPI({
      mobile: phone,
      scene: 1
    }, res => {
      if (res.success) {
        Taro.showToast({
          title: '短信验证码发送成功',
          icon: 'success',
          duration: 2000
        })
        Taro.navigateTo({
          url: '/subpackages/login/loginCode/index?phone=' + phone
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  }

  return (
    <View className="login_page">
      <View className="login_back"></View>
      <BackArrow />
      <View className="login_title_container">
        <Text className="login_title">您好</Text>
        <Text className="login_title">欢迎来到New Galaxy AI</Text>
      </View>
      <Text className="login_text">登录</Text>
      <View className="input_container">
        <Input className={`login_input ${phoneError ? 'error' : ''}`} type="number" placeholder="请输入手机号" value={phone} onInput={handlePhoneInput} maxlength={11} />
        {phoneError && <Text className="error_text">{phoneError}</Text>}
      </View>
      <NutButton className="login_btn" onClick={() => sendSmsCode()}>
        获取短信验证码
      </NutButton>
      <Text className="login_btn_phone" onClick={() => Taro.navigateBack()}>
        返回一键登录
      </Text>
      <View className="login_bottom">
        <View className="agreement_container">
          <Checkbox checked={agreed} onChange={setAgreed} color="#2156FE" className="agreement_checkbox" />
          <View className="agreement_text">
            <Text className="agreement_desc">未注册手机号验证通过后将自动注册，已详读并同意</Text>
            <Text className="agreement_link" onClick={() => handleAgreementClick('user')}>
              《用户协议》
            </Text>
            <Text className="agreement_and">和</Text>
            <Text className="agreement_link" onClick={() => handleAgreementClick('privacy')}>
              《隐私政策》
            </Text>
          </View>
        </View>
      </View>
      <View className="login_bottom_text">若您没有问答账户，登录后会自动创建注册</View>
    </View>
  )
}

export default Index
