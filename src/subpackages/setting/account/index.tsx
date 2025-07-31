import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { loginInfoUpdateAPI } from '@/api/setting'
import { useAppSelector } from '@/hooks/useAppStore'
import { sendSmsCodeAPI } from '@/api/login'
import './index.scss'

function Index() {
  // 控制显示注销说明还是安全校验
  const [showVerify, setShowVerify] = useState(false)
  const userInfo = useAppSelector(state => state.login.userInfo)
  // 验证码相关状态
  const [codeValues, setCodeValues] = useState(['', '', '', '', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<any[]>([])
  const focusTimeoutRef = useRef<any>(null)
  const countdownRef = useRef<any>(null)
  // 手机号脱敏函数
  const maskPhone = (phone: string | undefined) => {
    if (!phone) return ''
    // 保留前3位和后4位，中间用****替换
    if (phone.length === 11) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
    // 如果不是11位，简单处理
    if (phone.length > 6) {
      return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
    }
    return phone
  }
  // 清理定时器
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [countdown])

  // 重新获取验证码
  const handleResendCode = () => {
    if (countdown > 0) return
    // 这里可以调用发送验证码的API
    Taro.showToast({ title: '验证码已发送', icon: 'none' })
    setCountdown(60)
  }

  // 处理输入变化
  const handleInputChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    const newCodeValues = [...codeValues]
    if (numericValue === '' && codeValues[index] !== '') {
      newCodeValues[index] = ''
      setCodeValues(newCodeValues)
      if (index > 0) {
        setCurrentIndex(index - 1)
        focusTimeoutRef.current = setTimeout(() => {
          if (inputRefs.current[index - 1]) inputRefs.current[index - 1].focus()
        }, 100)
      }
      return
    }
    if (numericValue.length > 1) {
      newCodeValues[index] = numericValue.charAt(0)
    } else {
      newCodeValues[index] = numericValue
    }
    setCodeValues(newCodeValues)
    if (numericValue && index < 5) {
      setCurrentIndex(index + 1)
      focusTimeoutRef.current = setTimeout(() => {
        if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus()
      }, 100)
    }
  }

  const handleInputClick = (index: number) => {
    setCurrentIndex(index)
    focusTimeoutRef.current = setTimeout(() => {
      if (inputRefs.current[index]) inputRefs.current[index].focus()
    }, 100)
  }

  const isCodeComplete = codeValues.every(value => value !== '')

  // 验证码输入完成回调
  useEffect(() => {
    if (isCodeComplete && showVerify) {
      const code = codeValues.join('')
      // 这里可以调用注销API
      Taro.showToast({ title: '注销成功', icon: 'success' })
      // 这里可以跳转或做其他处理
    }
  }, [codeValues, isCodeComplete, showVerify])

  // 切换到安全校验界面
  const handleConfirm = () => {
    sendSmsCodeAPI(
      {
        mobile: userInfo?.mobile,
        scene: 1
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: '短信验证码发送成功',
            icon: 'success',
            duration: 2000
          })
        }
      }
    )
    setShowVerify(true)
  }

  // 返回按钮（可选）
  const handleCancel = () => {
    if (showVerify) {
      setShowVerify(false)
      setCodeValues(['', '', '', '', '', ''])
      setCurrentIndex(0)
    } else {
      // 这里可以返回上一页
      Taro.navigateBack()
    }
  }

  if (showVerify) {
    return (
      <View className="detailPage" style={{ background: '#fff' }}>
        <View style={{ height: '80rpx' }}></View>
        <View style={{ textAlign: 'center', fontSize: '40rpx', fontWeight: 500, marginBottom: '94rpx', marginTop: '162rpx' }}>安全校验</View>
        {/* 验证码提示区域调整 */}
        <View style={{ margin: '0 32rpx 0 32rpx' }}>
          <Text style={{ color: '#333', fontSize: '28rpx', display: 'block', marginBottom: '8rpx' }}>验证码已发送至</Text>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#333', fontSize: '32rpx', fontWeight: 600 }}>{maskPhone(userInfo?.mobile)}</Text>
            <Text style={{ color: '#2156FE', fontSize: '28rpx' }} onClick={handleResendCode}>
              {countdown > 0 ? `${countdown}s后重新获取` : '发送验证码'}
            </Text>
          </View>
        </View>
        <View style={{ height: '40rpx' }}></View>
        <View style={{ margin: '0 32rpx' }}>
          <Input
            className="code_input"
            style={{ width: '100%', height: '96rpx', background: '#f8f8f8', borderRadius: '48rpx', paddingLeft: '32rpx', fontSize: '32rpx', marginBottom: '40rpx' }}
            placeholder="请输入验证码"
            maxlength={6}
            value={codeValues.join('')}
            onInput={e => {
              const val = e.detail.value.slice(0, 6)
              setCodeValues(val.split('').concat(Array(6 - val.length).fill('')))
              setCurrentIndex(val.length)
            }}
            focus={true}
            type="number"
          />
        </View>
        <View style={{ height: '40rpx' }}></View>
        <View style={{ width: '90%', margin: '0 auto', border: '2rpx solid #FF1818', borderRadius: '48rpx', height: '96rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF1818', fontSize: '32rpx', marginBottom: '40rpx' }} onClick={isCodeComplete ? () => Taro.showToast({ title: '注销成功', icon: 'success' }) : undefined}>
          确定注销
        </View>
      </View>
    )
  }

  return (
    <View className="detailPage">
      <View className="account_title">为保证你的账号安全，请你仔细阅读以下内容后再进行操作注销账号</View>
      <View className="title">重要提示:</View>
      <View className="account_content">为防止误操作，请再次确认是否注销帐号并确认注销后的影响。在此善意提醒，注销帐号为不可恢复的操作，建议在最终确定注销前自行备份本帐号相关的所有信息，并请再次确认与帐号相关的所有服务均已进行妥善处理。注销帐号后将无法再使用本帐号或找回本帐号商品购买信息，金币资产等任何内容或信息。(即使你使用相同的手机号码再次注册并使用平台) 注销成功后，您将放弃以下资产或权益，且无法恢复: A、个人身份信息、账户信息、会员权益、认证信息、团队数量将被清空。 B、购买的商品、夺宝等数据内容记录将被删除。 C、账户内虚拟货币、交易信息将作废及删除，请确认帐号内无任何资产和虚拟权益。</View>
      <View className="account_btn_left" onClick={handleCancel}>
        取消
      </View>
      <View className="account_btn_right" onClick={handleConfirm}>
        确认注销
      </View>
    </View>
  )
}

export default Index
