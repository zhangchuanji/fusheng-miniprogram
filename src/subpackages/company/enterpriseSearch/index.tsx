import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown, Checked } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'
import { useAppSelector } from '@/hooks/useAppStore'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [searchValue, setSearchValue] = useState('') // 搜索关键词
  const [matchHighest, setMatchHighest] = useState(false) // 匹配最高开关
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度
  const [bottomHeight, setBottomHeight] = useState(0) // 底部高度

  // ==================== 列表数据状态 ====================
  const [customHasMore, setCustomHasMore] = useState(true) // 是否还有更多数据
  const [customList, setCustomList] = useState<any[]>([]) // 企业列表数据
  const [total, setTotal] = useState(0) // 企业列表数据
  const companyInfo = Taro.getStorageSync('companyInfo') || {}
  const userInfo = useAppSelector(state => state.login.userInfo)

  // ==================== 筛选器相关状态 ====================
  const [sheetList, setSheetList] = useState<any[]>([
    { id: 1, name: '行业前10' },
    { id: 2, name: '行业前20' },
    { id: 3, name: '行业前50' },
    { id: 4, name: '行业前100' }
  ]) // 行业筛选选项列表
  const [selectedId, setSelectedId] = useState(sheetList[0]?.id || 1) // 选中的行业ID
  const [sheetIndex, setSheetIndex] = useState({
    id: 1,
    name: '行业前10'
  }) // 当前选中的行业信息

  // ==================== 地区选择相关状态 ====================
  const [isShowRegion, setIsShowRegion] = useState(false) // 地区选择弹窗
  const regionPopupRef = useRef(null) // 地区选择弹窗ref
  const [regionPopupHeight, setRegionPopupHeight] = useState(0) // 地区选择弹窗高度
  const [selectedRegion, setSelectedRegion] = useState({
    province: '浙江省',
    city: '杭州市',
    fullName: '浙江省 杭州市'
  }) // 当前选中的地区信息
  const [regionList, setRegionList] = useState([
    {
      province: '浙江省',
      cities: [
        { name: '杭州市', selected: true },
        { name: '宁波市', selected: false },
        { name: '温州市', selected: false },
        { name: '嘉兴市', selected: false },
        { name: '湖州市', selected: false },
        { name: '绍兴市', selected: false },
        { name: '金华市', selected: false },
        { name: '衢州市', selected: false },
        { name: '舟山市', selected: false },
        { name: '台州市', selected: false },
        { name: '丽水市', selected: false }
      ]
    },
    {
      province: '江苏省',
      cities: [
        { name: '南京市', selected: false },
        { name: '无锡市', selected: false },
        { name: '徐州市', selected: false },
        { name: '常州市', selected: false },
        { name: '苏州市', selected: false },
        { name: '南通市', selected: false },
        { name: '连云港市', selected: false },
        { name: '淮安市', selected: false },
        { name: '盐城市', selected: false },
        { name: '扬州市', selected: false },
        { name: '镇江市', selected: false },
        { name: '泰州市', selected: false },
        { name: '宿迁市', selected: false }
      ]
    },
    {
      province: '广东省',
      cities: [
        { name: '广州市', selected: false },
        { name: '深圳市', selected: false },
        { name: '珠海市', selected: false },
        { name: '汕头市', selected: false },
        { name: '佛山市', selected: false },
        { name: '韶关市', selected: false },
        { name: '湛江市', selected: false },
        { name: '肇庆市', selected: false },
        { name: '江门市', selected: false },
        { name: '茂名市', selected: false },
        { name: '惠州市', selected: false },
        { name: '梅州市', selected: false },
        { name: '汕尾市', selected: false },
        { name: '河源市', selected: false },
        { name: '阳江市', selected: false },
        { name: '清远市', selected: false },
        { name: '东莞市', selected: false },
        { name: '中山市', selected: false },
        { name: '潮州市', selected: false },
        { name: '揭阳市', selected: false },
        { name: '云浮市', selected: false }
      ]
    }
  ]) // 地区列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowActionSheet, setIsShowActionSheet] = useState(false) // 行业选择弹窗
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗

  // ==================== 线索操作状态 ====================
  const [leadStatus, setLeadStatus] = useState<{ [key: string]: boolean }>({}) // 每条线索的状态管理
  const [currentOperatingItem, setCurrentOperatingItem] = useState<any>(null) // 当前操作的线索项
  const [dialogType, setDialogType] = useState<'add' | 'remove'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [isLiked, setIsLiked] = useState(false) // 是否已点赞
  const [isDisliked, setIsDisliked] = useState(false) // 是否已点踩
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

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

  // ==================== 反馈相关状态 ====================
  const [feedBackValue, setFeedBackValue] = useState('') // 反馈内容

  // ==================== 全选状态 ====================
  const [isAllSelected, setIsAllSelected] = useState(false) // 全选状态

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

  useLoad(options => {
    let res = JSON.parse(options.res)
    const list = res.companyList.map((item: any) => {
      // 获取省份信息
      // 获取省份信息（处理连续字符串格式）
      let locationStr = item.province || item.address || item.location || '未知省份'

      // 从连续字符串中提取省份
      if (locationStr.includes('省')) {
        item.location = locationStr.split('省')[0] + '省'
      } else if (locationStr.includes('市')) {
        // 处理直辖市情况（北京市、上海市、天津市、重庆市）
        const directMunicipalities = ['北京', '上海', '天津', '重庆']
        const found = directMunicipalities.find(city => locationStr.includes(city))
        item.location = found ? found + '市' : locationStr.split('市')[0] + '市'
      } else if (locationStr.includes('自治区')) {
        item.location = locationStr.split('自治区')[0] + '自治区'
      } else {
        item.location = '未知省份'
      }

      // 处理评分（去除小数点）
      if (item.score && typeof item.score === 'number') {
        item.score = Math.floor(item.score)
      } else if (item.score && typeof item.score === 'string') {
        let scoreNumber = parseFloat(item.score)
        item.score = isNaN(scoreNumber) ? 0 : Math.floor(scoreNumber)
      }

      // 处理tags字段
      item.tags = Array.isArray(item.tags) ? item.tags.filter((tag: any) => tag !== '曾用名') : []

      return item
    })
    setCustomList(list)
    setTotal(res.total)
  })

  // ==================== 事件处理函数 ====================
  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 0) {
      setMatchHighest(!matchHighest)
    }
    if (index === 1) {
      setIsShowActionSheet(true)
    }
    if (index === 2) {
      setIsShowRegion(true) // 打开地区选择弹窗
    }
    if (index === 3) {
    }
    if (index === 4) {
      setIsShowPhone(true)
    }
    if (index === 5) {
      setIsShowAddress(true)
    }
  }

  const handleAiResearchReport = (company: any) => {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  // 处理搜索页跳转
  const toSearchPage = () => {
    Taro.navigateTo({
      url: '/subpackages/company/searchEnterprise/index'
    })
  }

  // 处理高级筛选
  const toAdvancedFilter = () => {
    Taro.navigateTo({
      url: '/subpackages/company/advancedFilter/index'
    })
  }

  // 企业详情
  const handleEnterpriseDetail = (item: any) => {
    Taro.navigateTo({
      url: '/subpackages/company/enterpriseDetail/index?company=' + JSON.stringify(item)
    })
  }


  // 处理地区选择
  const handleRegionSelect = (province: string, city: string) => {
    // 检查当前城市是否已被选中
    const isCurrentlySelected = regionList.some(p => p.province === province && p.cities.some(c => c.name === city && c.selected))

    if (isCurrentlySelected) {
      // 如果已选中，则取消选中
      setSelectedRegion({
        province: '',
        city: '',
        fullName: '选择地区'
      })

      // 更新地区列表，取消选中状态
      setRegionList(prev =>
        prev.map(p => ({
          ...p,
          cities: p.cities.map(c => ({
            ...c,
            selected: false
          }))
        }))
      )
    } else {
      // 如果未选中，则选中当前城市
      setSelectedRegion({
        province,
        city,
        fullName: `${province} ${city}`
      })

      // 更新地区列表中的选中状态
      setRegionList(prev =>
        prev.map(p => ({
          ...p,
          cities: p.cities.map(c => ({
            ...c,
            selected: p.province === province && c.name === city
          }))
        }))
      )
    }
  }

  // 获取地区选择弹窗高度
  const getRegionPopupHeight = () => {
    const query = Taro.createSelectorQuery()
    query.select('.region-popup').boundingClientRect(rect => {
      if (rect && 'height' in rect) {
        setRegionPopupHeight(rect.height)
        console.log('地区选择弹窗高度:', rect.height)
      }
    })
    query.exec()
  }

  // 处理搜索
  const handleSearch = () => {
    console.log(searchValue)
  }

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
    e.stopPropagation()
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
        clueCreateAPI({ unifiedSocialCreditCode: currentOperatingItem.creditCode }, res => {
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

  // 处理批量加入线索
  const handleBatchAddToLeads = (e: any) => {
    if (!isAllSelected) {
      Taro.showToast({
        title: '请先选择要加入线索的线索',
        icon: 'none',
        duration: 1000
      })
      return
    }
    setDialogType('add')
    setShowCustomDialog(true)
    e.stopPropagation()
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
    // setCustomList([...customList])
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
    query.select('.enterpriseBottom').boundingClientRect(rect => {
      if (rect && 'height' in rect) {
        setBottomHeight(rect.height)
      }
    })
    query.exec()
  }, [])

  // 监听地区选择弹窗显示状态
  useEffect(() => {
    if (isShowRegion) {
      // 延迟获取弹窗高度，确保弹窗已经渲染
      setTimeout(() => {
        getRegionPopupHeight()
      }, 100)
    }
  }, [isShowRegion])

  return (
    <View className="enterprisePage">
      {/* 自定义弹窗 */}
      <CustomDialog visible={showCustomDialog} title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : '您确定要将该线索移除线索池吗？'} content={dialogType === 'add' ? '标记后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'} onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />

      {/* 恢复弹窗 */}
      <CustomDialog visible={showRestoreDialog} title="您确定要恢复该线索吗？" content="恢复后该线索可以重新选择匹配与不匹配" onConfirm={handleRestoreConfirm} onCancel={handleRestoreCancel} />

      {/* 行业前10 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowActionSheet} onClose={() => setIsShowActionSheet(false)}>
        <View className="popup_header">
          <View className="popup_header_title"></View>
          <Image onClick={() => setIsShowActionSheet(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="popup_content">
          <Radio.Group value={selectedId} onChange={setSelectedId} labelPosition="left" style={{ width: '100%' }}>
            {sheetList.map(item => (
              <Cell key={item.id} style={{ width: '100%', boxSizing: 'border-box' }}>
                <Radio icon={<Checked />} activeIcon={<Checked color="#426EFF" />} value={item.id} labelPosition="left" style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View className="actionSheet_content_item">{item.name}</View>
                </Radio>
              </Cell>
            ))}
          </Radio.Group>
          <Button fill="none" shape="round" style={{ width: '100%', height: '80rpx', marginTop: '20rpx', borderRadius: 'none' }} onClick={() => setIsShowActionSheet(false)}>
            取消
          </Button>
        </View>
      </Popup>

      {/* 无效线索原因 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowInvalid} onClose={() => setIsShowInvalid(false)}>
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image onClick={() => setIsShowInvalid(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="invalid_content">不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

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
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
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
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
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
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
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

      {/* 地区选择 */}
      <Popup className="region-popup" position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowRegion} onClose={() => setIsShowRegion(false)}>
        <View className="popup_header">
          <View className="popup_header_title">选择地区</View>
          <Image onClick={() => setIsShowRegion(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="region_content" style={{ height: `calc(${regionPopupHeight}px - 100rpx)`, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            style={{ height: `calc(${regionPopupHeight}px - 260rpx)` } as React.CSSProperties}
            autoHeight={false}
            onChange={(value: number) => {
              setTabValue(value)
            }}
            direction="vertical"
          >
            {regionList.map(item => (
              <Tabs.TabPane key={item.province} title={`${item.province}`}>
                <View className="region_content_item" style={{ height: '100%', overflow: 'auto', padding: '24rpx', boxSizing: 'border-box', paddingTop: '0' }}>
                  {item.cities.map(city => (
                    <Cell
                      key={city.name}
                      title={city.name}
                      onClick={() => handleRegionSelect(item.province, city.name)}
                      style={{
                        backgroundColor: city.selected ? '#426EFF' : '#fff',
                        color: city.selected ? '#fff' : '#333',
                        marginBottom: '8rpx',
                        borderRadius: '8rpx'
                      }}
                    />
                  ))}
                </View>
              </Tabs.TabPane>
            ))}
          </Tabs>
          <View className="region_content_footer">
            <View className="region_content_footer_cancel" onClick={() => setIsShowRegion(false)}>
              取消
            </View>
            <View className="region_content_footer_submit" onClick={() => setIsShowRegion(false)}>
              确定
            </View>
          </View>
        </View>
      </Popup>

      {/* 头部搜索区域 */}
      <View className="headerSearch">
        <View className="headerSearch_Item_box">
          <View onClick={() => handleActiveIndex(0)} className={`headerSearch_Item ${matchHighest ? 'headerSearch_Item_active' : ''}`}>
            匹配最高
          </View>
          <View onClick={() => handleActiveIndex(1)} className="headerSearch_Item" style={{ justifyContent: 'space-between', padding: '12rpx' }}>
            <View className="headerSearch_Item_text">
              <View className="headerSearch_Item_text_text">{sheetIndex.name}</View>
              <View className="arrow-down" />
            </View>
          </View>
          <View onClick={() => handleActiveIndex(2)} className="headerSearch_Item" style={{ justifyContent: 'space-between', padding: '12rpx' }}>
            <View className="headerSearch_Item_text">
              <View className="headerSearch_Item_text_text">{selectedRegion.fullName}</View>
              <View className="arrow-down" />
            </View>
          </View>
          <View onClick={toAdvancedFilter} className="headerSearch_Item">
            高级筛选
          </View>
        </View>
        <View onClick={() => handleActiveIndex(3)} className="searchContent">
          <View onClick={() => toSearchPage()}>
            <SearchBar disabled={true} placeholder="搜企业、搜索内容" value={searchValue} onChange={setSearchValue} onSearch={handleSearch} />
          </View>
          <View className="searchContent_right">
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="searchContent_right_img" />
            <View>共有{total}条搜索结果</View>
          </View>
        </View>
      </View>

      {/* 筛选内容区域 */}
      <View className="enterpriseContent" style={{ height: `calc(100vh - ${bottomHeight + headerHeight}px)` }}>
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
          {customList.map((item, index) => (
            <View key={index} onClick={() => handleEnterpriseDetail(item)}>
              <View className="enterpriseContent_item">
                <View className="enterpriseContent_item_top">
                  <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="enterpriseContent_item_Img" />
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
                  <View className="enterpriseContent_item_info_item">{item.location}</View>
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
                      handleActiveIndex(4)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise1.png" className="enterpriseContent_item_contact_item_img" />
                    电话(112)
                  </View>
                  <View
                    onClick={e => {
                      e.stopPropagation()
                      handleActiveIndex(5)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise2.png" className="enterpriseContent_item_contact_item_img" />
                    地址(2)
                  </View>
                </View>
                <View className="enterpriseContent_item_bottom">
                  <View className="enterpriseContent_item_bottom_left">
                    {!isDisliked && (
                      <View onClick={handleLike} className={`enterpriseContent_item_bottom_left_good ${isLiked ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png" className="enterpriseContent_item_bottom_left_good_img" />
                        <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
                      </View>
                    )}
                    {!isLiked && (
                      <View onClick={handleDislike} className={`enterpriseContent_item_bottom_left_bad ${isDisliked ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png" className="enterpriseContent_item_bottom_left_bad_img" />
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

      {/* 底部批量加入线索 */}
      <View className="enterpriseBottom">
        <View className="enterpriseBottom_left">
          <Checkbox
            value={isAllSelected ? '1' : '0'}
            onChange={(value: any) => {
              setIsAllSelected(value)
            }}
            label="全选"
          />
        </View>
        <View onClick={handleBatchAddToLeads} style={{ background: isAllSelected ? '#2156FE' : '#9CB4FF' }} className="enterpriseBottom_right">
          批量加入线索
        </View>
      </View>
    </View>
  )
}

export default Index
