import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Image, Input, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'
import { textStageAPI, companyStageAPI, guessYouWantAPI, aiSessionCreateAPI, aiMessageCreateAPI, aiSessionUpdateAPI, aiMessageEvaluationCreateAPI, userFavoriteCreateAPI } from '@/api/chatMsg'
import { useAppSelector } from '@/hooks/useAppStore'
import { Dialog, TextArea, BackTop } from '@nutui/nutui-react-taro'
import { ArrowDownSize6, ArrowUpSize6 } from '@nutui/icons-react-taro'
import { useAppDispatch } from '@/hooks/useAppStore'
import { getSessionListAsync, getFavoriteListAsync } from '@/redux/asyncs/conversation'
import AiMessageComponent from '@/components/AiMessageComponent'

const TechLoadingAnimation = () => {
  return (
    <View className="tech-loading-container">
      <View className="tech-loading-dots">
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
      </View>
      <View className="tech-loading-text">正在加载...</View>
    </View>
  )
}

const Index = forwardRef<{ getAiSession: () => void }, { height: number }>(({ height }, ref) => {
  type Message = {
    splitNum: any
    total: any
    role: string
    content: string
    companyList: any[]
    apiStatus: { textComplete: boolean; companyComplete: boolean }
    favorite: boolean
    like: number
    dislike: number
    messageId: string
  }
  const dispatch = useAppDispatch()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const contentRef = useRef<any>(null)
  const [recommendAnim, setRecommendAnim] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [likeImage, setLikeImage] = useState('http://36.141.100.123:10013/glks/assets/home/home11.png')
  const [clickOnTheImage, setClickOnTheImage] = useState('http://36.141.100.123:10013/glks/assets/home/home12.png')
  const [collectPictures, setCollectPictures] = useState('http://36.141.100.123:10013/glks/assets/home/home13.png')
  const recommendRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [inputRef, setInputRef] = useState<any>(null)
  const [currentScrollTop, setCurrentScrollTop] = useState(0)
  const [scrollToBottomTrigger, setScrollToBottomTrigger] = useState(0)
  const [scrollToBottomTriggerCopy, setScrollToBottomTriggerCopy] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [bottomHeight, setBottomHeight] = useState('314rpx')
  const companyInfo = Taro.getStorageSync('companyInfo') || {}
  const userInfo = useAppSelector(state => state.login.userInfo)
  const [recommendBatches, setRecommendBatches] = useState<any[]>([])
  const [aiSessionId, setAiSessionId] = useState('')
  const [questionTime, setQuestionTime] = useState('')
  const [answerContent, setAnswerContent] = useState({
    content: '',
    companyList: [] as any[],
    userInput: '',
    like: 0,
    dislike: 0
  })
  // 添加功能按钮状态管理
  const [buttonStates, setButtonStates] = useState<{ [key: string]: { [buttonIndex: number]: boolean } }>({})

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getAiSession
  }))

  // 处理功能按钮点击
  const handleButtonClick = (messageId: string, buttonIndex: number) => {
    let msg = messages.filter(item => item.messageId === messageId)

    // 直接计算answerContent，不依赖状态
    const currentAnswerContent = {
      content: msg.filter(item => item.role === 'ai')[0].content,
      companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      userInput: msg.filter(item => item.role === 'user')[0].content,
      like: msg.filter(item => item.role === 'ai')[0].like,
      dislike: msg.filter(item => item.role === 'ai')[0].dislike
    }

    setAnswerContent(currentAnswerContent)

    setButtonStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [buttonIndex]: !prev[messageId]?.[buttonIndex]
      }
    }))

    if (buttonIndex === 0) {
      // 构建复制内容：AI回答 + 企业信息
      let copyContent = currentAnswerContent.content

      // 如果有企业列表，添加企业信息
      if (currentAnswerContent.companyList && currentAnswerContent.companyList.length > 0) {
        copyContent += '\n\n企业信息：\n'

        currentAnswerContent.companyList.forEach((company, index) => {
          copyContent += `\n${index + 1}. ${company.name || '未知企业名称'}\n`
          if (company.legalPerson) copyContent += `   法人: ${company.legalPerson}\n`
          if (company.tags && company.tags.length > 0) {
            copyContent += `   标签: ${company.tags.join(', ')}\n`
          }
          if (company.contactInfo.phones && company.contactInfo.phones.length > 0) {
            copyContent += `   联系方式: ${company.contactInfo.phones.join(', ')}\n`
          }
          if (company.score) copyContent += `   匹配度: ${company.score}%\n`
          if (company.industry) copyContent += `   经营范围: ${company.industry}\n`
          if (company.orgType) copyContent += `   公司类型: ${company.orgType}\n`
          if (company.location) copyContent += `   所在省份: ${company.location}\n`
          if (company.businessScope) copyContent += `   公司简介: ${company.businessScope}\n`
        })
      }

      Taro.setClipboardData({
        data: copyContent
      })
    } else if (buttonIndex === 1) {
      // 更新messages状态，只修改特定messageId的消息
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            const newLikeStatus = message.like === 1 ? 0 : 1
            return { ...message, like: newLikeStatus }
          }
          return message
        })
      )

      // 根据当前消息的状态设置图片
      const aiMsg = msg.filter(item => item.role === 'ai')[0]
      const newLikeStatus = aiMsg.like === 1 ? 0 : 1
      // aiMessageEvaluationCreateAPI({ userId: userInfo?.id, messageId: aiSessionId, entryPoint: 'ai_chat', isLiked: 1, questionContent: currentAnswerContent.userInput, answerContent: JSON.stringify(currentAnswerContent) }, res => {
      //   if (res.success) {
      //     msg.filter(item => item.role === 'ai')[0].like = 1
      //   }
      // })
    } else if (buttonIndex === 2) {
      // 更新messages状态，只修改特定messageId的消息
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            const newDislikeStatus = message.dislike === 1 ? 0 : 1
            return { ...message, dislike: newDislikeStatus }
          }
          return message
        })
      )
      // setYiJianVisible(true)
    } else if (buttonIndex === 3) {
      // 更新messages状态，只修改特定messageId的消息
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            return { ...message, favorite: !message.favorite }
          }
          return message
        })
      )
      // let contentSummary = JSON.stringify({
      //   content: msg.filter(item => item.role === 'ai')[0].content,
      //   companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      //   splitNum: msg.filter(item => item.role === 'ai')[0].splitNum,
      //   total: msg.filter(item => item.role === 'ai')[0].total,
      //   favorite: msg.filter(item => item.role === 'ai')[0].favorite,
      //   like: msg.filter(item => item.role === 'ai')[0].like,
      //   dislike: msg.filter(item => item.role === 'ai')[0].dislike
      // })
      // let queryParams = {
      //   title: msg.filter(item => item.role === 'user')[0].content,
      //   userId: userInfo?.id,
      //   messageId,
      //   contentSummary: contentSummary
      // }
      // userFavoriteCreateAPI(queryParams, res => {
      //   if (res.success) {
      //     if (res.success) {
      //     }
      //     dispatch(getFavoriteListAsync())
      //     Taro.showToast({ title: '收藏成功', icon: 'none' })
      //   }
      // })
    }
  }

  // 监听键盘高度变化（仅微信小程序）
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.onKeyboardHeightChange(res => {
        setKeyboardHeight(res.height)
        // // 强制重新渲染
        // setTimeout(() => {
        //   setScrollToBottomTrigger(prev => prev + 1)
        // }, 100)
      })
    }

    Taro.eventCenter.on('addMsg', res => {
      if (res) {
        getAiSession()
      }
    })

    return () => {
      Taro.eventCenter.off('addMsg')
    }
  }, [])

  // 页面显示时重置键盘高度
  useDidShow(() => {
    setKeyboardHeight(0)
  })

  // 页面隐藏时重置键盘高度
  useDidHide(() => {
    setKeyboardHeight(0)
  })

  // 键盘弹起时调整底部高度
  useEffect(() => {
    if (keyboardHeight > 0) {
      setBottomHeight('235rpx')
    } else {
      setBottomHeight('314rpx')
    }
  }, [keyboardHeight])

  const getAiSession = () => {
    aiSessionCreateAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        Taro.setStorageSync('aiSessionId', res.data)
        setAiSessionId(res.data)
        dispatch(getSessionListAsync())
        Taro.eventCenter.trigger('addSession', true)
        Taro.showToast({ title: '会话创建成功', icon: 'none' })
        setMessages([])
      }
    })
  }

  useEffect(() => {
    const handleToCompanyList = (res: string) => {
      
      let msg = messages.filter(item => item.messageId === res)
      if (msg.length > 0) {
        const aiMsg = msg.filter(item => item.role === 'ai')[0]
        if (aiMsg) {
          let val = {
            companyList: aiMsg.companyList,
            total: aiMsg.total
          }

          // 先跳转页面
          Taro.navigateTo({
            url: `/subpackages/company/enterpriseSearch/index?messageId=${res}`
          }).then(() => {
            // 页面跳转成功后，延迟触发事件
            setTimeout(() => {
              Taro.eventCenter.trigger('enterpriseSearchData', {
                companyList: val.companyList,
                total: val.total,
                messageId: res
              })
              console.log('触发事件总线:', {
                companyList: val.companyList,
                total: val.total,
                messageId: res
              })
            }, 100) // 延迟100ms确保目标页面已经加载
          })
        }
      }
    }

    Taro.eventCenter.on('toCompanyList', handleToCompanyList)

    return () => {
      Taro.eventCenter.off('toCompanyList', handleToCompanyList)
    }
  }, [messages]) // 添加 messages 作为依赖

  // 将其他初始化逻辑移到单独的 useEffect 中
  useEffect(() => {
    getRecommendBatches()
    if (Taro.getStorageSync('aiSessionId')) {
      setAiSessionId(Taro.getStorageSync('aiSessionId'))
    } else {
      getAiSession()
    }
  }, [])

  useEffect(() => {
    Taro.eventCenter.on('getChatItem', res => {
      setMessages([])
      setTimeout(() => {
        const newMessages: Message[] = []
        res.aiMessageDOS.forEach((item: any) => {
          if (item.userMessage) {
            newMessages.push({
              role: 'user',
              splitNum: 0,
              total: 0,
              content: item.userMessage,
              companyList: [],
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || Date.now().toString(),
              favorite: false,
              like: 0,
              dislike: 0
            })
          }
          if (item.aiResponse) {
            newMessages.push({
              role: 'ai',
              content: item.aiResponse,
              companyList: JSON.parse(item.enterpriseInfo).companyList,
              splitNum: JSON.parse(item.enterpriseInfo).splitNum,
              total: JSON.parse(item.enterpriseInfo).total,
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || Date.now().toString(),
              favorite: false,
              like: 0,
              dislike: 0
            })
          }
        })

        setMessages(newMessages)

        setTimeout(() => {
          getChatMsgHeight()
        }, 100)
      }, 0)
    })
  }, [])

  useEffect(() => {
    if (isStreaming) return

    // 获取最后两条消息（用户消息和AI回复）
    const lastTwoMessages = messages.slice(-2)
    const aiMessage = lastTwoMessages.find(msg => msg.role === 'ai' && msg.messageId === '')

    // 如果没有找到未保存的AI消息，直接返回
    if (!aiMessage) return

    if (!aiMessage.apiStatus?.textComplete || !aiMessage.apiStatus?.companyComplete) return

    const answerTime = formatTime(new Date())
    const userMessage = lastTwoMessages.find(msg => msg.role === 'user' && msg.messageId === '')

    if (aiMessage) {
      const questionTimestamp = new Date(questionTime).getTime()
      const answerTimestamp = new Date(answerTime).getTime()
      const responseDurationMs = answerTimestamp - questionTimestamp
      let responseDuration: number = Number((responseDurationMs / 1000).toFixed(1))

      aiMessageCreateAPI(
        {
          sessionId: aiSessionId,
          userMessage: userMessage?.content,
          aiResponse: aiMessage.content,
          questionTime,
          answerTime,
          responseDuration,
          enterpriseInfo: JSON.stringify({ companyList: aiMessage.companyList, splitNum: aiMessage.splitNum, total: aiMessage.total })
        },
        res => {
          if (res.success && res.data) {
            setMessages(msgs => {
              const newMsgs = [...msgs]
              if (newMsgs.length >= 2) {
                newMsgs[newMsgs.length - 2].messageId = res.data
                newMsgs[newMsgs.length - 1].messageId = res.data
              }
              return newMsgs
            })
          }
        }
      )
    }

    setTimeout(() => {
      if (shouldAutoScroll) {
        getChatMsgHeight()
      }
    }, 200)
  }, [isStreaming, messages]) // 添加messages作为依赖

  // 获取聊天消息高度
  const getChatMsgHeight = () => {
    const query = Taro.createSelectorQuery()
    query.selectAll('.chatMsg_ai, .chatMsg_user').boundingClientRect((rects: any[]) => {
      if (rects && rects.length) {
        const totalHeight = rects.reduce((sum, rect) => sum + (rect?.height || 0), 0)
        setScrollToBottomTrigger(totalHeight)
        setScrollToBottomTriggerCopy(totalHeight)
      } else {
      }
    })
    query.exec()
  }

  // 模拟AI流式回复
  const streamAIReply = async (text: string) => {
    if (!text || typeof text !== 'string') {
      console.error('Invalid text for streaming:', text)
      setMessages(msgs => {
        const newMsgs = [...msgs]
        // 找到最后一条AI消息（ID为空的消息）
        const targetMsg = newMsgs.find(msg => msg.role === 'ai' && msg.messageId === '')
        if (targetMsg) {
          targetMsg.content = '抱歉，返回的内容格式有误。'
        }
        return newMsgs
      })
      setIsStreaming(false)
      return
    }

    setIsStreaming(true)
    let reply = ''
    for (let i = 0; i < text.length; i++) {
      reply += text[i]
      setMessages(msgs => {
        const newMsgs = [...msgs]
        // 找到最后一条AI消息（ID为空的消息）
        const targetMsg = newMsgs.find(msg => msg.role === 'ai' && msg.messageId === '')
        if (targetMsg) {
          targetMsg.content = reply
        }
        return newMsgs
      })
      // 在流式回复过程中保持滚动到底部
      if (i % 10 === 0) {
        setTimeout(() => {
          if (shouldAutoScroll) {
            getChatMsgHeight()
          }
        }, 50)
      }
      await new Promise(res => setTimeout(res, 10)) // 10ms一字
    }
    setIsStreaming(false)
    // 流式回复完成后，标记文本API完成
    setMessages(msgs => {
      const newMsgs = [...msgs]
      // 找到最后一条AI消息（ID为空的消息）
      const targetMsg = newMsgs.find(msg => msg.role === 'ai' && msg.messageId === '')
      if (targetMsg) {
        targetMsg.apiStatus.textComplete = true
      }
      return newMsgs
    })

    // 流式回复完成后，滚动到底部
    setTimeout(() => {
      if (shouldAutoScroll) {
        getChatMsgHeight()
      }
    }, 100)
  }

  // 格式化时间为 YYYY-M-D HH:mm:ss
  const formatTime = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 发送消息
  const send = () => {
    if (!Taro.getStorageSync('companyInfo')) {
      Taro.eventCenter.trigger('companyShow', true)
    }
    if (!input.trim() || isStreaming) return
    aiSessionUpdateAPI({ userId: userInfo?.id, id: aiSessionId, title: input }, res => {
      if (res.success) {
        dispatch(getSessionListAsync())
      }
    })

    setQuestionTime(formatTime(new Date())) // 用户发送消息的时间
    setMessages(msgs => [...msgs, { splitNum: 0, total: 0, role: 'user', content: input, companyList: [], apiStatus: { textComplete: false, companyComplete: false }, messageId: '', favorite: false, like: 0, dislike: 0 }, { splitNum: 0, total: 0, role: 'ai', content: '', companyList: [], apiStatus: { textComplete: false, companyComplete: false }, messageId: '', favorite: false, like: 0, dislike: 0 }])
    if (companyInfo?.customInput) {
      companyInfo.expansionDomainKeywordsSelected = [...companyInfo.expansionDomainKeywordsSelected, companyInfo.customInput]
    }
    const doAll = () => {
      try {
        // 找出最后一个有值的companyList
        let lastCompanyList: any[] = []
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].companyList && messages[i].companyList.length > 0) {
            lastCompanyList = messages[i].companyList
            break
          }
        }

        // 直接调用textStageAPI
        textStageAPI(
          {
            targetCompanyName: companyInfo.companyName,
            query: input,
            questionKeyword: companyInfo.expansionDomainKeywordsSelected.join(','),
            aiSessionId: aiSessionId,
            conversationId: conversationId,
            productSellingPointsRespDTO: {
              coreSellingPoints: {
                coreBusiness: companyInfo.coreSellingPoints.coreBusiness,
                productDescription: companyInfo.coreSellingPoints.productDescription,
                productFeatures: companyInfo.coreSellingPoints.productFeatures
              },
              expansionDomainKeywords: companyInfo.expansionDomainKeywordsSelected
            },
            extendContextInfo: JSON.stringify(lastCompanyList.length > 5 ? lastCompanyList.slice(0, 5) : lastCompanyList)
          },
          res => {
            if (res && res.success && res.data) {
              setConversationId(res.data.conversationId)
              let responseText = ''
              if (typeof res.data === 'string') {
                responseText = res.data
              } else if (typeof res.data === 'object') {
                if (res.data.text) {
                  responseText = res.data.text
                } else if (res.data.content) {
                  responseText = res.data.content
                } else if (res.data.message) {
                  responseText = res.data.message
                } else {
                  responseText = JSON.stringify(res.data, null, 2)
                }
              } else {
                responseText = String(res.data)
              }
              // 开始流式输出
              streamAIReply(responseText)
            } else {
              setMessages((msgs: any) => {
                if (msgs.length > 0 && msgs[msgs.length - 1].role === 'ai' && !msgs[msgs.length - 1].content) {
                  const newMsgs = [...msgs]
                  const targetMsg = newMsgs.find(msg => msg.role === 'ai' && msg.messageId === '')
                  if (targetMsg) {
                    targetMsg.content = '抱歉，我暂时无法回答您的问题，请稍后再试。'
                    targetMsg.apiStatus.textComplete = true
                    targetMsg.apiStatus.companyComplete = true
                  }
                  return newMsgs
                }
                return [...msgs, { role: 'ai', content: '抱歉，我暂时无法回答您的问题，请稍后再试。', companyList: [], apiStatus: { textComplete: true, companyComplete: true }, messageId: '' }]
              })
            }
          }
        )

        // 直接调用companyStageAPI
        companyStageAPI(
          {
            targetCompanyName: companyInfo.companyName,
            query: input,
            questionKeyword: companyInfo.expansionDomainKeywordsSelected.join(','),
            aiSessionId: aiSessionId,
            productSellingPointsRespDTO: {
              coreSellingPoints: {
                coreBusiness: companyInfo.coreSellingPoints.coreBusiness,
                productDescription: companyInfo.coreSellingPoints.productDescription,
                productFeatures: companyInfo.coreSellingPoints.productFeatures
              },
              expansionDomainKeywords: companyInfo.expansionDomainKeywordsSelected
            }
          },
          res => {
            if (res.success && res.data) {
              setMessages(msgs => {
                const newMsgs = [...msgs]
                if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'ai') {
                  res.data.companyInfoResponseList.forEach((item: any) => {
                    let locationStr = item.province || item.address || item.location || '未知省份'
                    if (locationStr.includes('省')) {
                      item.handleLocation = locationStr.split('省')[0] + '省'
                    } else if (locationStr.includes('市')) {
                      const directMunicipalities = ['北京', '上海', '天津', '重庆']
                      const found = directMunicipalities.find(city => locationStr.includes(city))
                      item.handleLocation = found ? found + '市' : locationStr.split('市')[0] + '市'
                    } else if (locationStr.includes('自治区')) {
                      item.handleLocation = locationStr.split('自治区')[0] + '自治区'
                    } else {
                      item.handleLocation = '未知省份'
                    }
                    // 移除英文名，只保留中文名
                    if (item.legalPerson) {
                      // 使用正则表达式移除括号及其内容（英文名部分）
                      item.legalPerson = item.legalPerson.replace(/\s*\([^)]*\)\s*/g, '').trim() || '- -'
                    } else {
                      item.legalPerson = '- -'
                    }
                  })

                  newMsgs[newMsgs.length - 1].companyList = res.data.companyInfoResponseList
                  newMsgs[newMsgs.length - 1].total = res.data.total
                  newMsgs[newMsgs.length - 1].splitNum = res.data.splitNum
                }

                return newMsgs
              })
            }
            // 更新公司API状态
            setMessages(msgs => {
              const newMsgs = [...msgs]
              const targetMsg = newMsgs.find(msg => msg.role === 'ai' && msg.messageId === '')
              if (targetMsg) {
                targetMsg.apiStatus = {
                  ...targetMsg.apiStatus,
                  companyComplete: true
                }
              }
              return newMsgs
            })
          }
        )
      } catch (error) {}
    }
    doAll()
    setInput('')
  }

  const speechToText = () => {}

  const assignment = (val: any) => {
    setInput(val)
  }

  const getRecommendBatches = () => {
    guessYouWantAPI(companyInfo.expansionDomainKeywordsSelected || [], res => {
      if (res && res.success && res.data) {
        setLoadFailed(true)
        // 确保返回的数据是数组格式
        let batches: any[] = []
        if (Array.isArray(res.data)) {
          batches = res.data
        } else if (typeof res.data === 'object' && res.data.batches) {
          batches = res.data.batches
        }
        setRecommendBatches(batches)
      } else {
        setLoadFailed(false)
      }
    })
  }

  const handleChangeBatch = () => {
    getRecommendBatches()
  }

  // 处理滚动事件
  // 在状态定义区域添加新的状态
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = (e: any) => {
    const { scrollTop: currentScrollTop, scrollHeight: currentScrollHeight, clientHeight } = e.detail
    const isNearBottom = currentScrollHeight - currentScrollTop - clientHeight < 50
    setShouldAutoScroll(isNearBottom)
    setCurrentScrollTop(currentScrollTop)

    // 新增：控制置顶置底按钮显示
    const isAtTopPosition = currentScrollTop <= 10
    const isAtBottomPosition = currentScrollHeight - currentScrollTop - clientHeight < 50

    setIsAtTop(isAtTopPosition)
    setIsAtBottom(isAtBottomPosition)
    setShowScrollButtons(!isAtTopPosition || !isAtBottomPosition)
  }

  // 新增：滚动到顶部函数
  const scrollToTop = () => {
    setScrollToBottomTrigger(1)
  }

  // 新增：滚动到底部函数
  const scrollToBottom = () => {
    setScrollToBottomTrigger(scrollToBottomTriggerCopy)
  }

  const [yiJianVisible, setYiJianVisible] = useState(false)
  const [yiJianInput, setYiJianInput] = useState('')

  const yiJianConfirm = () => {
    // aiMessageEvaluationCreateAPI({ userId: userInfo?.id, messageId: aiSessionId, entryPoint: 'ai_chat', isLiked: 0, questionContent: answerContent.userInput, answerContent: JSON.stringify(answerContent), commentContent: yiJianInput }, res => {
    //   if (res.success) {
    //     answerContent.dislike = 1
    //     Taro.showToast({ title: '反馈成功', icon: 'none' })
    //     setClickOnTheImage('http://36.141.100.123:10013/glks/assets/home/home15.png')
    //   }
    // })
    setYiJianVisible(false)
  }

  const handleInput = (e: any) => {
    setInput(e.detail.value)
  }

  const yiJianCancel = () => {
    setYiJianVisible(false)
  }

  return (
    <View className="chatPage" style={{ height: `calc(100vh - ${height}px)` }}>
      {messages.length === 0 ? (
        <View className="chatPage_default" ref={contentRef} style={{ height: `calc(100% - 314rpx)` }}>
          <Image src="http://36.141.100.123:10013/glks/assets/home/home4.png" className="chatPage_img" />
          {loadFailed ? (
            <View className="chatPage_recommend">
              <View className="chatPage_recommend_title">
                <View className="recommend_left">
                  <Image src="http://36.141.100.123:10013/glks/assets/home/home5.png" className="recommend_left_img" />
                  <Text className="recommend_left_text">您可以试着问我：</Text>
                </View>
                <View className="recommend_right" onClick={handleChangeBatch} style={{ cursor: 'pointer' }}>
                  <Text className="recommend_right_text">换一批</Text>
                  <Image src="http://36.141.100.123:10013/glks/assets/home/home6.png" className="recommend_right_img" />
                </View>
              </View>
              <View className={`chatPage_recommend_content${recommendAnim ? ' ' + recommendAnim : ''}`} ref={recommendRef}>
                {recommendBatches && recommendBatches.length > 0 ? (
                  recommendBatches.map((item, idx) => (
                    <View
                      onClick={() => {
                        assignment(item)
                      }}
                      className="chatPage_recommend_content_item"
                      key={idx}
                    >
                      {item}
                    </View>
                  ))
                ) : (
                  <TechLoadingAnimation />
                )}
              </View>
            </View>
          ) : (
            <View></View>
          )}
        </View>
      ) : (
        // 在ScrollView后面添加置顶置底按钮
        <ScrollView className="chatPage_content" ref={contentRef} style={{ height: `calc(100vh - ${height}px - 319rpx)` }} scrollY scrollTop={scrollToBottomTrigger} onScroll={handleScroll} enhanced={true} scrollWithAnimation={true} showScrollbar={false}>
          {messages.map((msg, idx) => (
            <View key={idx} className={`chatMsg ${msg.role === 'user' ? 'user' : 'ai'}`} style={{ padding: '8px 0' }}>
              {msg.role === 'user' ? (
                <View className="chatMsg_user">{msg.content}</View>
              ) : (
                <View className="chatMsg_ai">
                  {/* 使用AiMessageComponent替换原有的AI消息显示逻辑 */}
                  <AiMessageComponent msg={msg} />

                  {/* 保留功能按钮部分 */}
                  {msg.content && msg.apiStatus.textComplete && msg.apiStatus.companyComplete ? (
                    <View className="chatMsg_ai_fun">
                      <Image src="http://36.141.100.123:10013/glks/assets/home/home10.png" className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[0] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 0)} data-message-id={msg.messageId} data-button-index={0} />
                      {msg.dislike == 0 ? <Image src={msg.like == 0 ? 'http://36.141.100.123:10013/glks/assets/home/home11.png' : 'http://36.141.100.123:10013/glks/assets/home/home14.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[1] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 1)} data-message-id={msg.messageId} data-button-index={1} /> : null}
                      {msg.like == 0 ? <Image src={msg.dislike == 0 ? 'http://36.141.100.123:10013/glks/assets/home/home12.png' : 'http://36.141.100.123:10013/glks/assets/home/home15.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[2] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 2)} data-message-id={msg.messageId} data-button-index={2} /> : null}
                      <Image src={!msg.favorite ? 'http://36.141.100.123:10013/glks/assets/home/home13.png' : 'http://36.141.100.123:10013/glks/assets/home/home16.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[3] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 3)} data-message-id={msg.messageId} data-button-index={3} />
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {messages.length != 0 && (
        <View className="floatingButton">
          {currentScrollTop > 2 && (
            <View className="floatingButtonTop" onClick={() => scrollToTop()}>
              <ArrowUpSize6 color="#333" size="30rpx" />
            </View>
          )}
          {scrollToBottomTriggerCopy - currentScrollTop > 400 && (
            <View className="floatingButtonBottom" onClick={() => scrollToBottom()}>
              <ArrowDownSize6 color="#333" size="30rpx" />
            </View>
          )}
        </View>
      )}

      <View
        className="chatPage_bottom"
        style={{
          height: bottomHeight,
          bottom: keyboardHeight ? `${keyboardHeight}px` : 0,
          transition: 'height 0.26s, bottom 0.26s'
        }}
      >
        <View className="chatPage_bottom_input">
          <Textarea ref={inputRef} adjust-position={false} value={input} onInput={handleInput} className="chatPage_input" onConfirm={send} placeholder="请输入您的客户需求～" placeholderStyle="color: #A9A9A9;" disabled={isStreaming} />
          <View className="chatPage_fun">
            <View className="chatPage_fun_left">
              {/* <Image
                onClick={() => {
                  speechToText()
                }}
                src="http://36.141.100.123:10013/glks/assets/home/home7.png"
                className="chatPage_fun_left1"
              />
              <View className="chatPage_fun_left2">
                <Image src="http://36.141.100.123:10013/glks/assets/home/home8.png" className="chatPage_fun_left2Img" />
                <Text>深度思考</Text>
              </View> */}
            </View>
            <Image
              src="http://36.141.100.123:10013/glks/assets/home/home9.png"
              onClick={() => {
                send()
              }}
              className="chatPage_fun_right"
            />
          </View>
        </View>
      </View>

      <View className="customizeDialog">
        <Dialog title="您对本回答满意吗？" visible={yiJianVisible} onConfirm={() => yiJianConfirm()} onCancel={() => yiJianCancel()}>
          <TextArea className="chatPage_inputs" placeholder="请输入您的评价" value={yiJianInput} onInput={e => setYiJianInput(e.detail.value)} />
        </Dialog>
      </View>
    </View>
  )
})

export default Index
