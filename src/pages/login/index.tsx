import React, { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button as NutButton } from '@nutui/nutui-react-taro'
import { Checkbox } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { useExampleActions } from '@/hooks/useExampleActions'
// 调用后端登录API
import { loginByPhoneAPI, loginByCodeAPI, loginByInfoAPI, loginSocialAPI, refreshTokenAPI } from '@/api/login'
import { IResponse } from '@/api/types'
import { IUserInfo } from '@/redux/types/login'
import { useAppDispatch } from '@/hooks/useAppStore'
import { setLoginStatus, userInfoAction } from '@/redux/modules/login'

function Index() {
  const dispatch = useAppDispatch()
  const { getExampleData, exampleData } = useExampleActions()
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    getExampleData({
      pageNo: 1,
      pageSize: 10
    })

    // 页面加载时从本地存储读取token
    const storedToken = Taro.getStorageSync('token')
    if (storedToken.accessToken) {
      // 检查token是否需要刷新（25天）
      const loginTime = Taro.getStorageSync('loginTime')
      const currentTime = Date.now()
      const TOKEN_REFRESH_INTERVAL = 25 * 24 * 60 * 60 * 1000 // 25天的毫秒数

      if (loginTime && currentTime - loginTime >= TOKEN_REFRESH_INTERVAL) {
        refreshTokenAPI({ refreshToken: storedToken.refreshToken }, response => {
          if (response.success) {
            Taro.setStorageSync('token', response.data)
            Taro.setStorageSync('loginTime', Date.now())
            loginByInfoAPI(setInfoCode)
          } else {
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('loginTime')
            Taro.removeStorageSync('userOpenid')
          }
        })
      } else {
        loginByInfoAPI(setInfoCode)
      }
    }
  }, [])

  const handleAgreementClick = (type: 'user' | 'privacy') => {
    // 处理协议点击事件
    console.log(`点击了${type === 'user' ? '用户协议' : '隐私政策'}`)
  }

  const setLoginInfo = (apiResponse: IResponse<IUserInfo>) => {
    if (apiResponse.success) {
      // 将openid存储到本地存储
      if (apiResponse.data?.openid) {
        Taro.setStorageSync('userOpenid', apiResponse.data.openid)
      }

      // 存储token和登录时间
      Taro.setStorageSync('token', apiResponse.data)
      Taro.setStorageSync('loginTime', Date.now()) // 记录登录时间戳

      dispatch(userInfoAction({ type: 'set', data: apiResponse.data }))
      dispatch(setLoginStatus(1))
      loginByInfoAPI(setInfo)
    } else {
      Taro.hideLoading()
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const setInfo = (apiResponse: IResponse<IUserInfo>) => {
    if (apiResponse.success) {
      dispatch(userInfoAction({ type: 'set', data: apiResponse.data }))
      Taro.navigateTo({ url: '/subpackages/login/companyProfile/index' })
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

  const setInfoCode = (apiResponse: IResponse<IUserInfo>) => {
    if (apiResponse.success) {
      dispatch(userInfoAction({ type: 'set', data: apiResponse.data }))
      let targetCompanyServe = JSON.parse(apiResponse?.data?.targetCompanyServe || '{}')
      Taro.setStorageSync('companyInfo', {
        companyName: apiResponse?.data?.companyName || '',
        userName: apiResponse?.data?.name || '',
        coreSellingPoints: targetCompanyServe.coreSellingPoints,
        expansionDomainKeywords: targetCompanyServe.expansionDomainKeywords,
        expansionDomainKeywordsSelected: targetCompanyServe.expansionDomainKeywordsSelected,
        customInput: targetCompanyServe.customInput
      })
      Taro.navigateTo({ url: '/pages/index/index' })
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

  const tips = () => {
    Taro.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000
    })
  }

  // 处理一键登录点击事件
  const handleOneClickLogin = async (e: any) => {
    if (e.detail.errMsg != 'getPhoneNumber:ok') {
      return
    }

    try {
      // 显示加载提示
      Taro.showLoading({
        title: '登录中...',
        mask: true
      })

      // 静默获取微信登录code
      const loginResult = await Taro.login({
        success: res => {
          return res
        },
        fail: err => {
          console.error('微信登录失败:', err)
          throw err
        }
      })

      if (loginResult.code) {
        loginByPhoneAPI({ loginCode: loginResult.code, phoneCode: e.detail.code, state: 'STATE' }, setLoginInfo)
      } else {
        Taro.showToast({
          title: '获取登录凭证失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      // 隐藏加载提示
      Taro.hideLoading()

      console.error('登录过程出错:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  return (
    <View className="login_page">
      <View className="login_back"></View>
      <Image src="http://36.141.100.123:10013/glks/assets/login/login2.png" className="login_logo" />
      <Image src="http://36.141.100.123:10013/glks/assets/login/login1.png" className="login_text" />
      {agreed ? (
        <NutButton className="login_btn" openType="getPhoneNumber|agreePrivacyAuthorization" onGetPhoneNumber={e => handleOneClickLogin(e)}>
          用户一键登录
        </NutButton>
      ) : (
        <NutButton className="login_btn" onClick={() => tips()}>
          用户一键登录
        </NutButton>
      )}

      <Text className="login_btn_phone" onClick={() => Taro.navigateTo({ url: '/subpackages/login/loginPhone/index' })}>
        手机验证码登录
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
