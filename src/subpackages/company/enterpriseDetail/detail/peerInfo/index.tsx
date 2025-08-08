import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import ContactPopup from '@/components/ContactPopup'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度

  // ==================== 列表数据状态 ====================
  const [customList, setCustomList] = useState<any[]>([]) // 企业列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

  // ==================== 标签页相关状态 ====================
  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页

  // ==================== 工具函数 ====================
  // 使用 useCallback 优化高亮关键词函数
  const highlightKeyword = useCallback((text: string, keyword: string) => {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={{ color: '#426EFF', fontWeight: 'bold' }}>
          {part}
        </Text>
      ) : (
        part
      )
    )
  }, [])

  // ==================== 事件处理函数 ====================
  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 4) {
      setIsShowPhone(true)
    }
    if (index === 5) {
      setIsShowAddress(true)
    }
  }

  function openAddress(item: any) {
    if (item.regLocation) {
      setAddress([item.regLocation])
      setIsShowAddress(true)
    } else {
      Taro.showToast({
        title: '暂无地址',
        icon: 'none'
      })
    }
  }

  function openPhone(val: any) {
    setIsShowPhone(true)
    setPhoneInfo(val.contactInfo.phones)
    setEmails(val.contactInfo.emails)
  }

  // ==================== 生命周期钩子 ====================
  // 初始化页面尺寸
  useEffect(() => {
    const query = Taro.createSelectorQuery()

    query.select('.headerSearch').boundingClientRect(rect => {
      if (rect && 'height' in rect) {
        setHeaderHeight(rect.height)
      }
    })
    query.exec()
  }, [])

  const formatInfo = (val: any) => {
    // 创建深拷贝以避免修改只读对象
    let newVal = JSON.parse(JSON.stringify(val))
    let companyList = [...newVal]

    let res = companyList.map((item: any) => {
      // 创建新的对象副本
      const newItem = { ...item }

      let locationStr = newItem.province || newItem.address || newItem.location || '未知省份'
      if (locationStr.includes('省')) {
        newItem.handleLocation = locationStr.split('省')[0] + '省'
      } else if (locationStr.includes('市')) {
        const directMunicipalities = ['北京', '上海', '天津', '重庆']
        const found = directMunicipalities.find(city => locationStr.includes(city))
        newItem.handleLocation = found ? found + '市' : locationStr.split('市')[0] + '市'
      } else if (locationStr.includes('自治区')) {
        newItem.handleLocation = locationStr.split('自治区')[0] + '自治区'
      } else {
        newItem.handleLocation = '未知省份'
      }

      // 处理评分（去除小数点）
      if (newItem.score && typeof newItem.score === 'number') {
        newItem.score = Math.floor(newItem.score)
      } else if (newItem.score && typeof newItem.score === 'string') {
        let scoreNumber = parseFloat(newItem.score)
        newItem.score = isNaN(scoreNumber) ? 0 : Math.floor(scoreNumber)
      }

      // 处理tags字段
      newItem.tags = Array.isArray(newItem.tags) ? newItem.tags.filter((tag: any) => tag !== '曾用名') : []
      return newItem
    })

    // 返回修改后的新对象
    newVal = res
    return newVal
  }

  useLoad(options => {
    setCustomList(formatInfo(JSON.parse(options.list)))
  })

  function toAiResearchReport(company: any): void {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  // 企业详情
  const handleEnterpriseDetail = (item: any) => {
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseDetail/index?company=${JSON.stringify(item)}&notDisplaying=${false}`
    })
  }

  return (
    <View className="searchEnterprisePage">
      {/* 联系人 */}
      <ContactPopup
        visible={isShowPhone}
        onClose={() => setIsShowPhone(false)}
        contactData={{
          phoneInfo,
          fixedLines,
          emails,
          address,
          others
        }}
        tabValue={tabValue}
        onTabChange={(value: number) => setTabValue(value)}
      />

      {/* 工厂地址 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowAddress} onClose={() => setIsShowAddress(false)}>
        <View className="popup_header">
          <View className="popup_header_title">工厂地址</View>
          <Image onClick={() => setIsShowAddress(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="address_content">
          <Cell.Group>
            {address.map((item, index) => (
              <Cell key={index} align="center" title={`公司地址${index + 1}`} description={item} />
            ))}
          </Cell.Group>
        </View>
      </Popup>

      {/* 筛选内容区域 */}
      <View className="enterpriseContent" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        {customList.length > 0 &&
          customList?.map((item, index) => (
            <View key={index}>
              <View className="enterpriseContent_item" onClick={() => handleEnterpriseDetail(item)}>
                <View className="enterpriseContent_item_top">
                  {item.logo ? (
                    // 判断是否为图片链接（包含http或https）
                    item.logo.includes('http') ? (
                      <Image src={item.logo} className="enterpriseContent_item_Img" />
                    ) : (
                      // 如果是文字，显示文字
                      <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="enterpriseContent_item_Img">
                        {item.logo}
                      </Text>
                    )
                  ) : (
                    // 如果为空，显示"暂无"
                    <Text className="enterpriseContent_item_Img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx' }}>
                      暂无
                    </Text>
                  )}
                  <View className="enterpriseContent_item_Text">
                    <View className="title">{item.name}</View>
                    <View className="description">
                      <View className="certification">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise3.png" className="certification_img" />
                        <View className="certification_text">官网</View>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="enterpriseContent_item_tag">
                  <View className="enterpriseContent_item_tag_item">{item.regStatus}</View>
                  {item.tags &&
                    item.tags.length > 0 &&
                    item.tags.map((tag: any, tagIndex: number) => (
                      <View key={tagIndex} className="enterpriseContent_item_tag_item">
                        {tag}
                      </View>
                    ))}
                </View>
                <View className="enterpriseContent_item_info">
                  <View className="enterpriseContent_item_info_item">{item.legalPersonName}</View>
                  <View className="enterpriseContent_item_info_item">{item.regCapital}</View>
                  <View className="enterpriseContent_item_info_item">{item.estiblishTime}</View>
                  <View className="enterpriseContent_item_info_item">{item.location}</View>
                </View>
                <View className="enterpriseContent_item_product">
                  <View className={`enterpriseContent_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword(item.businessScope, false || item.orgType)}</View>
                  <View
                    className="enterpriseContent_item_product_right"
                    onClick={e => {
                      e.stopPropagation()
                      setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))
                    }}
                  >
                    {expandedProducts[index] ? '收起' : '展开'}
                  </View>
                </View>
                <View className="enterpriseContent_item_contact">
                  <View className="enterpriseContent_item_contact_item" onClick={() => toAiResearchReport(item)}>
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise5.png" className="enterpriseContent_item_contact_item_img" />
                  </View>
                  <View
                    onClick={e => {
                      e.stopPropagation()
                      openPhone(item)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise1.png" className="enterpriseContent_item_contact_item_img" />
                    电话({item?.contactInfo?.phones.length || 0})
                  </View>
                  <View
                    onClick={e => {
                      e.stopPropagation()
                      openAddress(item)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise2.png" className="enterpriseContent_item_contact_item_img" />
                    地址({item?.regLocation ? 1 : 0})
                  </View>
                </View>
              </View>
              <View className="enterpriseContent_divider" />
            </View>
          ))}
      </View>
    </View>
  )
}

export default Index
