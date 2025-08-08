import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Image, Input, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'
import { textStageAPI, companyStageAPI, guessYouWantAPI, aiSessionCreateAPI, aiMessageCreateAPI, aiSessionUpdateAPI, aiMessageEvaluationCreateAPI, userFavoriteCreateAPI, preprocessingAPI } from '@/api/chatMsg'
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

const Index = forwardRef<{ getAiSessionCopy: () => void }, { height: number }>(({ height }, ref) => {
  type Message = {
    splitNum: any
    total: any
    role: string
    content: string
    conclusion: string
    companyList: any[]
    apiStatus: { textComplete: boolean; companyComplete: boolean }
    messageId: string
    isCollect: boolean
    isLike: number
  }
  const dispatch = useAppDispatch()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const contentRef = useRef<any>(null)
  const [recommendAnim, setRecommendAnim] = useState('')
  const [conversationId, setConversationId] = useState('')
  const recommendRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
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
  const [yiJianVisible, setYiJianVisible] = useState(false)
  const [yiJianInput, setYiJianInput] = useState('')
  const [copyMessageId, setCopyMessageId] = useState('')
  const [saveQueue, setSaveQueue] = useState<Set<string>>(new Set())

  // 添加功能按钮状态管理
  const [buttonStates, setButtonStates] = useState<{ [key: string]: { [buttonIndex: number]: boolean } }>({})

  // 生成唯一ID的函数
  const generateUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getAiSessionCopy
  }))

  // 处理功能按钮点击
  const handleButtonClick = (messageId: string, buttonIndex: number) => {
    let msg = messages.filter(item => item.messageId === messageId)
    setCopyMessageId(messageId)
    // 直接计算answerContent，不依赖状态
    const currentAnswerContent = {
      content: msg.filter(item => item.role === 'ai')[0].content,
      companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      userInput: msg.filter(item => item.role === 'user')[0].content
    }

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
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            const newLikeStatus = message.isLike === 1 ? 0 : 1
            aiMessageEvaluationCreateAPI(
              {
                userId: userInfo?.id,
                messageId: messageId,
                entryPoint: 'ai_chat',
                isLiked: newLikeStatus,
                questionContent: currentAnswerContent.userInput,
                answerContent: JSON.stringify(currentAnswerContent)
              },
              res => {
                if (!res.success) {
                  setMessages(prevMsgs => prevMsgs.map(msg => (msg.messageId === messageId && msg.role === 'ai' ? { ...msg, isLike: message.isLike } : msg)))
                  Taro.showToast({
                    title: '点赞失败',
                    icon: 'none'
                  })
                } else {
                  Taro.showToast({
                    title: '点赞成功',
                    icon: 'none'
                  })
                }
              }
            )

            return { ...message, isLike: newLikeStatus }
          }
          return message
        })
      )
    } else if (buttonIndex === 2) {
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            if (message.isLike === 0) {
              setYiJianVisible(true)
            } else {
              const updatedMessage = { ...message, isLike: 0 }
              aiMessageEvaluationCreateAPI(
                {
                  userId: userInfo?.id,
                  messageId: messageId,
                  entryPoint: 'ai_chat',
                  isLiked: 0,
                  questionContent: currentAnswerContent.userInput,
                  answerContent: JSON.stringify(currentAnswerContent)
                },
                res => {
                  if (!res.success) {
                    setMessages(prevMsgs => prevMsgs.map(msg => (msg.messageId === messageId && msg.role === 'ai' ? { ...msg, isLike: message.isLike } : msg)))
                  }
                }
              )

              return updatedMessage
            }
          }
          return message
        })
      )
    } else if (buttonIndex === 3) {
      // 更新messages状态，只修改特定messageId的消息
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            return { ...message, isCollect: !message.isCollect }
          }
          return message
        })
      )
      let contentSummary = JSON.stringify({
        content: msg.filter(item => item.role === 'ai')[0].content,
        companyList: msg.filter(item => item.role === 'ai')[0].companyList,
        splitNum: msg.filter(item => item.role === 'ai')[0].splitNum,
        total: msg.filter(item => item.role === 'ai')[0].total
      })
      let queryParams = {
        title: msg.filter(item => item.role === 'user')[0].content,
        userId: userInfo?.id,
        messageId,
        contentSummary: contentSummary
      }
      if (!msg.filter(item => item.role === 'ai')[0].isCollect) {
        userFavoriteCreateAPI(queryParams, res => {
          if (res.success) {
            dispatch(getFavoriteListAsync())
            Taro.showToast({ title: '收藏成功', icon: 'none' })
          }
        })
      } else {
        userFavoriteCreateAPI(queryParams, res => {
          if (res.success) {
            dispatch(getFavoriteListAsync())
            Taro.showToast({ title: '已取消收藏', icon: 'none' })
          }
        })
      }
    }
  }

  const yiJianConfirm = () => {
    let msg = messages.filter(item => item.messageId === copyMessageId)
    // 直接计算answerContent，不依赖状态
    const currentAnswerContent = {
      content: msg.filter(item => item.role === 'ai')[0].content,
      companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      userInput: msg.filter(item => item.role === 'user')[0].content
    }

    aiMessageEvaluationCreateAPI({ userId: userInfo?.id, messageId: aiSessionId, entryPoint: 'ai_chat', isLiked: 2, questionContent: currentAnswerContent.userInput, answerContent: JSON.stringify(currentAnswerContent), commentContent: yiJianInput }, res => {
      if (res.success) {
        Taro.showToast({ title: '反馈成功', icon: 'none' })
        setMessages(prevMessages =>
          prevMessages.map(message => {
            if (message.messageId === copyMessageId && message.role === 'ai') {
              const newDislikeStatus = message.isLike === 2 ? 0 : 2
              return { ...message, isLike: newDislikeStatus }
            }
            return message
          })
        )
      }
    })
    setYiJianVisible(false)
  }

  function listenerInterface(type: string, messageId: string, userMessageId: string | number, isItCompleted: boolean, messagesInfo: Message[]) {
    let userMsg = messagesInfo.filter(item => item.messageId === userMessageId && item.role === 'user')
    let aiMsg = messagesInfo.filter(item => item.messageId === messageId && item.role === 'ai')

    // 检查是否两个API都完成且未保存
    if (aiMsg[0]?.apiStatus?.textComplete && aiMsg[0]?.apiStatus?.companyComplete && !saveQueue.has(messageId)) {
      // 添加到保存队列，防止重复保存
      setSaveQueue(prev => new Set([...prev, messageId]))

      // 保存到数据库
      saveMessageToDatabase(userMsg[0], aiMsg[0], messageId)
    }
  }

  const saveMessageToDatabase = async (userMessage: Message, aiMessage: Message, messageId: string) => {
    try {
      const answerTime = formatTime(new Date())
      const questionTimestamp = new Date(questionTime).getTime()
      const answerTimestamp = new Date(answerTime).getTime()
      const responseDurationMs = answerTimestamp - questionTimestamp
      const responseDuration = Number((responseDurationMs / 1000).toFixed(1))

      const result = await new Promise((resolve, reject) => {
        aiMessageCreateAPI(
          {
            sessionId: aiSessionId,
            userMessage: userMessage?.content,
            aiResponse: aiMessage.content,
            questionTime,
            answerTime,
            responseDuration,
            enterpriseInfo: JSON.stringify({
              companyList: aiMessage.companyList,
              splitNum: aiMessage.splitNum,
              total: aiMessage.total
            })
          },
          res => {
            if (res.success) {
              resolve(res.data)
            } else {
              reject(res)
            }
          }
        )
      })

      // 保存成功后更新消息ID
      if (result) {
        setMessages(msgs => {
          return msgs.map(msg => {
            if (msg.messageId === messageId) {
              return { ...msg, messageId: result as string }
            }
            return msg
          })
        })
      }
    } catch (error) {
      console.error('保存消息失败:', error)
    } finally {
      // 从保存队列中移除
      setSaveQueue(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  // 监听键盘高度变化（仅微信小程序）
  useEffect(() => {
    console.log(messages)
  }, [messages])

  // 监听键盘高度变化（仅微信小程序）
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.onKeyboardHeightChange(res => {
        setKeyboardHeight(res.height)
      })
    }

    Taro.eventCenter.on('send', res => {
      if (res) {
        defaultSend(res)
      }
    })

    return () => {
      Taro.eventCenter.off('addMsg')
      Taro.eventCenter.off('send')
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
        setMessages([])
        setConversationId('')
      }
    })
  }

  const getAiSessionCopy = () => {
    aiSessionCreateAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        Taro.setStorageSync('aiSessionId', res.data)
        setAiSessionId(res.data)
        dispatch(getSessionListAsync())
        Taro.eventCenter.trigger('addSession', true)
        setMessages([])
        Taro.showToast({ title: '会话创建成功', icon: 'none' })
        setConversationId('')
      }
    })
  }

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
      setConversationId(res.conversationId)
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
              conclusion: '',
              companyList: [],
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
          if (item.aiResponse) {
            newMessages.push({
              role: 'ai',
              content: item.aiResponse,
              conclusion: item.conclusion,
              companyList: JSON.parse(item.enterpriseInfo).companyList,
              splitNum: JSON.parse(item.enterpriseInfo).splitNum,
              total: JSON.parse(item.enterpriseInfo).total,
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
        })
        setMessages(newMessages)
        setTimeout(() => {
          getChatMsgHeight()
        }, 100)
      }, 100)
    })

    return () => {
      Taro.eventCenter.off('getChatItem')
    }
  }, [])

  // 获取聊天消息高度
  const getChatMsgHeight = () => {
    const query = Taro.createSelectorQuery()
    query.selectAll('.chatMsg_ai, .chatMsg_user').boundingClientRect((rects: any[]) => {
      if (rects && rects.length) {
        // 获取最后一条消息的数据
        const lastRect = rects[rects.length - 1]
        // 计算最后一条消息的底部位置 + 高度 + 100的偏移量
        const lastMsgHeight = (lastRect?.top || 0) + (lastRect?.height || 0) + 100
        setScrollToBottomTrigger(lastMsgHeight)
        setScrollToBottomTriggerCopy(lastMsgHeight)
      } else {
      }
    })
    query.exec()
  }

  // 流式输出AI回复
  const streamAIReply = async (text: string, targetMessageId: string, userMessageId: string) => {
    const STREAM_CONFIG = {
      chunkSize: 10, // 每次输出的字符数量，控制打字机效果的速度
      delay: 10, // 每次输出间隔时间（毫秒），数值越小输出越快
      scrollCheckInterval: 2 // 滚动检查间隔次数，每输出多少次检查一次滚动位置
    }

    setIsStreaming(true)
    let reply = ''

    for (let i = 0; i < text.length; i += STREAM_CONFIG.chunkSize) {
      const chunk = text.slice(i, i + STREAM_CONFIG.chunkSize)
      reply += chunk

      setMessages(msgs => {
        return msgs.map(msg => {
          if (msg.messageId === targetMessageId && msg.role === 'ai') {
            return { ...msg, content: reply }
          }
          return msg
        })
      })

      if (i % STREAM_CONFIG.scrollCheckInterval === 0) {
        setTimeout(() => {
          if (shouldAutoScroll) {
            getChatMsgHeight()
          }
        }, 50)
      }

      await new Promise(res => setTimeout(res, STREAM_CONFIG.delay))
    }

    // 流式输出完成后，设置textComplete为true
    setIsStreaming(false)
    setMessages(msgs => {
      const updatedMessages = msgs.map(msg => {
        if (msg.messageId === targetMessageId && msg.role === 'ai') {
          return {
            ...msg,
            apiStatus: {
              ...msg.apiStatus,
              textComplete: true
            }
          }
        }
        return msg
      })

      // 在状态更新完成后，使用更新后的数据调用监听器
      listenerInterface('text', targetMessageId, userMessageId, true, updatedMessages)

      return updatedMessages
    })
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
    if (!Taro.getStorageSync('aiSessionId')) {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          Taro.setStorageSync('aiSessionId', res.data)
          setAiSessionId(res.data)
          dispatch(getSessionListAsync())

          // 在这里使用新创建的 sessionId 继续执行后续逻辑
          continueWithSessionId(res.data, input)
        }
      })
    } else {
      // 如果已有 sessionId，直接继续执行
      continueWithSessionId(aiSessionId, input)
    }
  }

  // 发送消息
  const defaultSend = (val: string) => {
    if (!Taro.getStorageSync('aiSessionId')) {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          Taro.setStorageSync('aiSessionId', res.data)
          setAiSessionId(res.data)
          dispatch(getSessionListAsync())
          continueWithSessionId(res.data, val)
        }
      })
    } else {
      continueWithSessionId(aiSessionId, val)
    }
  }

  // 提取公共逻辑到单独函数
  const continueWithSessionId = (sessionId: string, text: string) => {
    if (!Taro.getStorageSync('companyInfo')) {
      Taro.eventCenter.trigger('companyShow', true)
    }
    if (!text.trim() || isStreaming) return

    // 使用传入的 sessionId 而不是状态中的 aiSessionId
    // aiSessionUpdateAPI({ userId: userInfo?.id, id: sessionId, title: text, conversationId: conversationId }, res => {
    //   if (res.success) {
    //     dispatch(getSessionListAsync())
    //   }
    // })

    setQuestionTime(formatTime(new Date())) // 用户发送消息的时间

    // 为每条消息生成唯一ID
    const userMessageId = generateUniqueId()
    const aiMessageId = generateUniqueId()

    setMessages(msgs => [
      ...msgs,
      {
        splitNum: 0,
        total: 0,
        role: 'user',
        content: text,
        conclusion: '',
        companyList: [],
        apiStatus: { textComplete: false, companyComplete: false },
        messageId: userMessageId,
        isCollect: false,
        isLike: 0
      },
      {
        splitNum: 0,
        total: 0,
        role: 'ai',
        content: '',
        conclusion: '',
        companyList: [],
        apiStatus: { textComplete: false, companyComplete: false },
        messageId: aiMessageId,
        isCollect: false,
        isLike: 0
      }
    ])

    if (companyInfo?.customInput) {
      companyInfo.expansionDomainKeywordsSelected = [...companyInfo.expansionDomainKeywordsSelected, companyInfo.customInput]
    }

    const doAll = () => {
      // 找出最后一个有值的companyList
      let lastCompanyList: any[] = []
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].companyList && messages[i].companyList.length > 0) {
          lastCompanyList = messages[i].companyList
          break
        }
      }

      try {
        preprocessingAPI(
          {
            targetCompanyName: companyInfo.companyName,
            query: text,
            questionKeyword: companyInfo.expansionDomainKeywordsSelected.join(','),
            responseMode: 'blocking',
            user: userInfo?.id,
            conversationId: conversationId || '',
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
          parameter => {
            if (parameter.success || parameter.data) {
              // 直接调用textStageAPI
              textStageAPI({ ...parameter.data, conversationId }, res => {
                if (res && res.success && res.data) {
                  setConversationId(res.data.conversationId)
                  aiSessionUpdateAPI({ userId: userInfo?.id, id: sessionId, title: text, conversationId: res.data.conversationId }, res => {
                    if (res.success) {
                      dispatch(getSessionListAsync())
                    }
                  })
                  let responseText = ''
                  if (res.data.introduction) {
                    responseText = `${res.data.introduction || ''}${res.data.analysisContent || ''}`
                    streamAIReply(responseText, aiMessageId, userMessageId)
                    setMessages(msgs => {
                      return msgs.map(msg => {
                        // 只更新匹配的消息
                        if (msg.messageId === aiMessageId && msg.role === 'ai') {
                          // 处理企业信息
                          const processedCompanyList = res.data.companyBody.companyInfoResponseList.map((item: any) => {
                            let locationStr = item.province || item.address || item.location || '未知省份'
                            if (locationStr.includes('省')) {
                              item.handleLocation = locationStr.split('省')[0] + '省'
                            } else if (locationStr.includes('自治区')) {
                              item.handleLocation = locationStr.split('自治区')[0] + '自治区'
                            } else if (locationStr.includes('市')) {
                              const directMunicipalities = ['北京', '上海', '天津', '重庆']
                              const found = directMunicipalities.find(city => locationStr.includes(city))
                              item.handleLocation = found ? found + '市' : locationStr.split('市')[0] + '市'
                            } else {
                              item.handleLocation = '未知省份'
                            }

                            if (item.legalPerson) {
                              item.legalPerson = item.legalPerson.replace(/\s*\([^)]*\)\s*/g, '').trim() || '- -'
                            } else {
                              item.legalPerson = '- -'
                            }

                            console.log(item)

                            return item
                          })

                          return {
                            ...msg,
                            companyList: processedCompanyList,
                            total: res.data.companyBody.total,
                            splitNum: res.data.companyBody.splitNum || 10
                          }
                        }
                        return msg
                      })
                    })
                  } else {
                    responseText = res.data.normalAnswer
                    streamAIReply(responseText, aiMessageId, userMessageId)
                  }
                } else {
                  setMessages(msgs => {
                    const updatedMessages = msgs.map(msg => {
                      if (msg.messageId === aiMessageId && msg.role === 'ai') {
                        return {
                          ...msg,
                          content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
                          apiStatus: { textComplete: true, companyComplete: true }
                        }
                      }
                      return msg
                    })
                    // 在状态更新完成后，使用更新后的数据调用监听器
                    listenerInterface('text', aiMessageId, userMessageId, true, updatedMessages)
                    return updatedMessages
                  })
                }
              })
              // 直接调用companyStageAPI
              companyStageAPI(parameter.data, res => {
                if (res.success && res.data) {
                  setMessages(msgs => {
                    const updatedMessages = msgs.map(msg => {
                      // 只更新匹配的消息
                      if (msg.messageId === aiMessageId && msg.role === 'ai') {
                        // 处理企业信息
                        const processedCompanyList = res.data.companyInfoResponseList.map((item: any) => {
                          let locationStr = item.province || item.address || item.location || '未知省份'
                          if (locationStr.includes('省')) {
                            item.handleLocation = locationStr.split('省')[0] + '省'
                          } else if (locationStr.includes('自治区')) {
                            item.handleLocation = locationStr.split('自治区')[0] + '自治区'
                          } else if (locationStr.includes('市')) {
                            const directMunicipalities = ['北京', '上海', '天津', '重庆']
                            const found = directMunicipalities.find(city => locationStr.includes(city))
                            item.handleLocation = found ? found + '市' : locationStr.split('市')[0] + '市'
                          } else {
                            item.handleLocation = '未知省份'
                          }

                          if (item.legalPerson) {
                            item.legalPerson = item.legalPerson.replace(/\s*\([^)]*\)\s*/g, '').trim() || '- -'
                          } else {
                            item.legalPerson = '- -'
                          }
                          return item
                        })

                        return {
                          ...msg,
                          companyList: processedCompanyList,
                          total: res.data.total,
                          splitNum: res.data.splitNum,
                          apiStatus: {
                            ...msg.apiStatus,
                            companyComplete: true
                          }
                        }
                      }
                      return msg
                    })

                    // 在状态更新完成后，使用更新后的数据调用监听器
                    listenerInterface('company', aiMessageId, userMessageId, true, updatedMessages)
                    return updatedMessages
                  })
                } else {
                  // 错误处理
                  setMessages(msgs => {
                    const updatedMessages = msgs.map(msg => {
                      if (msg.messageId === aiMessageId && msg.role === 'ai') {
                        return {
                          ...msg,
                          apiStatus: {
                            ...msg.apiStatus,
                            companyComplete: true
                          }
                        }
                      }
                      return msg
                    })

                    // 在状态更新完成后，使用更新后的数据调用监听器
                    listenerInterface('company', aiMessageId, userMessageId, true, updatedMessages)
                    return updatedMessages
                  })

                  if (res.data !== null) {
                    Taro.showToast({
                      title: '公司信息获取失败',
                      icon: 'none'
                    })
                  }
                }
              })
            }
          }
        )
      } catch (error) {}
    }
    doAll()
    setInput('')
  }

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

  const handleScroll = (e: any) => {
    const { scrollTop: currentScrollTop, scrollHeight: currentScrollHeight, clientHeight } = e.detail
    const isNearBottom = currentScrollHeight - currentScrollTop - clientHeight < 50
    setShouldAutoScroll(isNearBottom)
    setCurrentScrollTop(currentScrollTop)

    // 新增：控制置顶置底按钮显示
    const isAtTopPosition = currentScrollTop <= 10
    const isAtBottomPosition = currentScrollHeight - currentScrollTop - clientHeight < 50
  }

  // 新增：滚动到顶部函数
  const scrollToTop = () => {
    setScrollToBottomTrigger(1)
  }

  // 新增：滚动到底部函数
  const scrollToBottom = () => {
    setScrollToBottomTrigger(scrollToBottomTriggerCopy)
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
                <Text user-select className="chatMsg_user">
                  {msg.content}
                </Text>
              ) : (
                <View className="chatMsg_ai">
                  {/* 使用AiMessageComponent替换原有的AI消息显示逻辑 */}
                  <AiMessageComponent msg={msg} />

                  {/* 保留功能按钮部分 */}
                  {msg.content && msg.apiStatus.textComplete && msg.apiStatus.companyComplete ? (
                    <View className="chatMsg_ai_fun">
                      <Image src="http://36.141.100.123:10013/glks/assets/home/home10.png" className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[0] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 0)} data-message-id={msg.messageId} data-button-index={0} />
                      {(msg.isLike == 0 || msg.isLike == 1) && <Image src={msg.isLike == 1 ? 'http://36.141.100.123:10013/glks/assets/home/home14.png' : 'http://36.141.100.123:10013/glks/assets/home/home11.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[1] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 1)} data-message-id={msg.messageId} data-button-index={1} />}
                      {(msg.isLike == 0 || msg.isLike == 2) && <Image src={msg.isLike == 2 ? 'http://36.141.100.123:10013/glks/assets/home/home15.png' : 'http://36.141.100.123:10013/glks/assets/home/home12.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[2] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 2)} data-message-id={msg.messageId} data-button-index={2} />}
                      <Image src={!msg.isCollect ? 'http://36.141.100.123:10013/glks/assets/home/home13.png' : 'http://36.141.100.123:10013/glks/assets/home/home16.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[3] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 3)} data-message-id={msg.messageId} data-button-index={3} />
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
          <Textarea adjust-position={false} value={input} onInput={handleInput} className="chatPage_input" onConfirm={send} placeholder="请输入您的客户需求～" placeholderStyle="color: #A9A9A9;" disabled={isStreaming} />
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
