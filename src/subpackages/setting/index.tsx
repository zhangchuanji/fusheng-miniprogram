import React, { useState } from 'react'
import { View } from '@tarojs/components'
import './index.scss'
import { Cell } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { logoutAPI } from '@/api/login'
import { userAgreementAPI, getAreaAPI, loginInfoAPI, loginInfoUpdateAPI } from '@/api/setting'

function Index() {
  const [capsuleInfo, setCapsuleInfo] = useState({ height: 32, statusBarHeight: 0 })

  function logoutClick() {
    Taro.showModal({
      title: '提示',
      content: '确定退出登陆吗？',
      success: res => {
        if (res.confirm) {
          logoutAPI({}, res => {
            if (res.success) {
              Taro.reLaunch({
                url: '/pages/login/index'
              })
            }
          })
        }
      }
    })
  }

  return (
    <View className="detailPage">
      <View className="setting_box">
        <Cell.Group>
          <Cell className="nutui-cell-clickable" title="个人资料" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/personal/index' })} />
          <Cell className="nutui-cell-clickable" title="注销账号" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/account/index' })} />
          <Cell className="nutui-cell-clickable" title="修改手机号" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/changePhone/index' })} />
          <Cell className="nutui-cell-clickable" title="联系我们" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/contactUs/index' })} />
          <Cell className="nutui-cell-clickable" title="企业管理" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/enterprise/index' })} />
          <Cell className="nutui-cell-clickable" title="意见反馈" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/feedback/index' })} />
          <Cell className="nutui-cell-clickable" title="关于我们" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/subpackages/setting/aboutUs/index' })} />
        </Cell.Group>
      </View>
      <View className="logout_btn" onClick={logoutClick}>
        退出登陆
      </View>
    </View>
  )
}

export default Index
