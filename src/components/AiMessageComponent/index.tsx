import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { ArrowRight, ArrowRightSmall } from '@nutui/icons-react-taro'
import { marked } from 'marked'
import Taro from '@tarojs/taro'

// 配置marked选项，适合小程序环境
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true // 启用GitHub风格的Markdown
})

// 使用marked.parse解析Markdown
const parseMarkdown = (text: string): string => {
  if (!text) return ''

  try {
    const result = marked.parse(text)
    if (typeof result === 'string') {
      return result
    } else if (result instanceof Promise) {
      // 如果是Promise，返回原文本
      console.warn('Marked returned a Promise, using original text')
      return text.replace(/\n/g, '<br>')
    } else {
      return String(result)
    }
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // 如果解析失败，返回原文本并进行基本HTML转义
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '<br>')
  }
}

const ChatTechLoadingAnimation = () => {
  return (
    <View className="tech-loading-container">
      <View className="tech-loading-dots">
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
      </View>
      <View className="tech-loading-text">AI正在思考中...</View>
    </View>
  )
}

interface AiMessageComponentProps {
  msg: {
    splitNum: number
    total: number
    content: string
    companyList: any[]
    apiStatus: { textComplete: boolean; companyComplete: boolean }
    messageId: string
    role: string
  }
}

const navigateToCompanyDetail = (company: any) => {
  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/index?company=${JSON.stringify(company)}`
  })
}

const navigateToCompanyList = (company: any) => {
  Taro.eventCenter.trigger('toCompanyList', company.messageId)
}

const AiMessageComponent: React.FC<AiMessageComponentProps> = ({ msg }) => {
  return (
    <View>
      {msg.content ? <View className="chatMsg_ai_text" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}></View> : null}
      {msg.role === 'ai' && msg.companyList && msg.companyList.length > 0
        ? msg.companyList.slice(0, msg.splitNum).map((val, valIdx) => (
            <View key={valIdx}>
              <View className="chat_ai_company" onClick={() => navigateToCompanyDetail(val)}>
                <View className="company_left">
                  <Image src={require('@/assets/enterprise/enterprise11.png')} className="company_left_img" />
                </View>
                <View className="company_right">
                  <View className="company_right_top">
                    <Text className="company_right_top_text">{val.name}</Text>
                    <ArrowRightSmall color="#2B2B2B" size="24rpx" />
                  </View>
                  <View className="company_right_tags">
                    <Text className="company_right_tag">活跃号</Text>
                    <Text className="company_right_tag">189个联系方式</Text>
                    <Text className="company_right_tag">300-500人</Text>
                  </View>
                  <View className="company_right_info">
                    <Text className="legal-person">法人:{val.legalPerson}</Text>
                    <Text className="address">广东</Text>
                    <View className="website">
                      <Image src={require('@/assets/enterprise/enterprise3.png')} className="website_img" />
                      官网
                    </View>
                  </View>
                  <View className="company_right_date">
                    <Text className="company_right_date_text">{val.establishTime}</Text>
                  </View>
                  <View className="company_right_tabs">
                    <Text className="company_right_tab">最匹配</Text>
                    <Text className="company_right_tab">最新</Text>
                  </View>
                </View>
              </View>
              {valIdx === msg.splitNum - 1 && (
                <View className="chatMsg_ai_fun_line" onClick={() => navigateToCompanyList(msg)}>
                  <View style={{ marginRight: '16rpx' }}>查看{msg.total}企业信息</View>
                  <ArrowRight color="#1B5BFF" size="30rpx" />
                </View>
              )}
            </View>
          ))
        : null}
      {/* 加载动画单独显示在文字和公司列表下方 */}
      {(!msg.apiStatus.textComplete || !msg.apiStatus.companyComplete) && <ChatTechLoadingAnimation />}
    </View>
  )
}

export default AiMessageComponent
