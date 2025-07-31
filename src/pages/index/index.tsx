import React, { useEffect, useRef, useState } from 'react'
import { Dialog, Popup, Tabs } from '@nutui/nutui-react-taro'
import { View, Image, ScrollView } from '@tarojs/components'
import Taro, { nextTick } from '@tarojs/taro'
import './index.scss'
import { useExampleActions } from '@/hooks/useExampleActions'
import AiChat from './aiChat'
import CluePage from '../../subpackages/cluePage/index'
import { Setting, Star, TriangleDown, TriangleUp } from '@nutui/icons-react-taro'
import { aiSessionGetHistorySessionAPI, aiSessionListAPI, userFavoriteListAPI } from '@/api/chatMsg'
import { useAppSelector } from '@/hooks/useAppStore'
import AiMessageComponent from '@/components/AiMessageComponent'

function Index() {
  const userInfo = useAppSelector(state => state.login.userInfo)
  const { getExampleData, exampleData } = useExampleActions()
  const [capsuleInfo, setCapsuleInfo] = useState({ height: 32, statusBarHeight: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [showSetting, setShowSetting] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0 })
  const tabKeys = ['customer', 'clue']
  const [tabvalue, setTabvalue] = useState(0)
  const [companyShow, setCompanyShow] = useState(false)
  // 将单个展开状态改为对象，用于管理每个收藏项的展开状态
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({})
  const handleActiveIndex = idx => setActiveIndex(idx)
  const [historySession, setHistorySession] = useState<any[]>([])
  const [favoriteSession, setFavoriteSession] = useState<any[]>([]) // 收藏会话

  // 添加ref来调用子组件方法
  const aiChatRef = useRef<any>(null)

  useEffect(() => {
    // 获取胶囊按钮信息
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()

    if (!Taro.getStorageSync('companyInfo') || !Taro.getStorageSync('companyInfo').expansionDomainKeywords) {
      setCompanyShow(true)
    }

    Taro.eventCenter.on('companyShow', res => {
      setCompanyShow(res)
    })

    setCapsuleInfo({
      height: menuButtonInfo.height,
      statusBarHeight: systemInfo.statusBarHeight || 0
    })
  }, [])

  // 添加时间格式化函数
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const getSession = () => {
    aiSessionListAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        const convertedData = Object.entries(res.data).map(([name, list]) => ({
          name,
          list: list as any[]
        }))
        setHistorySession(convertedData)
      } else {
      }
    })
  }

  const getFavoriteList = () => {
    userFavoriteListAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        const favoriteList = res.data.map((item: any) => ({
          ...item,
          role: 'ai',
          apiStatus: {
            textComplete: true,
            companyComplete: true
          },
          content: item.contentSummary,
          companyList: JSON.parse(item.enterpriseInfo).companyList,
          splitNum: JSON.parse(item.enterpriseInfo).splitNum,
          total: JSON.parse(item.enterpriseInfo).total
        }))
        console.log(favoriteList)

        setFavoriteSession(favoriteList)
      } else {
      }
    })
  }

  useEffect(() => {
    getExampleData({
      pageNo: 1,
      pageSize: 10
    })
  }, [])

  // 当userInfo加载完成后调用getSession
  useEffect(() => {
    if (userInfo?.id) {
      getSession()
      getFavoriteList()
    }
  }, [userInfo])

  // 监听historySession的变化
  useEffect(() => {
    console.log('historySession changed:', historySession)
  }, [historySession])

  useEffect(() => {
    nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.homePage_title').boundingClientRect() // tab容器
      query.select(`.tab-item-${activeIndex}`).boundingClientRect() // 当前tab
      query.exec(res => {
        const containerRect = res[0]
        const tabRect = res[1]
        if (containerRect && tabRect) {
          setIndicatorStyle({
            left: tabRect.left,
            top: containerRect.height
          })
        }
      })
    })
  }, [activeIndex])

  const totalHeight = capsuleInfo.statusBarHeight + capsuleInfo.height + 8 // 8px 间距可根据需要调整

  const goHistoryFun = () => {
    setShowSetting(true)
  }

  const companyConfirm = () => {
    Taro.navigateTo({
      url: '/subpackages/login/companyProfile/index'
    })
    setCompanyShow(false)
  }

  const companyCancel = () => {
    setCompanyShow(false)
  }

  const goNew = () => {
    if (aiChatRef.current && aiChatRef.current.getAiSession) {
      aiChatRef.current.getAiSession()
    } else {
    }
  }

  // 修改展开收起函数，接收索引参数
  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getChatItem = (chatItem: any) => {
    aiSessionGetHistorySessionAPI({ id: chatItem.id }, res => {
      if (res.success && res.data) {
        Taro.eventCenter.trigger('getChatItem', res.data)
        Taro.setStorageSync('aiSessionId', chatItem.id)
        setShowSetting(false)
      }
    })
  }

  return (
    <View className="homePage">
      <View className="homePage_content" style={{ width: '100%', height: totalHeight, paddingTop: capsuleInfo.statusBarHeight }}>
        <Image src="http://36.141.100.123:10013/glks/assets/home/home1.png" className="homePage_history_img" onClick={goHistoryFun} />
        <Image src="http://36.141.100.123:10013/glks/assets/home/home2.png" className="homePage_new_img" onClick={goNew} />
        <View className="homePage_title">
          <View className={`homePage_text tab-item-0${activeIndex === 0 ? ' homePage_text_active' : ''}`} onClick={() => handleActiveIndex(0)}>
            AI获客
          </View>
          <View className={`homePage_text tab-item-1${activeIndex === 1 ? ' homePage_text_active' : ''}`} onClick={() => handleActiveIndex(1)}>
            线索池
          </View>
          <Image
            src="http://36.141.100.123:10013/glks/assets/home/home3.png"
            className="homePage_text_img"
            style={{
              position: 'absolute',
              left: `${indicatorStyle.left}px`
            }}
          />
        </View>
      </View>
      <Popup visible={showSetting} position="left" style={{ width: '84%', height: '100%' }} onClose={() => setShowSetting(false)}>
        <View className="setting_content">
          <View className="setting_content_title" onClick={() => Taro.navigateTo({ url: '/subpackages/setting/index' })}>
            <Image src={userInfo?.avatar || 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png'} className="title_img" />
            <View className="title_info">
              <View className="title_info_name">{userInfo?.nickname}</View>
              <View className="title_info_phone">{userInfo?.mobile}</View>
            </View>
            <View className="settingIcon">
              <Setting color="#333333" size={'32rpx'} />
            </View>
          </View>
          <View className="setting_content_list">
            <Tabs
              value={tabvalue}
              onChange={value => {
                setTabvalue(value as number)
              }}
            >
              <Tabs.TabPane title="问答记录">
                <ScrollView enhanced showScrollbar={false} scrollY className="scrollView">
                  {historySession &&
                    historySession.length > 0 &&
                    historySession.map(item => (
                      <View key={item.name}>
                        <View className="item-date">{item.name}</View>
                        {item.list &&
                          item.list.length > 0 &&
                          item.list.map((chatItem: any, index: number) => (
                            <View key={index} className="list-item" onClick={() => getChatItem(chatItem)}>
                              <View className="item-text">{chatItem.title}</View>
                            </View>
                          ))}
                      </View>
                    ))}
                </ScrollView>
              </Tabs.TabPane>
              <Tabs.TabPane title="我的收藏">
                <ScrollView enhanced showScrollbar={false} scrollY className="scrollView">
                  {favoriteSession &&
                    favoriteSession.length > 0 &&
                    favoriteSession.map((item: any, index: any) => {
                      const isExpanded = expandedItems[index] || false
                      return (
                        <View key={index}>
                          <View className="item-date" style={{ marginBottom: '52rpx' }}>
                            {formatTimestamp(item.createTime)}
                          </View>
                          <View className="list-item">
                            <View className="item-title">
                              <View className="item-title-text">
                                <Star color="#888596" size={'30rpx'} />
                                <View className="item-title-text-text">{item.title}</View>
                              </View>
                              <View className="item-title-des" onClick={() => toggleExpand(index)}>
                                <View className="item-title-des-text">{isExpanded ? '收起' : '展开'}</View>
                                <View style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                  <TriangleDown color="#8A93A2" size={'26rpx'} />
                                </View>
                              </View>
                            </View>
                            {/* 设置容器高度，收起时显示部分内容，展开时显示全部 */}
                            <View
                              className="ai-message-container"
                              style={{
                                height: isExpanded ? 'auto' : '80rpx', // 收起时固定高度200rpx
                                overflow: 'hidden',
                                transition: 'height 0.3s ease' // 添加过渡动画
                              }}
                            >
                              <AiMessageComponent msg={item} />
                            </View>
                            {/* 如果是收起状态，添加渐变遮罩效果 */}
                            {!isExpanded && (
                              <View
                                className="fade-mask"
                                style={{
                                  position: 'relative',
                                  height: '60rpx',
                                  marginTop: '-60rpx',
                                  background: 'linear-gradient(transparent, rgba(255,255,255,0.9))',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </View>
                        </View>
                      )
                    })}
                </ScrollView>
              </Tabs.TabPane>
            </Tabs>
          </View>
        </View>
      </Popup>
      <Dialog visible={companyShow} footer={null}>
        <View className="dialog_box">
          <View className="dialog_title">企业信息完善</View>
          <Image src="http://36.141.100.123:10013/glks/assets/chat/chat5.png" className="dialog_img" />
          <View className="dialog_content">发现您还未完善企业核心信息，补充后AI可挖掘更多优质线索</View>
          <View className="dialog_footer">
            <View className="dialog_footer_btn" onClick={companyCancel}>
              取消
            </View>
            <View className="dialog_footer_btn" style={{ color: '#3E80F1', borderLeft: '2rpx solid #F2F2F2', borderRadius: '0 0 24rpx 0' }} onClick={companyConfirm}>
              立即完善
            </View>
          </View>
        </View>
      </Dialog>
      {activeIndex === 0 && <AiChat ref={aiChatRef} height={totalHeight} />}
      {activeIndex === 1 && <CluePage height={totalHeight} />}
    </View>
  )
}

export default Index
