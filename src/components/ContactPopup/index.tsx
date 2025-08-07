import React from 'react'
import { Popup, Tabs } from '@nutui/nutui-react-taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface ContactData {
  phoneInfo: string[]
  fixedLines: string[]
  emails: string[]
  address: string[]
  others: string[]
}

interface ContactPopupProps {
  visible: boolean
  onClose: () => void
  contactData: ContactData
  tabValue: number
  onTabChange: (value: number) => void
}

const ContactPopup: React.FC<ContactPopupProps> = ({ visible, onClose, contactData, tabValue, onTabChange }) => {
  const { phoneInfo, fixedLines, emails, address, others } = contactData

  const tabList = [
    { id: 1, name: `手机号 ${phoneInfo?.length || 0}` },
    { id: 2, name: `固话 ${fixedLines?.length || 0}` },
    { id: 3, name: `邮箱 ${emails?.length || 0}` },
    { id: 4, name: `地址 ${address?.length || 0}` },
    { id: 5, name: `其他 ${others?.length || 0}` }
  ]

  // 渲染联系人项目
  const renderContactItem = (item: string, index: number, type: 'phone' | 'email' | 'other') => {
    const handleClick = () => {
      if (type === 'phone') {
        Taro.makePhoneCall({ phoneNumber: item })
      } else if (type === 'email') {
        Taro.setClipboardData({ data: item })
      }
    }

    return (
      <View className="tab_content_item" key={item} onClick={handleClick}>
        <View className="tab_content_item_one">
          <View className="modile">{item}</View>
          {type === 'phone' && index < 3 ? <View className="recommend">推荐</View> : null}
          {type === 'email' ? <View className="recommend">推荐</View> : null}
        </View>
        <View className="tab_content_item_two">
          <View className="name">- -</View>
          <View className="position">- -</View>
          <View className="security">
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
            <View className="security_dot"></View>
            <View className="security_text">未检测</View>
          </View>
        </View>
        <View className="tab_content_item_three">
          <Text style={{ color: '#333333' }}>来自：</Text> - -
        </View>
        {(type === 'phone' && index < 3) || type === 'email' ? (
          <View className="tab_content_item_four">
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={visible} onClose={onClose}>
      <View className="popup_header">
        <View className="popup_header_title">联系人</View>
        <Image onClick={onClose} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
      </View>
      <Tabs value={tabValue} onChange={onTabChange}>
        {tabList.map((item, index) => (
          <Tabs.TabPane key={item.id} title={item.name}></Tabs.TabPane>
        ))}
      </Tabs>
      {/* 手机号 */}
      {tabValue === 0 && (
        <ScrollView scrollY className="tab_content">
          {phoneInfo.map((item, index) => renderContactItem(item, index, 'phone'))}
        </ScrollView>
      )}

      {/* 固话 */}
      {tabValue === 1 && (
        <ScrollView scrollY className="tab_content">
          {fixedLines.map((item, index) => renderContactItem(item, index, 'phone'))}
        </ScrollView>
      )}

      {/* 邮箱 */}
      {tabValue === 2 && (
        <ScrollView scrollY className="tab_content">
          {emails.map((item, index) => renderContactItem(item, index, 'email'))}
        </ScrollView>
      )}

      {/* 地址 */}
      {tabValue === 3 && (
        <ScrollView scrollY className="tab_content">
          {address.map((item, index) => renderContactItem(item, index, 'other'))}
        </ScrollView>
      )}

      {/* 其他 */}
      {tabValue === 4 && (
        <ScrollView scrollY className="tab_content">
          {others.map((item, index) => renderContactItem(item, index, 'other'))}
        </ScrollView>
      )}
    </Popup>
  )
}

export default ContactPopup
