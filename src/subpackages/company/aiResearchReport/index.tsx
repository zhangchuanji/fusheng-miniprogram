import React, { useEffect, useState } from 'react'
import { View, Image, Text, RichText } from '@tarojs/components'
import { generateReportAPI } from '@/api/company'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

function Index() {
  const companyInfo = Taro.getStorageSync('companyInfo')
  const [report, setReport] = useState({})
  const [creditCode, setCreditCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [apiCompleted, setApiCompleted] = useState(false)

  // 简单而可靠的 Markdown 解析函数
  const parseMarkdown = (text: string): string => {
    if (!text) return ''
    try {
      return (
        text
          // 处理嵌套的背景色div，移除外层div的padding
          .replace(/<div style="background-color:#f0f8ff; padding:10px; border-radius:5px;">([\s\S]*?)<\/div>/g, '<div style="background-color:#ffffff; padding:none; border-radius:50px;">$1</div>')
          // 处理表格（必须在其他处理之前）
          .replace(/\|([^\n]+)\|/g, (match, content) => {
            if (content.includes('---') || content.includes(':--')) {
              return ''
            }
            const cells = content
              .split('|')
              .map(cell => cell.trim())
              .filter(cell => cell)
            const cellsHtml = cells.map(cell => `<td style="padding: 12px 16px; border: 1px solid #ddd; text-align: left; vertical-align: top; font-size: 12px; line-height: 1.4;">${cell}</td>`).join('')
            return `<tr style="border-bottom: 1px solid #ddd;">${cellsHtml}</tr>`
          })
          .replace(/(<tr[^>]*>.*?<\/tr>\s*)+/g, match => {
            return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #ddd; background: #fff;">${match}</table>`
          })
          // 处理特殊的列表块（包含字数、内容、样例的部分）
          .replace(/(- \*\*字数\*\*[\s\S]*?(?=\n\n|$))/g, match => {
            const listItems = match
              .split('\n')
              .filter(line => line.trim().startsWith('- '))
              .map(line => {
                const content = line.replace(/^- /, '')
                return `<div style="display: flex; margin: 6px 0; align-items: flex-start;"><span style="margin-right: 8px; color: #666;">•</span><span>${content}</span></div>`
              })
              .join('')

            // 处理样例部分的引用内容
            const exampleMatch = match.match(/>\s*([\s\S]*?)(?=\n\n|$)/)
            let exampleContent = ''
            if (exampleMatch) {
              exampleContent = `<div style="">${exampleMatch[1].trim()}</div>`
            }

            return `<div style="background-color:#fff; padding:none; border-radius:5px;">${listItems}${exampleContent}</div>`
          })
          // 处理普通列表项
          .replace(/^- (.+)$/gm, '<div style="display: flex; margin: 6px 0; align-items: flex-start;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>')
          // 处理嵌套的列表项（在HTML内容中的）
          .replace(/\n\s*- (.+)/g, '<div style="display: flex; margin: 6px 0; align-items: flex-start; margin-left: 20px;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/(<\/table>)\s*## ([^\n]+)/g, '$1<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>')
          .replace(/(<\/table>)\s*### ([^\n]+)/g, '$1<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>')
          .replace(/(<\/div>)\s*#### ([^\n]+)/g, '$1<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$2</div>')
          .replace(/^\s*#### ([^\n]+)/gm, '<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$1</div>')
          .replace(/^\s*### ([^\n]+)/gm, '<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>')
          .replace(/^\s*## ([^\n]+)/gm, '<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>')
          .replace(/(<\/table>)\s*---\s*/g, '$1<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>')
          .replace(/^---$/gm, '<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>')
      )
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return text.replace(/\n/g, '<br>')
    }
  }

  // 模拟进度条逻辑
  useEffect(() => {
    if (loading) {
      let timer

      if (progress < 90) {
        timer = setInterval(() => {
          setProgress(prev => {
            if (prev < 60) {
              return prev + Math.random() * 1.5 + 0.5
            } else if (prev < 85) {
              return prev + Math.random() * 0.8 + 0.2
            } else if (prev < 90) {
              return prev + Math.random() * 0.5 + 0.1
            } else {
              return prev
            }
          })
        }, 300)
      } else if (progress >= 90 && !apiCompleted) {
        timer = setInterval(() => {
          setProgress(prev => {
            if (prev < 99) {
              return prev + 1
            } else {
              return prev
            }
          })
        }, 3500)
      } else if (apiCompleted) {
        timer = setInterval(() => {
          setProgress(prev => {
            if (prev < 100) {
              return Math.min(prev + 8, 100)
            } else {
              return prev
            }
          })
        }, 200)
      }

      return () => clearInterval(timer)
    }
  }, [loading, progress, apiCompleted])

  useEffect(() => {
    if (progress >= 100 && apiCompleted) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [progress, apiCompleted])

  useLoad(options => {
    generateReportAPI(
      {
        creditCode: options.creditCode,
        targetCompanyName: companyInfo.companyName,
        targetCompanyServe: JSON.stringify(companyInfo.expansionDomainKeywordsSelected)
      },
      res => {
        if (res.success) {
          Taro.setStorageSync('report', JSON.parse(res.data))
          setReport(JSON.parse(res.data))
          setApiCompleted(true)
        } else {
          setApiCompleted(false)
          Taro.showToast({
            title: '报告生成失败, 请稍后重试',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            Taro.navigateBack()
          }, 2000)
        }
      }
    )
    setCreditCode(options.creditCode)
  })

  // 渲染报告内容的函数
  const renderReportContent = () => {
    if (!report || Object.keys(report).length === 0) {
      return null
    }

    return Object.entries(report).map(([taskKey, taskData], index) => {
      if (!taskData || typeof taskData !== 'object') return null
      const { title = '', content = '' } = taskData as { title?: string; content?: string }

      return (
        <View key={taskKey} className="aiResearchReportPage_content_item">
          <View className="aiResearchReportPage_content_title">
            <Text>{title}</Text>
          </View>
          <View className="aiResearchReportPage_content_text">
            <RichText nodes={parseMarkdown(content)} />
          </View>
        </View>
      )
    })
  }

  // 加载页面
  if (loading) {
    return (
      <View className="aiResearchReportPage_loading">
        <View className="loading_container">
          <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail28.png" className="loading_robot" />
          <View className="progress_container">
            <View className="progress_bar">
              <View className="progress_fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </View>
          </View>
          <View className="loading_title">AI企业分析报告生产中{Math.floor(progress)}%</View>
          <View className="loading_subtitle">此报告为New Galaxy AI生产的专属报告重点信息，迅速了解</View>
        </View>
      </View>
    )
  }

  return (
    <View className="aiResearchReportPage">
      <View className="aiResearchReportPage_header">
        <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail27.png" className="aiResearchReportPage_header_bg" />
        <View className="aiResearchReportPage_header_title">AI研究报告</View>
      </View>

      <View className="aiResearchReportPage_content">{renderReportContent()}</View>
    </View>
  )
}

export default Index
