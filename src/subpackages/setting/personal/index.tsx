import React, { useState } from 'react'
import { Image, Input, View } from '@tarojs/components'
import { Radio } from '@nutui/nutui-react-taro'
import './index.scss'
import { ArrowRightSize6, CheckNormal, Checked } from '@nutui/icons-react-taro'

function Index() {
  const [nickname, setNickname] = useState('bin')
  const [position, setPosition] = useState('bin')

  return (
    <View className="detailPage">
      <View className="avatar">
        <Image className="avatar_img" src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" />
      </View>

      <View className="info_list">
        <View className="info_item">
          <View>昵称</View>
          <View>
            <Input style={{ textAlign: 'right' }} value={nickname} onInput={e => setNickname(e.detail.value)} />
          </View>
        </View>
        <View className="info_item">
          <View>ID</View>
          <View>GLKS001</View>
        </View>
        <View className="info_item">
          <View>地区</View>
          <View>
            北京市 房山区 <ArrowRightSize6 size={'28rpx'} color="#8A8A8A" />
          </View>
        </View>
        <View className="info_item">
          <View>性别</View>
          <View>
            <Radio.Group labelPosition="left" defaultValue="1" direction="horizontal">
              <Radio activeIcon={<Checked color="#666666" size="24rpx" />} icon={<CheckNormal color="#dfdfdf" size="24rpx" />} value="1">
                男
              </Radio>
              <Radio activeIcon={<Checked color="#666666" size="24rpx" />} icon={<CheckNormal color="#dfdfdf" size="24rpx" />} value="2">
                女
              </Radio>
            </Radio.Group>
          </View>
        </View>
        <View className="info_item">
          <View>职位</View>
          <View>
            <Input style={{ textAlign: 'right' }} value={position} onInput={e => setPosition(e.detail.value)} />
          </View>
        </View>
      </View>

      <View className="save_btn">保存</View>
    </View>
  )
}

export default Index
