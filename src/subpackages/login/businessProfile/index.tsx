import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button, Input } from '@nutui/nutui-react-taro'
import './index.scss'
import { getProductSellingPointsAPI } from '@/api/company'
import { loginInfoUpdateAPI } from '@/api/setting'
import { useAppSelector } from '@/hooks/useAppStore'

function BusinessProfile() {
  // 选中标签的状态
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [tags, setTags] = useState<any>([])

  const [coreSellingPoints, setCoreSellingPoints] = useState<any>({})
  const userInfo = useAppSelector(state => state.login.userInfo)
  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]))
  }

  const defaultProduct = () => {
    const targetTags = selectedTags.length === 0 ? tags : selectedTags
    const firstTag = targetTags.length > 0 ? targetTags[0] : ''
    return [firstTag, customInput].filter(Boolean).join(',')
  }

  const handleNext = () => {
    // 获取现有的用户信息，保留公司名称和名字
    const existingUserInfo = Taro.getStorageSync('companyInfo') || {}

    Taro.setStorageSync('companyInfo', {
      ...existingUserInfo, // 保留之前的数据（包括公司名称和名字）
      coreSellingPoints: coreSellingPoints,
      expansionDomainKeywords: tags,
      expansionDomainKeywordsSelected: selectedTags.length === 0 ? tags : selectedTags,
      customInput: customInput
    })
    loginInfoUpdateAPI(
      {
        ...userInfo,
        name: existingUserInfo?.userName,
        companyName: existingUserInfo?.companyName,
        targetCompanyServe: JSON.stringify({
          coreSellingPoints: coreSellingPoints,
          expansionDomainKeywords: tags,
          expansionDomainKeywordsSelected: selectedTags.length === 0 ? tags : selectedTags,
          customInput: customInput
        })
      },
      res => {}
    )
    Taro.navigateTo({ url: '/pages/index/index?text=' + `请推荐国内10家生产/主营“${defaultProduct()}”的潜在客户。` })
  }

  const handleCustomInputChange = (e: any) => {
    setCustomInput(e)
  }

  useEffect(() => {
    Taro.showLoading({
      title: '加载中...',
      mask: true
    })
    const companyName = Taro.getCurrentInstance().router?.params?.companyName
    const apiParams = { work_id: '1', query: companyName, user: userInfo?.id }
    getProductSellingPointsAPI(apiParams, res => {
      if (res.success && res.data) {
        setCoreSellingPoints({
          coreBusiness: res.data.coreSellingPoints?.coreBusiness || '',
          productDescription: res.data.coreSellingPoints?.productDescription || '',
          productFeatures: res.data.coreSellingPoints?.productFeatures || ''
        })
        setTags(res.data.expansionDomainKeywords || [])
        Taro.hideLoading()
      } else {
        Taro.showToast({
          title: '获取核心卖点失败',
          icon: 'none'
        })
        Taro.hideLoading()
        Taro.navigateBack()
      }
    })
  }, [])

  // 监听状态变化，用于调试
  useEffect(() => {}, [coreSellingPoints])

  useEffect(() => {}, [tags])

  return (
    <View className="business-profile-page">
      {/* 顶部标题和返回按钮 */}
      <View className="bp-header">
        <Text className="bp-title">AI为您梳理的产品/服务核心卖点</Text>
        <Text className="bp-desc">系统基于企业信息分析出以下内容，您可以直接用或修改，让线索匹配更精准～</Text>
      </View>

      {/* 核心卖点内容区 */}
      <View className="bp-core-section">
        <View className="bp-core-box">
          <View className="bp-core-item">
            <Text className="bp-dot">•</Text>
            <Text className="bp-core-text">
              <Text className="bp-core-title">核心业务：</Text>
              {coreSellingPoints.coreBusiness}
            </Text>
          </View>
          <View className="bp-core-item">
            <Text className="bp-dot">•</Text>
            <Text className="bp-core-text">
              <Text className="bp-core-title">产品描述：</Text>
              {coreSellingPoints.productDescription}
            </Text>
          </View>
          <View className="bp-core-item">
            <Text className="bp-dot">•</Text>
            <Text className="bp-core-text">
              <Text className="bp-core-title">产品特性：</Text>
              {coreSellingPoints.productFeatures}
            </Text>
          </View>
          {/* <View className="bp-core-item">
            <Text className="bp-dot">•</Text>
            <Text className="bp-core-text">
              <Text className="bp-core-title">其他可能产品：</Text>
              {}
            </Text>
          </View> */}
        </View>
      </View>

      {/* 重点领域选择区 */}
      <View className="bp-focus-section">
        <Text className="bp-focus-title">想重点拓展哪些领域的客户？</Text>
        <Text className="bp-focus-desc">选填常用场景，AI优先为您匹配对应线索；也可补充其他需求～</Text>
        <View className="bp-tags">
          {tags && tags.length > 0 ? (
            tags.map((tag: string, index: number) => (
              <View key={index} className={`bp-tag${selectedTags.includes(tag) ? ' bp-tag-selected' : ''}`} onClick={() => handleTagClick(tag)}>
                {tag}
              </View>
            ))
          ) : (
            <Text className="bp-no-tags">暂无推荐标签</Text>
          )}
        </View>
      </View>

      {/* 自定义输入区 */}
      <View className="bp-custom-section">
        <Text className="bp-custom-title">自定义输入</Text>
        <Input className="bp-custom-input" value={customInput} onChange={handleCustomInputChange} placeholder="输入框(如“新能源汽车电池绝缘件客户”)" />
      </View>

      <Button className="bp-next-btn" onClick={handleNext}>
        AI为您匹配线索
      </Button>
    </View>
  )
}

export default BusinessProfile
