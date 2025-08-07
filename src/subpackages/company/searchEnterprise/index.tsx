import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import ContactPopup from '@/components/ContactPopup'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [searchValue, setSearchValue] = useState('') // 搜索关键词
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度

  // ==================== 列表数据状态 ====================
  const [customHasMore, setCustomHasMore] = useState(true) // 是否还有更多数据
  const [leadStatus, setLeadStatus] = useState<{ [key: string]: boolean }>({}) // 每条线索的状态管理
  const [currentOperatingItem, setCurrentOperatingItem] = useState<any>(null) // 当前操作的线索项
  const [customList, setCustomList] = useState<any[]>([]) // 企业列表数据
  const [filteredCustomList, setFilteredCustomList] = useState<any[]>([]) // 过滤后的企业列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他

  // ==================== 线索操作状态 ====================
  const [isShowAdd, setIsShowAdd] = useState(true) // 是否显示加入线索按钮
  const [dialogType, setDialogType] = useState<'add' | 'remove' | 'batchAdd'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [isLiked, setIsLiked] = useState(false) // 是否已点赞
  const [isDisliked, setIsDisliked] = useState(false) // 是否已点踩
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

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

  useLoad(options => {
    const customList = options?.customList
    if (customList) {
      setCustomList(JSON.parse(customList))
    }
  })

  // ==================== 反馈相关状态 ====================
  const [feedBackValue, setFeedBackValue] = useState('') // 反馈内容

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

  // 延迟函数
  const sleep = (time: number): Promise<unknown> =>
    new Promise(resolve => {
      setTimeout(resolve, time)
    })

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

  // 处理搜索
  const handleSearch = () => {
    if (!searchValue.trim()) {
      // 如果搜索关键词为空，显示所有数据
      setFilteredCustomList(customList)
      return
    }

    // 模糊搜索逻辑 - 仅搜索 businessScope、industry、name 三个字段
    const filtered = customList.filter(item => {
      const searchTerm = searchValue.toLowerCase()

      // 搜索字段：公司名称、行业、经营范围
      const searchFields = [
        item.name || '', // 公司名称
        item.industry || '', // 行业
        item.businessScope || '' // 经营范围
      ]

      // 检查是否有任何字段包含搜索关键词
      return searchFields.some(field => field.toString().toLowerCase().includes(searchTerm))
    })

    setFilteredCustomList(filtered)
  }

  // 监听搜索值变化，实时搜索
  useEffect(() => {
    handleSearch()
  }, [searchValue, customList])

  // 初始化时设置过滤列表
  useEffect(() => {
    setFilteredCustomList(customList)
  }, [customList])

  // ==================== 点赞点踩处理函数 ====================
  // 处理点赞点击
  const handleLike = (e: any) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)

    // 触发心跳动画
    if (!isLiked) {
      setShowHeartbeat(true)
      setTimeout(() => {
        setShowHeartbeat(false)
      }, 600)
    }
  }

  // 处理点踩点击
  const handleDislike = (e: any) => {
    // 触发抖动动画
    setShowShake(true)
    setTimeout(() => {
      setShowShake(false)
    }, 500)
    if (isDisliked) {
      setIsShowInvalid(true)
    } else {
      setIsShowFeedback(true)
    }
  }

  // ==================== 线索操作处理函数 ====================
  // 处理加入线索点击
  const handleAddToLeads = (e: any, item: any) => {
    e.stopPropagation()
    setDialogType('add')
    setShowCustomDialog(true)
    setCurrentOperatingItem(item)
  }

  // 处理移除线索点击
  const handleRemoveFromLeads = (e: any, item: any) => {
    e.stopPropagation()
    setDialogType('remove')
    setShowCustomDialog(true)
    // 保存当前操作的线索ID
    setCurrentOperatingItem(item)
  }

  // 处理确认弹窗
  const handleDialogConfirm = () => {
    setShowCustomDialog(false)
    if (currentOperatingItem) {
      const itemId = currentOperatingItem.gid || currentOperatingItem.id || currentOperatingItem.name
      if (dialogType === 'add') {
        setLeadStatus(prev => ({ ...prev, [itemId]: false })) // false 表示已加入线索，不显示"加入线索"按钮
        clueCreateAPI({ unifiedSocialCreditCodes: currentOperatingItem.creditCode }, res => {
          if (res.success) {
            Taro.showToast({
              title: '已添加线索',
              icon: 'none',
              duration: 500
            })
          }
        })
      } else {
        setLeadStatus(prev => ({ ...prev, [itemId]: true })) // true 表示未加入线索，显示"加入线索"按钮
        clueDeleteAPI({ unifiedSocialCreditCode: currentOperatingItem.creditCode }, res => {
          if (res.success) {
            Taro.showToast({
              title: '已移除线索',
              icon: 'none',
              duration: 500
            })
          }
        })
      }
      return
    }
    setCurrentOperatingItem(null)
  }

  // 处理取消弹窗
  const handleDialogCancel = () => {
    setShowCustomDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  // 企业详情
  const handleEnterpriseDetail = (item: any) => {
    Taro.navigateTo({
      url: '/subpackages/company/enterpriseDetail/index?company=' + JSON.stringify(item)
    })
  }

  // ==================== 恢复操作处理函数 ====================
  // 处理恢复确认
  const handleRestoreConfirm = () => {
    setShowRestoreDialog(false)
    setIsShowInvalid(false)
    setIsDisliked(false)
    Taro.showToast({
      title: '已恢复',
      icon: 'none',
      duration: 500
    })
  }

  function openPhone(val: any) {
    setIsShowPhone(true)
    setPhoneInfo(val?.contactInfo?.phones)
    setEmails(val.contactInfo.emails)
  }

  const handleAiResearchReport = (company: any) => {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  // 处理恢复取消
  const handleRestoreCancel = () => {
    setShowRestoreDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 反馈处理函数 ====================
  // 处理反馈内容变化
  const changeTextArea = useCallback((value: string) => {
    setFeedBackValue(value)
  }, [])

  // 处理提交反馈
  const handleSubmitFeedback = () => {
    setIsShowFeedback(false)
    setIsDisliked(!isDisliked)
    setFeedBackValue('')
    Taro.showToast({
      title: '提交成功',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 数据加载函数 ====================
  // 自定义加载更多数据
  const customLoadMore = async () => {
    await sleep(10000)
    setCustomList([...customList, {}, {}, {}, {}, {}, {}, {}, {}, {}])
    setCustomHasMore(false)
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
      {/* 自定义弹窗 */}
      <CustomDialog visible={showCustomDialog} title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : '您确定要将该线索移除线索池吗？'} content={dialogType === 'add' ? '标记后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'} onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />

      {/* 恢复弹窗 */}
      <CustomDialog visible={showRestoreDialog} title="您确定要恢复该线索吗？" content="恢复后该线索可以重新选择匹配与不匹配" onConfirm={handleRestoreConfirm} onCancel={handleRestoreCancel} />

      {/* 无效线索原因 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowInvalid} onClose={() => setIsShowInvalid(false)}>
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image onClick={() => setIsShowInvalid(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="invalid_content">不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

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
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
          </Cell.Group>
        </View>
      </Popup>

      {/* 反馈 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowFeedback} onClose={() => setIsShowFeedback(false)}>
        <View className="popup_header">
          <View className="popup_header_title" style={{ fontSize: '40rpx', color: '#333333', textAlign: 'left', paddingLeft: '24rpx' }}>
            反馈-不匹配/不合适
          </View>
          <Image onClick={() => setIsShowFeedback(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="feedBack_content">
          <Checkbox.Group defaultValue={['1']} style={{ width: '100%', padding: '24rpx', boxSizing: 'border-box' }}>
            <Checkbox value="1" label="产品不匹配" />
            <Checkbox value="2" label="公司与信息匹配不上" />
            <Checkbox value="3" label="公司类型错误" />
            <Checkbox value="4" label="贸易公司" />
            <Checkbox value="5" label="公司经营问题" />
          </Checkbox.Group>
          <View className="feedBack_content_footer">
            <View className="feedBack_content_footer_text">其他原因（选填）</View>
            <View className="feedBack_content_footer_input">
              <TextArea cursorSpacing={100} value={feedBackValue} onChange={changeTextArea} placeholder="请输入备注" autoSize maxLength={500} showCount={false} adjustPosition={true} />
            </View>
          </View>
          <View className="feedBack_content_footer_text">您的反馈有助于我们改进数据更精准</View>
          <View className="feedBack_content_footer_bottom">
            <View className="feedBack_cancel" onClick={() => setIsShowFeedback(false)}>
              取消
            </View>
            <View className="feedBack_submit" onClick={() => handleSubmitFeedback()}>
              提交反馈
            </View>
          </View>
        </View>
      </Popup>

      {/* 头部搜索区域 */}
      <View className="headerSearch">
        <SearchBar placeholder="搜企业、搜索内容" value={searchValue} onChange={setSearchValue} onSearch={handleSearch} />
      </View>

      {/* 筛选内容区域 */}
      <View className="enterpriseContent">
        <InfiniteLoading
          target="enterpriseContent"
          loadingText={
            <>
              <View className="loadingText">
                <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="loadingImg" />
                <Text className="loading-char">l</Text>
                <Text className="loading-char">o</Text>
                <Text className="loading-char">a</Text>
                <Text className="loading-char">d</Text>
                <Text className="loading-char">i</Text>
                <Text className="loading-char">n</Text>
                <Text className="loading-char">g</Text>
                <Text className="loading-char">.</Text>
                <Text className="loading-char">.</Text>
                <Text className="loading-char">.</Text>
              </View>
            </>
          }
          loadMoreText="没有啦～"
          hasMore={customHasMore}
          onLoadMore={customLoadMore}
        >
          {filteredCustomList.map((item: any, index: number) => (
            <View key={index} onClick={() => handleEnterpriseDetail(item)}>
              <View className="enterpriseContent_item">
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
                      <View className="match">匹配{item.score}%</View>
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
                  <View className="enterpriseContent_item_info_item">{item.legalPerson}</View>
                  <View className="enterpriseContent_item_info_item">{item.regCapital}</View>
                  <View className="enterpriseContent_item_info_item">{item.establishTime}</View>
                  <View className="enterpriseContent_item_info_item">{item.handleLocation}</View>
                </View>
                <View className="enterpriseContent_item_product">
                  <View className={`enterpriseContent_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword(item.businessScope, searchValue || item.orgType)}</View>
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
                  <View className="enterpriseContent_item_contact_item">
                    <Image onClick={() => handleAiResearchReport(item)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise5.png" className="enterpriseContent_item_contact_item_img" />
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
                <View className="enterpriseContent_item_bottom">
                  <View className="enterpriseContent_item_bottom_left">
                    {!isDisliked && (
                      <View onClick={handleLike} className={`enterpriseContent_item_bottom_left_good ${isLiked ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
                        <Image src={!isLiked ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise8.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png'} className="enterpriseContent_item_bottom_left_good_img" />
                        <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
                      </View>
                    )}
                    {!isLiked && (
                      <View onClick={handleDislike} className={`enterpriseContent_item_bottom_left_bad ${isDisliked ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
                        <Image src={!isDisliked ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise9.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png'} className="enterpriseContent_item_bottom_left_bad_img" />
                        <Text className="enterpriseContent_item_bottom_left_bad_text">无效线索</Text>
                        {isDisliked && <ArrowDown color="#8E8E8E" style={{ width: '28rpx', height: '28rpx', marginLeft: '6rpx' }} />}
                      </View>
                    )}
                  </View>
                  {/* 获取当前线索的状态，默认为 true（显示加入线索按钮） */}
                  {leadStatus[item.gid || item.id || item.name] !== false ? (
                    <View onClick={e => handleAddToLeads(e, item)} className="enterpriseContent_item_bottom_right">
                      <Add color="#fff" style={{ marginRight: '12rpx', width: '32rpx', height: '32rpx' }} />
                      <Text className="enterpriseContent_item_bottom_right_add_text">加入线索</Text>
                    </View>
                  ) : (
                    <View onClick={e => handleRemoveFromLeads(e, item)} className="remove">
                      <Text className="remove_text">移除</Text>
                      <View className="remove_icon"></View>
                    </View>
                  )}
                </View>
              </View>
              <View className="enterpriseContent_divider" />
            </View>
          ))}
        </InfiniteLoading>
      </View>
    </View>
  )
}

export default Index
