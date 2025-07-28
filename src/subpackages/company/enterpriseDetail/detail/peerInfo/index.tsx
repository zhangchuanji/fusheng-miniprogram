import React, { useEffect, useState, useCallback } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { options } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度

  // ==================== 列表数据状态 ====================
  const [customList, setCustomList] = useState<any[]>([{}, {}]) // 企业列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

  // ==================== 标签页相关状态 ====================
  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页
  const [tabList, setTabList] = useState([
    { id: 1, name: '手机号 148' },
    { id: 2, name: '固话 148' },
    { id: 3, name: '邮箱 148' },
    { id: 4, name: '地址 148' },
    { id: 5, name: '其他 148' }
  ]) // 标签页列表

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

  return (
    <View className="searchEnterprisePage">
      {/* 联系人 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowPhone} onClose={() => setIsShowPhone(false)}>
        <View className="popup_header">
          <View className="popup_header_title">联系人</View>
          <Image onClick={() => setIsShowPhone(false)} src={require('@/assets/enterprise/enterprise14.png')} className="popup_header_img" />
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
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src={require('@/assets/enterprise/enterprise12.png')} className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                      </View>
                    </View>
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src={require('@/assets/enterprise/enterprise12.png')} className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                      </View>
                    </View>
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src={require('@/assets/enterprise/enterprise12.png')} className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src={require('@/assets/enterprise/enterprise13.png')} className="tab_content_item_four_img" />
                      </View>
                    </View>
                  </View>
                </>
              )}
              {tabValue === 1 && (
                <>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                </>
              )}
              {tabValue === 2 && (
                <>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                </>
              )}
              {tabValue === 3 && (
                <>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                </>
              )}
              {tabValue === 4 && (
                <>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
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
          <Image onClick={() => setIsShowAddress(false)} src={require('@/assets/enterprise/enterprise14.png')} className="popup_header_img" />
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
        {customList.map((item, index) => (
          <View key={index}>
            <View className="enterpriseContent_item">
              <View className="enterpriseContent_item_top">
                <Image src={require('@/assets/enterprise/enterprise11.png')} className="enterpriseContent_item_Img" />
                <View className="enterpriseContent_item_Text">
                  <View className="title">杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司</View>
                  <View className="description">
                    <View className="certification">
                      <Image src={require('@/assets/enterprise/enterprise3.png')} className="certification_img" />
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
                <View className="enterpriseContent_item_info_item">郭雄</View>
                <View className="enterpriseContent_item_info_item">10000万人民币</View>
                <View className="enterpriseContent_item_info_item">2003-11-10</View>
                <View className="enterpriseContent_item_info_item">深圳</View>
              </View>
              <View className="enterpriseContent_item_product">
                <View className={`enterpriseContent_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword('产品与服务：柴油发电机组、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机', '电机')}</View>
                <View className="enterpriseContent_item_product_right" onClick={() => setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))}>
                  {expandedProducts[index] ? '收起' : '展开'}
                </View>
              </View>
              <View className="enterpriseContent_item_contact">
                <View className="enterpriseContent_item_contact_item">
                  <Image src={require('@/assets/enterprise/enterprise5.png')} className="enterpriseContent_item_contact_item_img" />
                </View>
                <View onClick={() => handleActiveIndex(4)} className="enterpriseContent_item_contact_item">
                  <Image src={require('@/assets/enterprise/enterprise1.png')} className="enterpriseContent_item_contact_item_img" />
                  电话(112)
                </View>
                <View onClick={() => handleActiveIndex(5)} className="enterpriseContent_item_contact_item">
                  <Image src={require('@/assets/enterprise/enterprise2.png')} className="enterpriseContent_item_contact_item_img" />
                  地址(2)
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
