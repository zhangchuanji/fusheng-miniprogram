import React, { useEffect, useRef, useState } from 'react'
import { Cell, Dialog, Empty, Popup, Swipe, Tabs } from '@nutui/nutui-react-taro'
import { View, Image, ScrollView } from '@tarojs/components'
import Taro, { nextTick, useLoad } from '@tarojs/taro'
import './index.scss'
import { useExampleActions } from '@/hooks/useExampleActions'
import AiChat from './aiChat'
import CluePage from '../../subpackages/cluePage/index'
import { Del, Setting, Star, TriangleDown, TriangleUp } from '@nutui/icons-react-taro'
import { aiSessionDeleteAPI, aiSessionGetHistorySessionAPI, aiSessionListAPI, userFavoriteListAPI } from '@/api/chatMsg'
import { useAppSelector } from '@/hooks/useAppStore'
import AiMessageComponent from '@/components/AiMessageComponent'
import { useAppDispatch } from '@/hooks/useAppStore'
import { getSessionListAsync, getFavoriteListAsync } from '@/redux/asyncs/conversation'
import { useDebounce } from '@/hooks/useDebounce' // 添加防抖 hook 导入
import { IConversation } from '@/redux/modules/conversation'

function Index() {
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(state => state.login.userInfo)
  // 获取conversation相关状态
  const {
    conversations, // 会话列表数据
    favorites // 收藏列表数据
  } = useAppSelector(state => state.conversation)
  const cluePageRef = useRef<{ getClueList: (page?: number, append?: boolean) => void }>(null)
  const [capsuleInfo, setCapsuleInfo] = useState({ height: 32, statusBarHeight: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [showSetting, setShowSetting] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0 })
  const tabKeys = ['customer', 'clue']
  const [tabvalue, setTabvalue] = useState(0)
  const [companyShow, setCompanyShow] = useState(false)
  // 替换原来的 openRef，添加状态管理
  const [currentOpenSwipe, setCurrentOpenSwipe] = useState<string | null>(null)
  const swipeRefs = useRef<{ [key: string]: any }>({})
  const openRef = useRef<any>(null)
  // 将单个展开状态改为对象，用于管理每个收藏项的展开状态
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({})
  const handleActiveIndex = (idx: any) => {
    if (idx == 1) {
      cluePageRef.current?.getClueList()
    }
    setActiveIndex(idx)
  }

  // 添加ref来调用子组件方法
  const aiChatRef = useRef<any>(null)

  useEffect(() => {
    // 获取胶囊按钮信息
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()

    if (!Taro.getStorageSync('companyInfo') || !Taro.getStorageSync('companyInfo').expansionDomainKeywordsSelected || Taro.getStorageSync('companyInfo').expansionDomainKeywordsSelected.length === 0) {
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
    dispatch(getSessionListAsync())
  }

  const getFavoriteList = () => {
    dispatch(getFavoriteListAsync())
  }

  useLoad((options: any) => {
    if (options.text) {
      nextTick(() => {
        Taro.eventCenter.trigger('send', options.text)
      })
    }
  })

  useEffect(() => {
    Taro.eventCenter.on('addSession', res => {
      if (res) {
        setActiveIndex(0)
      }
    })

    return () => {
      Taro.eventCenter.off('addSession')
    }
  }, [])

  // 当userInfo加载完成后调用getSession
  useEffect(() => {
    if (userInfo?.id) {
      getSession()
      getFavoriteList()
    }
  }, [userInfo])

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

  // 原始的 getAiSession 调用函数
  const handleGetAiSession = () => {
    aiChatRef.current.getAiSessionCopy()
  }

  // 创建防抖版本的函数，延迟 300ms
  const debouncedGetAiSession = useDebounce(handleGetAiSession, 300)

  const goNew = () => {
    debouncedGetAiSession() // 使用防抖版本
  }

  // 修改展开收起函数，接收索引参数
  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const deleteChatItem = (chatItem: any) => {
    aiSessionDeleteAPI({ id: chatItem.id }, res => {
      if (res.success) {
        if (chatItem.id === Taro.getStorageSync('aiSessionId')) {
          Taro.removeStorageSync('aiSessionId')
        }
        getSession()
        // 关闭当前打开的 Swipe
        if (currentOpenSwipe && swipeRefs.current[currentOpenSwipe]) {
          swipeRefs.current[currentOpenSwipe].close()
        }
        setCurrentOpenSwipe(null)
        setTimeout(() => {
          Taro.showToast({ title: '删除成功', icon: 'none' })
        }, 1000)
      }
    })
  }

  // 处理 Swipe 打开事件
  const handleSwipeOpen = (chatItemId: string) => {
    // 如果当前有打开的 Swipe 且不是同一个，先关闭它
    if (currentOpenSwipe && currentOpenSwipe !== chatItemId && swipeRefs.current[currentOpenSwipe]) {
      swipeRefs.current[currentOpenSwipe].close()
    }
    setCurrentOpenSwipe(chatItemId)
  }

  // 处理 Swipe 关闭事件
  const handleSwipeClose = () => {
    setCurrentOpenSwipe(null)
  }

  const getChatItem = (chatItem: any) => {
    Taro.showLoading({ title: '获取内容中', mask: true })
    aiSessionGetHistorySessionAPI({ id: chatItem.id }, res => {
      if (res.success && res.data) {
        setActiveIndex(0)
        Taro.hideLoading()
        nextTick(() => {
          Taro.eventCenter.trigger('getChatItem', res.data)
          Taro.setStorageSync('aiSessionId', chatItem.id)
          setShowSetting(false)
        })
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
                  {conversations &&
                    conversations.length > 0 &&
                    conversations.map((item: IConversation, index) => (
                      <View className="setting_content_list_item" key={index}>
                        <View className="item-date">{item.name}</View>
                        {item.list &&
                          item.list.length > 0 &&
                          item.list.map((chatItem: any, index: number) => {
                            const swipeKey = `${item.name}-${chatItem.id}`
                            return (
                              <Cell key={index} className="list_item" onClick={() => getChatItem(chatItem)}>
                                <Swipe
                                  ref={ref => {
                                    if (ref) {
                                      swipeRefs.current[swipeKey] = ref
                                    }
                                  }}
                                  rightAction={<Del color="#FF1818" />}
                                  onActionClick={() => deleteChatItem(chatItem)}
                                  onOpen={() => handleSwipeOpen(swipeKey)}
                                  onClose={handleSwipeClose}
                                >
                                  <View className="list-item-title">{chatItem.title}</View>
                                </Swipe>
                              </Cell>
                            )
                          })}
                      </View>
                    ))}
                  {(!conversations || conversations.length === 0) && (
                    <Empty
                      description="暂无问答记录"
                      image={
                        <Image
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                          src="http://36.141.100.123:10013/glks/assets/emptyImg.png"
                        />
                      }
                    />
                  )}
                </ScrollView>
              </Tabs.TabPane>
              <Tabs.TabPane title="我的收藏">
                <ScrollView enhanced showScrollbar={false} scrollY className="scrollView">
                  {favorites &&
                    favorites.length > 0 &&
                    favorites.map((item: any, index: any) => {
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
                  {(!favorites || favorites.length === 0) && (
                    <Empty
                      description="暂无收藏记录"
                      image={
                        <Image
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                          src="http://36.141.100.123:10013/glks/assets/emptyImg.png"
                        />
                      }
                    />
                  )}
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
      <View style={{ display: activeIndex === 0 ? 'block' : 'none' }}>
        <AiChat ref={aiChatRef} height={totalHeight} />
      </View>

      <View style={{ display: activeIndex === 1 ? 'block' : 'none' }}>
        <CluePage ref={cluePageRef} height={totalHeight} />
      </View>
    </View>
  )
}

export default Index
