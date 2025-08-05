import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'

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
  const tabList = useMemo(
    () => [
      { id: 1, name: `手机号 ${phoneInfo?.length || 0}` },
      { id: 2, name: `固话 ${fixedLines?.length || 0}` },
      { id: 3, name: `邮箱 ${emails?.length || 0}` },
      { id: 4, name: `地址 ${address?.length || 0}` },
      { id: 5, name: `其他 ${others?.length || 0}` }
    ],
    [phoneInfo, fixedLines, emails, address, others]
  )

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

  useLoad(options => {
    setCustomList(JSON.parse(options.list))
  })

  function toAiResearchReport(company: any): void {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  // 企业详情
  const handleEnterpriseDetail = (item: any) => {
    Taro.navigateTo({
      url: '/subpackages/company/enterpriseDetail/index?company=' + JSON.stringify(item)
    })
  }

  return (
    <View className="searchEnterprisePage">
      {/* 联系人 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowPhone} onClose={() => setIsShowPhone(false)}>
        <View className="popup_header">
          <View className="popup_header_title">联系人</View>
          <Image onClick={() => setIsShowPhone(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <Tabs
          value={tabValue}
          onChange={(value: number) => {
            setTabValue(value)
          }}
        >
          {tabList.map(item => (
            <Tabs.TabPane key={item.id} title={item.name}>
              {tabValue === 0 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map((item, index) => (
                      <View className="tab_content_item" key={item} onClick={() => Taro.makePhoneCall({ phoneNumber: item })}>
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          {index < 3 ? <View className="recommend">推荐</View> : null}
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
                        {index < 3 ? (
                          <View className="tab_content_item_four">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 1 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
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
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 2 && (
                <>
                  <View className="tab_content">
                    {emails.map(item => (
                      <View className="tab_content_item" key={item} onClick={() => Taro.setClipboardData({ data: item })}>
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
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
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 3 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
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
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 4 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
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
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Popup>

      {/* 工厂地址 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowAddress} onClose={() => setIsShowAddress(false)}>
        <View className="popup_header">
          <View className="popup_header_title">工厂地址</View>
          <Image onClick={() => setIsShowAddress(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="address_content">
          <Cell.Group>
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
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
                        <View className="certification_text">认证</View>
                      </View>
                      <View className="match">匹配80%</View>
                    </View>
                  </View>
                </View>
                <View className="enterpriseContent_item_tag">
                  <View className="enterpriseContent_item_tag_item">存续</View>
                  <View className="enterpriseContent_item_tag_item">省级制造业单项冠军企业</View>
                  <View className="enterpriseContent_item_tag_item">高新企业</View>
                  <View className="enterpriseContent_item_tag_item">展开</View>
                </View>
                <View className="enterpriseContent_item_info">
                  <View className="enterpriseContent_item_info_item avsd">{item.legalPersonName}</View>
                  <View className="enterpriseContent_item_info_item">{item.regCapital}</View>
                  <View className="enterpriseContent_item_info_item">{item.estiblishTime}</View>
                  <View className="enterpriseContent_item_info_item">深圳</View>
                </View>
                <View className="enterpriseContent_item_product">
                  <View className={`enterpriseContent_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword('产品与服务：柴油发电机组、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机', '电机')}</View>
                  <View className="enterpriseContent_item_product_right" onClick={() => setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))}>
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
                      handleActiveIndex(5)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise2.png" className="enterpriseContent_item_contact_item_img" />
                    地址({address?.length || 0})
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
