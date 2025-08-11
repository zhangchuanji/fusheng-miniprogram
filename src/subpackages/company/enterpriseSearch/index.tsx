// ==================== 依赖导入区域 ====================
// React核心依赖
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
// UI组件库导入
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
// Taro框架组件
import { View, Image, Text } from '@tarojs/components'
// 图标组件
import { Add, ArrowDown, Checked } from '@nutui/icons-react-taro'
// Taro核心功能
import Taro from '@tarojs/taro'
// 样式文件
import './index.scss'
// 自定义组件
import CustomDialog from '@/components/CustomDialog'
// API接口
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'
import { companyFeedbackCreateAPI } from '@/api/company'
// 自定义Hooks
import { useAppSelector } from '@/hooks/useAppStore'
import ContactPopup from '@/components/ContactPopup'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [searchValue, setSearchValue] = useState('') // 搜索关键词
  const [messageId, setMessageId] = useState('') // 搜索关键词
  const [matchHighest, setMatchHighest] = useState(false) // 匹配最高开关
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度
  const [bottomHeight, setBottomHeight] = useState(0) // 底部高度

  // ==================== 列表数据状态 ====================
  const [customHasMore, setCustomHasMore] = useState(true) // 是否还有更多数据
  const [customList, setCustomList] = useState<any[]>([]) // 企业列表数据
  const [originalCustomList, setOriginalCustomList] = useState<any[]>([]) // 保存原始排序的企业列表数据
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他
  const [total, setTotal] = useState(0) // 企业总数
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
    name: '行业'
  }) // 当前选中的行业信息

  // ==================== 地区选择相关状态 ====================
  const [isShowRegion, setIsShowRegion] = useState(false) // 地区选择弹窗
  const regionPopupRef = useRef(null) // 地区选择弹窗ref
  const [regionPopupHeight, setRegionPopupHeight] = useState(0) // 地区选择弹窗高度
  const [checked, setChecked] = useState(['1']) // 地区选择弹窗高度
  const [selectedRegion, setSelectedRegion] = useState({
    province: '',
    city: '',
    fullName: '地区'
  }) // 当前选中的地区信息
  const [regionList, setRegionList] = useState<any>([]) // 地区列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowActionSheet, setIsShowActionSheet] = useState(false) // 行业选择弹窗
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗
  const [creditCodes, setCreditCodes] = useState('') // 拼接的creditCode字符串
  const [itemInfo, setItemInfo] = useState<any>({})

  // ==================== 线索操作状态 ====================
  const [leadStatus, setLeadStatus] = useState<{ [key: string]: boolean }>({}) // 每条线索的状态管理
  const [currentOperatingItem, setCurrentOperatingItem] = useState<any>(null) // 当前操作的线索项
  const [dialogType, setDialogType] = useState<'add' | 'remove' | 'batchAdd'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

  // ==================== 标签页相关状态 ====================
  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页

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

  // 格式化企业信息数据
  const formatInfo = (val: any) => {
    // 创建深拷贝以避免修改只读对象
    const newVal = JSON.parse(JSON.stringify(val))
    let companyList = [...newVal.companyList]
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
    newVal.companyList = res
    return newVal
  }

  // 数组随机打乱函数
  function shuffleArray(customList: any[]): React.SetStateAction<any[]> {
    const shuffled = [...customList]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // ==================== 事件监听和生命周期 ====================
  // 添加事件监听来接收复杂数据
  useEffect(() => {
    const handleEnterpriseSearchData = (res: any) => {
      setCustomList(formatInfo(res).companyList)
      setTotal(res.total)
      setMessageId(res.messageId)
    }

    Taro.eventCenter.on('enterpriseSearchData', handleEnterpriseSearchData)

    return () => {
      Taro.eventCenter.off('enterpriseSearchData', handleEnterpriseSearchData)
    }
  }, [])

  Taro.useUnload(() => {
    Taro.eventCenter.trigger('enterpriseSearchDataEdit', {
      companyList: customList,
      total: total,
      messageId: messageId
    })
  })

  // 监听企业详情页面卸载事件
  useEffect(() => {
    const handleEnterpriseDetailUnload = (res: any) => {
      setCustomList((prevList: any[]) => {
        return prevList.map((item: any) => {
          if (item.creditCode === res.creditCode) {
            return {
              ...item,
              hasFeedback: res.hasFeedback,
              isCollect: res.isCollect,
              commentContent: res.commentContent
            }
          }
          return item
        })
      })
    }
    Taro.eventCenter.on('enterpriseDetailUnload', handleEnterpriseDetailUnload)

    return () => {
      Taro.eventCenter.off('enterpriseDetailUnload', handleEnterpriseDetailUnload)
    }
  })

  // 监听全选状态变化
  useEffect(() => {
    if (isAllSelected) {
      // 提取customList中的所有creditCode并用逗号拼接
      const creditCodes = customList
        .filter(item => item.creditCode) // 过滤出有creditCode的项目
        .map(item => item.creditCode)
        .join(',') // 用逗号拼接成字符串

      setCreditCodes(creditCodes)
    }
  }, [isAllSelected, customList])

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

  // ==================== 基础操作函数 ====================
  // 打开联系人弹窗
  function openPhone(val: any) {
    setIsShowPhone(true)
    setPhoneInfo(val.contactInfo?.phones)
    setEmails(val.contactInfo.emails)
  }

  // 打开地址弹窗
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

  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 0) {
      if (matchHighest) {
        // 当前是打乱状态，恢复到原始排序
        setCustomList([...originalCustomList])
      } else {
        // 当前是原始状态，保存原始数据并打乱
        if (originalCustomList.length === 0) {
          setOriginalCustomList([...customList]) // 首次保存原始数据
        }
        setCustomList(shuffleArray(customList))
      }
      setMatchHighest(!matchHighest)
    }
    if (index === 1) {
      Taro.showToast({
        title: '暂未开放',
        icon: 'none'
      })
      // setIsShowActionSheet(true)
    }
    if (index === 2) {
      Taro.showToast({
        title: '暂未开放',
        icon: 'none'
      })
      // setIsShowRegion(true) // 打开地区选择弹窗
    }
    if (index === 3) {
    }
    if (index === 4) {
      setIsShowPhone(true)
    }
  }

  // 处理搜索页跳转
  const toSearchPage = () => {
    Taro.navigateTo({
      url: '/subpackages/company/searchEnterprise/index?customList=' + JSON.stringify(customList)
    })
  }

  // 处理高级筛选
  const toAdvancedFilter = () => {
    Taro.showToast({
      title: '暂未开放',
      icon: 'none'
    })
    // Taro.navigateTo({
    //   url: '/subpackages/company/advancedFilter/index'
    // })
  }

  // 企业详情
  const handleEnterpriseDetail = (item: any) => {
    Taro.navigateTo({
      url: '/subpackages/company/enterpriseDetail/index?company=' + JSON.stringify(item)
    })
  }

  // AI研究报告
  const handleAiResearchReport = (company: any) => {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  // ==================== 地区选择处理函数 ====================
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
      }
    })
    query.exec()
  }

  // 处理搜索
  const handleSearch = () => {}

  // ==================== 点赞点踩处理函数 ====================
  // 处理点赞点击
  const handleLike = (e: any, val: any) => {
    e.stopPropagation()

    const newFeedbackStatus = val.hasFeedback === 0 ? 1 : 0

    companyFeedbackCreateAPI(
      {
        creditCode: val.creditCode,
        isLiked: newFeedbackStatus,
        commentContent: '有效'
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: newFeedbackStatus === 1 ? '点赞成功' : '取消点赞',
            icon: 'success',
            duration: 500
          })

          setCustomList(prevList =>
            prevList.map(item => {
              if (item.creditCode === val.creditCode) {
                return {
                  ...item,
                  hasFeedback: newFeedbackStatus
                }
              }
              return item
            })
          )

          // 触发心跳动画（仅在点赞时）
          if (newFeedbackStatus === 1) {
            setShowHeartbeat(true)
            setTimeout(() => {
              setShowHeartbeat(false)
            }, 600)
          }
        } else {
          Taro.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    )
  }

  // 处理点踩点击
  const handleDislike = (e: any, item: any) => {
    setItemInfo(item)
    e.stopPropagation()

    // 触发抖动动画
    setShowShake(true)
    setTimeout(() => {
      setShowShake(false)
    }, 500)

    // 如果已经是点踩状态，显示无效原因
    if (item.hasFeedback === 2) {
      setIsShowInvalid(true)
    } else {
      // 否则显示反馈弹窗
      setIsShowFeedback(true)
    }
  }

  // 处理提交反馈
  const handleSubmitFeedback = () => {
    if (!itemInfo?.creditCode) {
      Taro.showToast({
        title: '企业信息错误',
        icon: 'none',
        duration: 1000
      })
      return
    }

    companyFeedbackCreateAPI(
      {
        creditCode: itemInfo.creditCode,
        isLiked: 2,
        feedbackType: parseInt(checked[0]),
        commentContent: feedBackValue || '不符合我的业务'
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 500
          })

          setCustomList(prevList =>
            prevList.map(item => {
              if (item.creditCode === itemInfo.creditCode) {
                return {
                  ...item,
                  hasFeedback: 2,
                  commentContent: feedBackValue || '不符合我的业务'
                }
              }
              return item
            })
          )

          // 重置状态
          setFeedBackValue('')
          setIsShowFeedback(false)
          setItemInfo({})
        } else {
          Taro.showToast({
            title: res.data.msg || '提交失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    )
  }

  // ==================== 线索操作处理函数 ====================
  // 处理加入线索点击
  const handleAddToLeads = (e: any, item: any) => {
    e.stopPropagation()
    setDialogType('add')
    setShowCustomDialog(true)
    setCurrentOperatingItem(item)
  }

  // 处理批量加入线索点击
  const handleBatchAddToLeads = (e: any) => {
    if (!isAllSelected) {
      Taro.showToast({
        title: '请先点击全选',
        icon: 'none',
        duration: 500
      })
      return
    }

    e.stopPropagation()
    setDialogType('batchAdd')
    setShowCustomDialog(true)
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
        // 添加线索
        setLeadStatus(prev => ({ ...prev, [itemId]: false }))
        clueCreateAPI({ unifiedSocialCreditCodes: currentOperatingItem.creditCode }, res => {
          if (res.success) {
            setCustomList(prevList => {
              const newList = [...prevList]
              const targetIndex = newList.findIndex(item => item.creditCode === currentOperatingItem.creditCode)
              if (targetIndex !== -1) {
                newList[targetIndex] = {
                  ...newList[targetIndex],
                  isJoinClue: true
                }
              }
              return newList
            })

            Taro.showToast({
              title: '已添加线索',
              icon: 'none',
              duration: 500
            })
          } else {
            // 失败时恢复状态
            setLeadStatus(prev => ({ ...prev, [itemId]: true }))
            Taro.showToast({
              title: res.data.msg || '添加失败',
              icon: 'none',
              duration: 1000
            })
          }
        })
      } else if (dialogType === 'remove') {
        // 移除线索
        setLeadStatus(prev => ({ ...prev, [itemId]: true }))
        clueDeleteAPI({ unifiedSocialCreditCode: currentOperatingItem.creditCode }, res => {
          if (res.success) {
            setCustomList(prevList =>
              prevList.map(item => {
                if (item.creditCode === currentOperatingItem.creditCode) {
                  return {
                    ...item,
                    isJoinClue: false
                  }
                }
                return item
              })
            )

            Taro.showToast({
              title: '已移除线索',
              icon: 'none',
              duration: 500
            })
          } else {
            // 失败时恢复状态
            setLeadStatus(prev => ({ ...prev, [itemId]: false }))
            Taro.showToast({
              title: res.data.msg || '移除失败',
              icon: 'none',
              duration: 1000
            })
          }
        })
      }
    } else if (dialogType === 'batchAdd') {
      // 批量添加线索
      if (!creditCodes) {
        Taro.showToast({
          title: '没有可添加的企业',
          icon: 'none',
          duration: 1000
        })
        return
      }

      setLeadStatus(prev => {
        const updatedStatus = { ...prev }
        customList.forEach(item => {
          const itemId = item.gid || item.id || item.name
          updatedStatus[itemId] = false
        })
        return updatedStatus
      })

      clueCreateAPI({ unifiedSocialCreditCodes: creditCodes }, res => {
        if (res.success) {
          setCustomList(prevList =>
            prevList.map(item => ({
              ...item,
              isJoinClue: true
            }))
          )

          Taro.showToast({
            title: '批量添加成功',
            icon: 'none',
            duration: 500
          })
        } else {
          // 失败时恢复状态
          setLeadStatus(prev => {
            const updatedStatus = { ...prev }
            customList.forEach(item => {
              const itemId = item.gid || item.id || item.name
              updatedStatus[itemId] = true
            })
            return updatedStatus
          })

          Taro.showToast({
            title: res.data.msg || '批量添加失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
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

  // ==================== 恢复操作处理函数 ====================
  // 处理恢复确认
  const handleRestoreConfirm = () => {
    companyFeedbackCreateAPI(
      {
        creditCode: itemInfo?.creditCode || '',
        isLiked: 0,
        commentContent: ''
      },
      res => {
        if (res.success) {
          setShowRestoreDialog(false)
          setIsShowInvalid(false)
          Taro.showToast({
            title: '恢复成功',
            icon: 'none',
            duration: 500
          })
          setCustomList(prevList =>
            prevList.map(item => {
              if (item.creditCode === itemInfo.creditCode) {
                return {
                  ...item,
                  hasFeedback: 0,
                  commentContent: ''
                }
              }
              return item
            })
          )
        }
      }
    )
  }

  // 处理恢复取消
  const handleRestoreCancel = () => {
    setShowRestoreDialog(false)
  }

  // ==================== 反馈处理函数 ====================
  // 处理反馈内容变化
  const changeTextArea = useCallback((value: string) => {
    setFeedBackValue(value)
  }, [])

  // 处理反馈选项变化
  const CheckedChange = (e: any) => {
    const value = e?.detail?.value || e
    setChecked(value)
  }

  // ==================== 数据加载函数 ====================
  // 自定义加载更多数据
  const customLoadMore = async () => {
    await sleep(10000)
    // setCustomList([...customList])
    setCustomHasMore(false)
  }

  // ==================== 组件渲染区域 ====================
  return (
    <View className="enterprisePage">
      {/* ==================== 弹窗组件区域 ==================== */}
      {/* 自定义弹窗 */}
      <CustomDialog visible={showCustomDialog} title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : dialogType === 'batchAdd' ? '您确定要批量添加线索吗？' : '您确定要将该线索移除线索池吗？'} content={dialogType === 'add' ? '标记后会自动转入线索池哦～' : dialogType === 'batchAdd' ? '批量添加后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'} onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />

      {/* 恢复弹窗 */}
      <CustomDialog visible={showRestoreDialog} title="您确定要恢复该线索吗？" content="恢复后该线索可以重新选择匹配与不匹配" onConfirm={handleRestoreConfirm} onCancel={handleRestoreCancel} />

      {/* 行业前10选择弹窗 */}
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

      {/* 无效线索原因弹窗 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowInvalid} onClose={() => setIsShowInvalid(false)}>
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image onClick={() => setIsShowInvalid(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="invalid_content">{itemInfo.commentContent || '与我的业务无关'}</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

      {/* 联系人信息弹窗 */}
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

      {/* 工厂地址弹窗 */}
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

      {/* 反馈弹窗 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowFeedback} onClose={() => setIsShowFeedback(false)}>
        <View className="popup_header">
          <View className="popup_header_title" style={{ fontSize: '40rpx', color: '#333333', textAlign: 'left', paddingLeft: '24rpx' }}>
            反馈-不匹配/不合适
          </View>
          <Image onClick={() => setIsShowFeedback(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="feedBack_content">
          <Checkbox.Group defaultValue={['1']} value={checked} style={{ width: '100%', padding: '24rpx', boxSizing: 'border-box' }} onChange={CheckedChange}>
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

      {/* 地区选择弹窗 */}
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

      {/* ==================== 主要内容区域 ==================== */}
      {/* 头部搜索区域 */}
      <View className="headerSearch">
        <View className="headerSearch_Item_box">
          <View onClick={() => handleActiveIndex(0)} className={`headerSearch_Item ${matchHighest ? 'headerSearch_Item_active' : ''}`}>
            匹配最高
          </View>
          <View onClick={() => handleActiveIndex(1)} className="headerSearch_Item" style={{ justifyContent: 'space-between', padding: '12rpx' }}>
            <View className="headerSearch_Item_text">
              <View className="headerSearch_Item_text_text" style={{ color: '#8D8D8D' }}>
                {sheetIndex.name}
              </View>
              <View className="arrow-down" />
            </View>
          </View>
          <View onClick={() => handleActiveIndex(2)} className="headerSearch_Item" style={{ justifyContent: 'space-between', padding: '12rpx' }}>
            <View className="headerSearch_Item_text">
              <View className="headerSearch_Item_text_text" style={{ color: '#8D8D8D' }}>
                {selectedRegion.fullName}
              </View>
              <View className="arrow-down" />
            </View>
          </View>
          <View onClick={toAdvancedFilter} className="headerSearch_Item" style={{ color: '#8D8D8D' }}>
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
          {/* 企业列表渲染 */}
          {customList.map((item, index) => (
            <View key={item.creditCode || item.id || `${item.companyName}-${index}`} onClick={() => handleEnterpriseDetail(item)}>
              <View className="enterpriseContent_item">
                {/* 企业基本信息 */}
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
                      {item.score && <View className="match">匹配{item.score}%</View>}
                    </View>
                  </View>
                </View>

                {/* 企业标签 */}
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

                {/* 企业详细信息 */}
                <View className="enterpriseContent_item_info">
                  <View className="enterpriseContent_item_info_item">{item.legalPerson}</View>
                  <View className="enterpriseContent_item_info_item">{item.regCapital}</View>
                  <View className="enterpriseContent_item_info_item">{item.establishTime}</View>
                  <View className="enterpriseContent_item_info_item">{item.handleLocation}</View>
                </View>

                {/* 企业产品信息 */}
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

                {/* 企业联系方式 */}
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
                    电话({item.contactInfo?.phones.length || 0})
                  </View>
                  <View
                    onClick={e => {
                      e.stopPropagation()
                      openAddress(item)
                    }}
                    className="enterpriseContent_item_contact_item"
                  >
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise2.png" className="enterpriseContent_item_contact_item_img" />
                    地址({item?.regLocation ? 1 : 0 || 0})
                  </View>
                </View>

                {/* 企业操作按钮 */}
                <View className="enterpriseContent_item_bottom">
                  <View className="enterpriseContent_item_bottom_left">
                    {/* 点赞按钮 */}
                    {(item.hasFeedback === 0 || item.hasFeedback === 1) && (
                      <View onClick={e => handleLike(e, item)} className={`enterpriseContent_item_bottom_left_good ${item.hasFeedback === 1 ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
                        <Image src={item.hasFeedback === 1 ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise8.png'} className="enterpriseContent_item_bottom_left_good_img" />
                        <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
                      </View>
                    )}
                    {/* 点踩按钮 */}
                    {(item.hasFeedback === 0 || item.hasFeedback === 2) && (
                      <View onClick={e => handleDislike(e, item)} className={`enterpriseContent_item_bottom_left_bad ${item.hasFeedback === 2 ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
                        <Image src={item.hasFeedback === 2 ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise9.png'} className="enterpriseContent_item_bottom_left_bad_img" />
                        <Text className="enterpriseContent_item_bottom_left_bad_text">无效线索</Text>
                        {item.hasFeedback === 2 && <ArrowDown color="#8E8E8E" style={{ width: '28rpx', height: '28rpx', marginLeft: '6rpx' }} />}
                      </View>
                    )}
                  </View>
                  {/* 线索操作按钮 */}
                  {!item.isJoinClue ? (
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
            label={`全选 (${isAllSelected ? customList.length : 0})`}
          />
        </View>
        <View onClick={handleBatchAddToLeads} style={{ background: isAllSelected ? '#2156FE' : '#9CB4FF' }} className="enterpriseBottom_right">
          批量加入线索
        </View>
      </View>
    </View>
  )
}

// ==================== 组件导出 ====================
export default Index
