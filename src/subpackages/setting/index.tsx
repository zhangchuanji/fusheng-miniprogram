import React, { useState } from 'react'
import { View } from '@tarojs/components'
import './index.scss'
import { Cell } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const [capsuleInfo, setCapsuleInfo] = useState({ height: 32, statusBarHeight: 0 })

  return (
    <View className="detailPage">
      <View className="setting_box">
        <Cell.Group>
          <Cell className="nutui-cell-clickable" title="个人资料" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/personal/index' })} />
          <Cell className="nutui-cell-clickable" title="注销账号" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/account/index' })} />
          <Cell className="nutui-cell-clickable" title="修改手机号" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/changePhone/index' })} />
          <Cell className="nutui-cell-clickable" title="联系我们" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/contactUs/index' })} />
          <Cell className="nutui-cell-clickable" title="企业管理" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/enterprise/index' })} />
          <Cell className="nutui-cell-clickable" title="意见反馈" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/feedback/index' })} />
          <Cell className="nutui-cell-clickable" title="关于我们" align="center" extra={<ArrowRight size={'28rpx'} color="#B6B6B6" />} onClick={() => Taro.navigateTo({ url: '/pages/setting/aboutUs/index' })} />
        </Cell.Group>
      </View>
      <View className="logout_btn">退出登陆</View>
    </View>
  )
}

export default Index
