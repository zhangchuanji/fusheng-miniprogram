import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppSelector } from '@/hooks/useAppStore'
import { sendSmsCodeAPI, validateSmsCodeAPI } from '@/api/login'

import './index.scss'
import { updateMobileAPI } from '@/api/setting'

function Index() {
  const userInfo = useAppSelector(state => state.login.userInfo)

  // 0: 输入原手机号  1: 已绑定手机号  2: 安全校验
  const [step, setStep] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [phone, setPhone] = useState(userInfo?.mobile)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [newCountdown, setNewCountdown] = useState(0)
  const [newPhone, setNewPhone] = useState('')
  const [newCode, setNewCode] = useState('')

  // 发送验证码
  const handleSendCode = () => {
    if (countdown > 0) return
    sendSmsCodeAPI({ mobile: phone, scene: 2 }, res => {
      if (res.success) {
        Taro.showToast({ title: '验证码已发送', icon: 'none' })
      }
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })
  }

  // 发送验证码
  const handleNewSendCode = () => {
    if (newCountdown > 0) return
    sendSmsCodeAPI({ mobile: phone, scene: 2 }, res => {
      if (res.success) {
        Taro.showToast({ title: '验证码已发送', icon: 'none' })
      }
      setNewCountdown(60)
      const timer = setInterval(() => {
        setNewCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })
  }

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

  // 下一步（原手机号校验）
  const handleNext = () => {
    if (!phone || !code) {
      Taro.showToast({ title: '请输入手机号和验证码', icon: 'none' })
      return
    }
    validateSmsCodeAPI({ mobile: phone, code, scene: 2 }, res => {
      if (res.success && res.data) {
        setStep(1)
      }
    })
  }

  // 更换手机号
  const handleChangePhone = () => {
    setStep(2)
  }

  // 完成（新手机号校验）
  const handleFinish = () => {
    if (!newPhone || !newCode) {
      Taro.showToast({ title: '请输入新手机号和验证码', icon: 'none' })
      return
    }
    validateSmsCodeAPI({ mobile: newPhone, code: newCode, scene: 2 }, res => {
      if (res.success && res.data) {
        updateMobileAPI({ mobile: newPhone, code: newCode, oldCode: code }, res => {
          if (res.success) {
            Taro.showToast({ title: '更换成功', icon: 'success' })
          } else {
            Taro.showToast({ title: res.data.msg || '更换失败', icon: 'success' })
          }
        })
      }
    })
  }

  // 弹窗关闭
  const handleModalClose = () => {
    setShowModal(false)
  }

  return (
    <View className="changePhone-page">
      {/* 步骤0：输入原手机号 */}
      {step === 0 && (
        <>
          <View className="changePhone-title">请输入原手机号</View>
          <View className="changePhone-input-group">
            <View className="changePhone-input-row">
              <Input className="changePhone-input" placeholder="请输入原手机号" value={phone} onInput={e => setPhone(e.detail.value)} type="number" />
              <Text className="changePhone-send-code" onClick={handleSendCode}>
                {countdown > 0 ? `${countdown}s后重新获取` : '发送验证码'}
              </Text>
            </View>
            <View className="changePhone-input-row" style={{ marginBottom: '64rpx' }}>
              <Input className="changePhone-input" placeholder="请输入验证码" value={code} onInput={e => setCode(e.detail.value)} type="number" />
            </View>
          </View>
          <View className="changePhone-btn" onClick={handleNext}>
            下一步
          </View>
          <View className="changePhone-tip">手机号停用或无法接收验证码?</View>
        </>
      )}

      {/* 步骤1：已绑定手机号 */}
      {step === 1 && (
        <>
          <View className="changePhone-bind-title">已绑定手机号</View>
          <View className="changePhone-bind-phone">{maskPhone(userInfo?.mobile)}</View>
          <View className="changePhone-bind-desc">账号已与手机号绑定，需通过手机号登录</View>
          <View className="changePhone-btn" onClick={handleChangePhone}>
            更换手机号
          </View>
        </>
      )}

      {/* 步骤2：安全校验（新手机号） */}
      {step === 2 && (
        <>
          <View className="changePhone-title">安全校验</View>
          <View className="changePhone-input-group">
            <View className="changePhone-input-row">
              <Input className="changePhone-input" placeholder="请输入新手机号" value={newPhone} onInput={e => setNewPhone(e.detail.value)} type="number" />
              <Text className="changePhone-send-code" onClick={handleNewSendCode}>
                {newCountdown > 0 ? `${newCountdown}s后重新获取` : '发送验证码'}
              </Text>
            </View>
            <View className="changePhone-input-row" style={{ marginBottom: '64rpx' }}>
              <Input className="changePhone-input" placeholder="请输入验证码" value={newCode} onInput={e => setNewCode(e.detail.value)} type="number" />
            </View>
          </View>
          <View className="changePhone-btn" onClick={handleFinish}>
            完成
          </View>
        </>
      )}

      {/* 步骤0弹窗：手机号无法验证时的提示 */}
      {showModal && (
        <View className="changePhone-modal-mask">
          <View className="changePhone-modal">
            <View className="changePhone-modal-header">
              <Text className="changePhone-modal-title">如果您的手机号无法接收验证码</Text>
              <Text className="changePhone-modal-close" onClick={handleModalClose}>
                ×
              </Text>
            </View>
            <View className="changePhone-modal-content">
              请联系客服协助验证
              <br />
              400-400-400
            </View>
            <View className="changePhone-modal-btn" onClick={handleModalClose}>
              我知道了
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default Index
