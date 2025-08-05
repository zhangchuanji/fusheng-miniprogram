import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import { useExampleActions } from '@/hooks/useExampleActions'
import { validateSmsCodeAPI, loginByCodeAPI, loginByInfoAPI } from '@/api/login'
import BackArrow from '../../components/BackArrow'
import { IResponse } from '@/api/types'
import { useAppDispatch } from '@/hooks/useAppStore'
import { setLoginStatus, userInfoAction } from '@/redux/modules/login'
import { IUserInfo } from '@/redux/types/login'

function Index() {
  const dispatch = useAppDispatch()

  const { getExampleData, exampleData } = useExampleActions()
  const [codeValues, setCodeValues] = useState(['', '', '', '', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [phone, setPhone] = useState('') // 将phone改为state
  const inputRefs = useRef<any[]>([])
  const focusTimeoutRef = useRef<any>(null)
  const countdownRef = useRef<any>(null)

  // 获取页面参数
  useLoad(options => {
    if (options.phone) {
      setPhone(options.phone)
    }
  })

  useEffect(() => {
    getExampleData({
      pageNo: 1,
      pageSize: 10
    })
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
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
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [countdown])

  // 重新获取验证码
  const handleResendCode = () => {
    if (countdown > 0) return

    // 这里可以调用发送验证码的API
    setCountdown(60) // 60秒倒计时
  }

  // 处理输入变化
  const handleInputChange = (index: number, value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/[^0-9]/g, '')
    const newCodeValues = [...codeValues]

    // 检查是否为删除操作
    if (numericValue === '' && codeValues[index] !== '') {
      newCodeValues[index] = ''
      setCodeValues(newCodeValues)
      if (index > 0) {
        setCurrentIndex(index - 1)
        focusTimeoutRef.current = setTimeout(() => {
          if (inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus()
          }
        }, 100)
      }
      return
    }

    // 正常输入
    if (numericValue.length > 1) {
      newCodeValues[index] = numericValue.charAt(0)
    } else {
      newCodeValues[index] = numericValue
    }
    setCodeValues(newCodeValues)

    // 自动跳转到下一个输入框
    if (numericValue && index < 5) {
      setCurrentIndex(index + 1)
      focusTimeoutRef.current = setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus()
        }
      }, 100)
    }
  }

  // 处理输入框点击
  const handleInputClick = (index: number) => {
    setCurrentIndex(index)
    focusTimeoutRef.current = setTimeout(() => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].focus()
      }
    }, 100)
  }

  // 检查验证码是否完整
  const isCodeComplete = codeValues.every(value => value !== '')

  const setInfo = (apiResponse: IResponse<IUserInfo>) => {
    if (apiResponse.success) {
      dispatch(userInfoAction({ type: 'set', data: apiResponse.data }))
      if (apiResponse.data?.companyName && apiResponse.data?.targetCompanyServe) {
        let targetCompanyServe = JSON.parse(apiResponse?.data?.targetCompanyServe || '{}')
        Taro.setStorageSync('companyInfo', {
          companyName: apiResponse?.data?.companyName || '',
          userName: apiResponse?.data?.name || '',
          coreSellingPoints: targetCompanyServe.coreSellingPoints,
          expansionDomainKeywords: targetCompanyServe.expansionDomainKeywords,
          expansionDomainKeywordsSelected: targetCompanyServe.expansionDomainKeywordsSelected,
          customInput: targetCompanyServe.customInput
        })
        Taro.reLaunch({ url: '/pages/index/index' })
      } else {
        Taro.reLaunch({ url: '/subpackages/login/companyProfile/index' })
      }
      Taro.hideLoading()
    } else {
      Taro.hideLoading()
      Taro.showToast({
        title: '获取信息失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  // 验证码输入完成回调
  useEffect(() => {
    if (isCodeComplete && phone) {
      // 确保phone有值
      const code = codeValues.join('')
      validateSmsCodeAPI({ mobile: phone, code, scene: 1 }, async res => {
        if (res.success) {
          loginByCodeAPI({ mobile: phone, code: code, state: 'STATE' }, res => {
            if (res.success) {
              Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
              })
              Taro.setStorageSync('token', res.data)
              dispatch(userInfoAction({ type: 'set', data: res.data }))
              dispatch(setLoginStatus(1))
              loginByInfoAPI(setInfo)
              Taro.navigateTo({ url: '/subpackages/login/companyProfile/index' })
            } else {
              Taro.showToast({
                title: '登录失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          Taro.showToast({
            title: '验证码错误',
            icon: 'none',
            duration: 2000
          })
          // 清空验证码，让用户重新输入
          setCodeValues(['', '', '', '', '', ''])
          setCurrentIndex(0)
        }
      })
    }
  }, [codeValues, isCodeComplete, phone]) // 添加phone到依赖数组

  return (
    <View className="login_page">
      <View className="login_back"></View>
      <BackArrow />
      <View className="login_title_container">
        <Text className="login_title">请输入验证码</Text>
        <Text className="login_text">验证码已发送至 +86 {phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '***'}</Text>
      </View>

      {/* 验证码输入框容器 */}
      <View className="code_input_container">
        {codeValues.map((value, index) => (
          <Input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            className="code_input"
            value={value}
            maxlength={1}
            type="number"
            onInput={e => handleInputChange(index, e.detail.value)}
            onClick={() => handleInputClick(index)}
            focus={currentIndex === index}
            style={{
              width: '100rpx',
              height: '100rpx'
            }}
          />
        ))}
      </View>

      <Text className={`login_btn_phone ${countdown > 0 ? 'disabled' : ''}`} onClick={handleResendCode}>
        {countdown > 0 ? `${countdown}s后重新获取` : '重新获取验证码'}
      </Text>
    </View>
  )
}

export default Index
