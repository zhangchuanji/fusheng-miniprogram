import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Cell, Popup, Tabs, Input, Calendar } from '@nutui/nutui-react-taro'
import './index.scss'
import { SearchBar } from '@nutui/nutui-react-taro'
import { ArrowRight, Checked, Failure, TriangleDown } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { clueListAPI, clueDeleteAPI, clueFollowUpPageAPI } from '@/api/clue'
import { useSelector } from 'react-redux'
import useDebounce from '@/hooks/useDebounce'
import { aiSessionListAPI } from '@/api/chatMsg'

function CluePage({ height }: { height: number }) {
  const userInfo = useSelector((state: any) => state.login.userInfo)
  const [tabvalue, setTabvalue] = useState(0)
  const [isShowPhone, setIsShowPhone] = useState(false)
  const [isShowAddress, setIsShowAddress] = useState(false)
  const [isShowFilter, setIsShowFilter] = useState(false)
  const [tabFilterValue, setTabFilterValue] = useState(0)
  const [tabValue, setTabValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [clueList, setClueList] = useState<any[]>([])
  const [historySession, setHistorySession] = useState<any[]>([])
  const [tabList, setTabList] = useState([
    { id: 1, name: '手机号 148' },
    { id: 2, name: '固话 148' },
    { id: 3, name: '邮箱 148' },
    { id: 4, name: '地址 148' },
    { id: 5, name: '其他 148' }
  ])
  const [followUpList, setFollowUpList] = useState<any[]>([])

  // ==================== 筛选相关状态 ====================
  const [sortType, setSortType] = useState('asc') // 排序类型：asc-正序，desc-倒序
  const [selectedSortField, setSelectedSortField] = useState('followTime') // 选中的排序字段
  const [selectedFilterFields, setSelectedFilterFields] = useState<string[]>([]) // 选中的筛选字段

  // 筛选页面状态
  const [selectedModule, setSelectedModule] = useState('all') // 选中的模块：all-全部，clue-线索
  const [selectedVisitMethods, setSelectedVisitMethods] = useState<string[]>([]) // 选中的到访方式
  const [filterKeyword, setFilterKeyword] = useState('') // 筛选关键词
  const [filterTimeRange, setFilterTimeRange] = useState('') // 筛选时间范围

  // ==================== 搜索相关状态 ====================
  const [searchValueClueList, setSearchValueClueList] = useState('') // 搜索关键词
  const [searchValueFollowRecord, setSearchValueFollowRecord] = useState('') // 搜索关键词

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

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

  // 安全的HTML解析函数
  const parseSafeHTML = useCallback((html: string) => {
    if (!html) return ''

    // 只允许特定的HTML标签
    const allowedTags = ['em', 'strong', 'b', 'i', 'u', 'mark']
    const allowedAttributes = ['class', 'style']

    // 简单的HTML清理（在实际项目中建议使用更完善的HTML清理库）
    let cleanHTML = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // 移除iframe标签
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 移除事件处理器

    return cleanHTML
  }, [])

  // ==================== 事件处理函数 ====================
  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 0) {
      setIsShowFilter(true)
      setTabFilterValue(0)
    }
    if (index === 1) {
      setIsShowFilter(true)
      setTabFilterValue(1)
    }
    if (index === 3) {
      setIsShowPhone(true)
    }
    if (index === 4) {
      setIsShowPhone(true)
    }
    if (index === 5) {
      setIsShowAddress(true)
    }
  }

  const getSession = () => {
    aiSessionListAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        const convertedData = Object.entries(res.data).map(([name, list]) => ({
          name,
          list: list as any[]
        }))
        setHistorySession(convertedData)
      }
    })
  }

  const getClueList = () => {
    clueListAPI({ pageNo: 1, pageSize: 10, userId: userInfo?.id, keywords: searchValueClueList }, res => {
      if (res.success && res.data) {
        res.data.list.forEach((item: any) => {
          if (item.tags && typeof item.tags === 'string') {
            item.tags = item.tags
              .split(',')
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
          }
        })
        setClueList(res.data.list)
      }
    })
  }

  const getFollowUpList = useCallback(async () => {
    clueFollowUpPageAPI({ pageNum: 1, pageSize: 3, userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        setFollowUpList(res.data.list)
      }
    })
  }, [])

  useEffect(() => {
    getClueList()
  }, [])

  function changeTabValue(value: any) {
    setTabvalue(value)
    if (value === 0) {
      getClueList()
    } else if (value === 1) {
      getFollowUpList()
    } else if (value === 2) {
      getSession()
    }
  }

  const handleRemove = (id: number) => {
    clueDeleteAPI({ id }, res => {
      if (res.success) {
        getClueList()
      }
    })
  }

  // 处理排序类型选择
  const handleSortTypeChange = (type: string) => {
    setSortType(type)
  }

  // 处理排序字段选择
  const handleSortFieldChange = (field: string) => {
    setSelectedSortField(field)
  }

  // 处理筛选字段选择
  const handleFilterFieldChange = (field: string) => {
    setSelectedFilterFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(item => item !== field)
      } else {
        return [...prev, field]
      }
    })
  }

  // 检查字段是否被选中
  const isFieldSelected = (field: string) => {
    return selectedFilterFields.includes(field)
  }

  // 处理模块选择
  const handleModuleChange = (module: string) => {
    setSelectedModule(module)
  }

  // 处理到访方式选择
  const handleVisitMethodChange = (method: string) => {
    setSelectedVisitMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(item => item !== method)
      } else {
        return [...prev, method]
      }
    })
  }

  // 检查到访方式是否被选中
  const isVisitMethodSelected = (method: string) => {
    return selectedVisitMethods.includes(method)
  }

  const toFollowPage = (index: number) => {
    Taro.navigateTo({
      url: `/pages/index/cluePage/follow/index?index=${index}`
    })
  }

  // 处理筛选确认
  const handleCalendarConfirm = (value: any) => {
    let date = `${value[0][3]} - ${value[1][3]}`
    setFilterTimeRange(date)
    setIsVisible(false)
  }

  const handleFilterConfirm = () => {
    console.log('筛选条件：', {
      module: selectedModule,
      visitMethods: selectedVisitMethods,
      keyword: filterKeyword,
      timeRange: filterTimeRange
    })
    setIsShowFilter(false)
  }

  // 处理筛选重置
  const handleFilterReset = () => {
    setSelectedModule('all')
    setSelectedVisitMethods([])
    setFilterKeyword('')
    setFilterTimeRange('')
    setSortType('asc')
    setSelectedSortField('followTime')
    setSelectedFilterFields([])
  }

  const searchClueListChange = (e: any) => {
    setSearchValueClueList(e)
  }

  const handleSearchClueList = () => {
    getClueList()
  }
  // 在组件内部
  const debouncedSearchValue = useDebounce<any>(searchValueFollowRecord, 500)

  useEffect(() => {
    console.log(debouncedSearchValue)
    // 执行搜索逻辑
  }, [debouncedSearchValue])

  function parseDate(createTime: any): React.ReactNode {
    let time = new Date(createTime)
    // 转为2025-01-01 12:00:00
    let year = time.getFullYear()
    let month = time.getMonth() + 1
    let day = time.getDate()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let second = time.getSeconds()
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  return (
    <View className="cluePage" style={{ height: `calc(100vh - ${height}px)` }}>
      {/* 联系人 */}
      <Popup position="bottom" style={{ maxHeight: '85%', minHeight: '85%' }} visible={isShowPhone} onClose={() => setIsShowPhone(false)}>
        <View className="popup_header" style={{ height: '100rpx' }}>
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
      <Popup position="bottom" style={{ maxHeight: '85%', minHeight: '85%' }} visible={isShowAddress} onClose={() => setIsShowAddress(false)}>
        <View className="popup_header" style={{ height: '100rpx' }}>
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

      {/* 排序 */}
      <Popup position="bottom" style={{ maxHeight: '85%', minHeight: '85%' }} visible={isShowFilter} onClose={() => setIsShowFilter(false)}>
        <View className="popup_header">
          <Image onClick={() => setIsShowFilter(false)} src={require('@/assets/enterprise/enterprise14.png')} className="popup_header_img" />
          <Tabs
            value={tabFilterValue}
            onChange={(value: number) => {
              setTabFilterValue(value)
            }}
          >
            <Tabs.TabPane title="排序"></Tabs.TabPane>
            <Tabs.TabPane title="筛选"></Tabs.TabPane>
          </Tabs>
          {tabFilterValue === 0 && (
            <View className="popup_filter">
              <View className="filterItem_top">
                <View className="filterItem" onClick={() => handleSortTypeChange('asc')}>
                  <View>正序排序</View>
                  {sortType === 'asc' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItem" onClick={() => handleSortTypeChange('desc')}>
                  <View>倒序排序</View>
                  {sortType === 'desc' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
              </View>
              <View className="filterItem_bottom">
                <View className="filterItemAction" onClick={() => handleSortFieldChange('followPerson')}>
                  <View>跟进人员</View>
                  {selectedSortField === 'followPerson' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItemAction" onClick={() => handleSortFieldChange('createTime')}>
                  <View>创建时间</View>
                  {selectedSortField === 'createTime' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItemAction" onClick={() => handleSortFieldChange('module')}>
                  <View>所属模块</View>
                  {selectedSortField === 'module' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItemAction" onClick={() => handleSortFieldChange('followType')}>
                  <View>跟进类型</View>
                  {selectedSortField === 'followType' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
              </View>
              <View className="filter_actions">
                <View className="action_button reset" onClick={handleFilterReset}>
                  重置
                </View>
                <View className="action_button confirm" onClick={handleFilterConfirm}>
                  确定
                </View>
              </View>
            </View>
          )}
          {tabFilterValue === 1 && (
            <View className="popup_sort">
              {/* 所属模块 */}
              <View className="filter_section">
                <View className="section_title">所属模块</View>
                <View className="module_buttons">
                  <View className={`module_button ${selectedModule === 'all' ? 'selected' : ''}`} onClick={() => handleModuleChange('all')}>
                    <View>全部</View>
                  </View>
                  <View className={`module_button ${selectedModule === 'clue' ? 'selected' : ''}`} onClick={() => handleModuleChange('clue')}>
                    <View>线索</View>
                  </View>
                </View>
              </View>

              {/* 到访方式 */}
              <View className="filter_section">
                <View className="section_title">到访</View>
                <View className="visit_buttons">
                  <View className={`visit_button ${isVisitMethodSelected('visit') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('visit')}>
                    <View>到访</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('phone') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('phone')}>
                    <View>电话</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('wechat') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('wechat')}>
                    <View>微信</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('sms') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('sms')}>
                    <View>短信</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('email') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('email')}>
                    <View>邮件</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('qq') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('qq')}>
                    <View>QQ</View>
                  </View>
                  <View className={`visit_button ${isVisitMethodSelected('other') ? 'selected' : ''}`} onClick={() => handleVisitMethodChange('other')}>
                    <View>其他</View>
                  </View>
                </View>
              </View>

              {/* 关键词查询 */}
              <View className="filter_section">
                <View className="section_title">关键词查询</View>
                <Input placeholder="输入搜索的关键词" style={{ width: '100%' }} value={filterKeyword} onChange={setFilterKeyword} />
              </View>

              {/* 创建时间 */}
              <View className="filter_section" onClick={() => setIsVisible(true)}>
                <View className="section_title">创建时间</View>
                <Input placeholder="选择时间范围" disabled style={{ width: '100%' }} value={filterTimeRange} onChange={setFilterTimeRange} />
              </View>

              {/* 操作按钮 */}
              <View className="filter_actions">
                <View className="action_button reset" onClick={handleFilterReset}>
                  重置
                </View>
                <View className="action_button confirm" onClick={handleFilterConfirm}>
                  确定
                </View>
              </View>
            </View>
          )}
        </View>
      </Popup>

      <Calendar visible={isVisible} type="range" onClose={() => setIsVisible(false)} onConfirm={handleCalendarConfirm} />
      <View
        className="floating-add-btn"
        onClick={() => {
          Taro.navigateTo({ url: '/subpackages/cluePage/addFollow/index' })
        }}
      >
        <View className="add-icon-row"></View>
        <View className="add-icon-col"></View>
      </View>
      <Tabs
        value={tabvalue}
        onChange={value => {
          changeTabValue(value)
        }}
      >
        <Tabs.TabPane title="线索列表">
          <View className="cluePage_list">
            <SearchBar placeholder="搜索内容" style={{ width: '100%' }} onChange={searchClueListChange} onBlur={handleSearchClueList} />
            <ScrollView
              scrollY
              style={{
                height: `calc(100vh - 220rpx - ${height}px)`,
                flex: 1
              }}
            >
              {clueList &&
                clueList.length > 0 &&
                clueList.map((item, index) => (
                  <View className="cluePage_item" key={index}>
                    <View className="cluePage_item_top">
                      {item.logo ? (
                        <Image src={item.logo} className="cluePage_item_Img" />
                      ) : (
                        <View className="cluePage_item_Img company-avatar">
                          <Text className="company-avatar-text">{item.name ? item.name.substring(0, 2) : '未知'}</Text>
                        </View>
                      )}
                      <View className="cluePage_item_Text">
                        <View className="item_title">
                          <View dangerouslySetInnerHTML={{ __html: parseSafeHTML(item.name || '') }}></View>
                          <View className="item_title_text" onClick={() => handleRemove(item.id)}>
                            移除
                            <View
                              style={{
                                width: '24rpx',
                                height: '24rpx',
                                marginLeft: '4rpx',
                                border: '1.5rpx solid currentColor',
                                borderRadius: '50%',
                                position: 'relative',
                                display: 'inline-block'
                              }}
                            >
                              <View
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '4rpx',
                                  right: '4rpx',
                                  height: '1.5rpx',
                                  backgroundColor: 'currentColor',
                                  transform: 'translateY(-50%)'
                                }}
                              />
                            </View>
                          </View>
                        </View>
                        <View className="item_description">
                          已跟进：<Text style={{ color: '#EA6835' }}>{item.followUpDays}天</Text>
                        </View>
                      </View>
                    </View>
                    <View className="cluePage_item_tag">
                      {item.tags &&
                        item.tags.length > 0 &&
                        item.tags.map((tag: any, index: number) => (
                          <View className="cluePage_item_tag_item" key={index}>
                            {tag}
                          </View>
                        ))}
                    </View>
                    <View className="cluePage_item_product">
                      <View className={`cluePage_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword(item.businessScope, searchValueClueList || '')}</View>
                      <View className="cluePage_item_product_right" onClick={() => setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))}>
                        {expandedProducts[index] ? '收起' : '展开'}
                      </View>
                    </View>
                    <View className="cluePage_item_contact">
                      <View className="cluePage_item_contact_item">
                        <Image src={require('@/assets/enterprise/enterprise5.png')} className="cluePage_item_contact_item_img" />
                      </View>
                      <View onClick={() => handleActiveIndex(3)} className="cluePage_item_contact_item">
                        <Image src={require('@/assets/enterprise/enterprise15.png')} className="cluePage_item_contact_item_img" />
                        跟进
                      </View>
                      <View onClick={() => handleActiveIndex(4)} className="cluePage_item_contact_item">
                        <Image src={require('@/assets/enterprise/enterprise1.png')} className="cluePage_item_contact_item_img" />
                        电话(112)
                      </View>
                      <View onClick={() => handleActiveIndex(5)} className="cluePage_item_contact_item">
                        <Image src={require('@/assets/enterprise/enterprise2.png')} className="cluePage_item_contact_item_img" />
                        地址(2)
                      </View>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        </Tabs.TabPane>
        <Tabs.TabPane title="跟进记录">
          <View className="cluePage_list">
            <SearchBar placeholder="搜索内容" style={{ width: '100%' }} value={searchValueFollowRecord} onChange={(e: any) => setSearchValueFollowRecord(e)} />
            {/* <View className="cluePage_filter">
              <View className="filter_item" onClick={() => handleActiveIndex(0)}>
                <View className="item_textI">
                  <Image src={require('@/assets/enterprise/enterprise11.png')} className="item_img" />
                  <View className="item_text">排序</View>
                </View>
                <TriangleDown color="#426EFF" size="16rpx" />
              </View>
              <View className="filter_item" onClick={() => handleActiveIndex(1)}>
                <View className="item_textI">
                  <Image src={require('@/assets/enterprise/enterprise11.png')} className="item_img" />
                  <View className="item_text">筛选</View>
                </View>
                <TriangleDown color="#426EFF" size="16rpx" />
              </View>
            </View> */}
            <ScrollView
              scrollY
              style={{
                height: `calc(100vh - 320rpx - ${height}px)`,
                flex: 1
              }}
            >
              {followUpList.map((item: any, index: number) => (
                <View className="clueRecord_item" onClick={() => toFollowPage(index)} key={index}>
                  <View className="clueRecord_item_left">{item?.avatar ? <Image src={item.avatar} className="avatar" /> : <Image src={require('@/assets/enterprise/enterprise11.png')} className="avatar" />}</View>
                  <View className="clueRecord_item_right">
                    <View className="clueRecord_item_right_top">
                      <View className="name">{item.name || '客户名称'}</View>
                      <View className="position">{item.position || '客户职位'}</View>
                      <View className="status">
                        {item.type || '跟进类型'}（{item.method || '跟进方式'})
                      </View>
                    </View>
                    <View className="item_content">{item.content || '跟进内容'}</View>
                    <View className="item_time">
                      <Image src={require('@/assets/chat/chat1.png')} className="item_time_img"></Image>
                      {parseDate(item.createTime || '跟进时间')}
                    </View>
                    <View className="item_link">
                      联系人：{item.followUpName || '跟进人'}｜{item.followUpPosition || '跟进人职位'}｜{item.followUpPhone || '跟进人手机号'}
                    </View>
                    <View className="item_from">来自线索：{item.followUpCompany || '客户所属公司'}</View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Tabs.TabPane>
        <Tabs.TabPane title="历史匹配线索">
          <ScrollView
            scrollY
            style={{
              height: `calc(100vh - 120rpx - ${height}px)`,
              flex: 1
            }}
          >
            <View className="cluePage_list">
              {Array.from({ length: 10 }).map((_, index) => (
                <View className="history_item" key={index}>
                  <View className="history_top">
                    <View className="dot"></View>
                    <View className="time">2023-09-09</View>
                  </View>
                  <View className="history_content">
                    <View className="history_msg">问答问题：国内前20的扁线电机的企业有哪些？问答问题：国内前20的扁线电机的企业有哪些？问答问题：国内前20的扁线电机的企业有哪些？</View>
                    <View className="history_company">
                      <View className="history_img">
                        <Image src={require('@/assets/enterprise/enterprise11.png')} className="history_img_img" />
                      </View>
                      <View className="history_info">
                        <View className="info_top">
                          <View className="info_top_title">浙江盘毂动力科技有限公司</View>
                          <ArrowRight color="#2B2B2B" size="30rpx" />
                        </View>
                        <View className="info_msgs">
                          <View className="msgs_item">上海</View>
                          <View className="msgs_tag">
                            <Image src={require('@/assets/corpDetail/corpDetail21.png')} className="msgs_tag_img" />
                            <View className="msgs_tag_text">官网</View>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="history_tag">
                      <View className="tag_item">存续</View>
                      <View className="tag_item">高新企业</View>
                      <View className="tag_item">省级制造业单项冠军企业</View>
                    </View>
                    <View className="history_tags">
                      <View className="tags_item">最匹配</View>
                      <View className="tags_item">最新</View>
                    </View>
                  </View>
                </View>
              ))}

              <View className="company_total">
                <View style={{ marginRight: '16rpx' }}>查看15000企业信息</View>
                <ArrowRight color="#1B5BFF" size="24rpx" />
              </View>
            </View>
          </ScrollView>
        </Tabs.TabPane>
      </Tabs>
    </View>
  )
}

export default CluePage
