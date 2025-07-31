// 全局防抖变量，放在文件最顶层
let debounceTimer: any = null
let lastReject: ((reason?: any) => void) | null = null
let searchDebounceTimer: any = null
let validateDebounceTimer: any = null

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { Checkbox } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { Button, Input, Form, FormItem } from '@nutui/nutui-react-taro'
import './index.scss'
import { companyInfoAPI, searchCompaniesAPI } from '@/api/company'
import { useAppSelector } from '@/hooks/useAppStore'
import { configCompanyPostAPI } from '@/api/setting'

function CompanyProfile() {
  const [selected, setSelected] = useState(1)
  const [name, setName] = useState('')
  const [height, setHeight] = useState(0)
  const [companyList, setCompanyList] = useState<string[]>([])
  const [customCompany, setCustomCompany] = useState('')
  const [suggestList, setSuggestList] = useState<string[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [shouldRefocus, setShouldRefocus] = useState(false)
  const userInfo = useAppSelector(state => state.login.userInfo)
  const formRef = useRef<any>(null)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    companyInfoAPI({ phone: userInfo?.mobile }, res => {
      setCompanyList([...res.data, ''])
    })
  }, [])

  // 监听下拉框显示状态，在首次显示时重新聚焦
  useEffect(() => {
    if (showSuggest && suggestList.length > 0 && shouldRefocus) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
        setShouldRefocus(false)
      }, 50)
    }
  }, [showSuggest, suggestList, shouldRefocus])

  // 企业名称验证规则（简化版）
  const validateCompanyName = (rule: any, value: string): Promise<string | boolean> => {
    if (!value.trim()) return Promise.reject('请输入企业名称')
    return Promise.resolve(true)
  }

  const handleNext = () => {
    if (selected === -1) {
      Taro.showToast({ title: '请选择所在企业', icon: 'none' })
      return
    }

    // 如果选择的是自定义企业（最后一个选项）且没有填写企业名称
    if (selected === companyList.length - 1 && !customCompany.trim()) {
      Taro.showToast({ title: '请输入企业名称', icon: 'none' })
      return
    }

    // 获取选中的企业名称
    const selectedCompanyName = selected === companyList.length - 1 ? customCompany : companyList[selected]

    // 保存企业名称和姓名并跳转
    Taro.setStorageSync('companyInfo', {
      companyName: selectedCompanyName,
      userName: name
    })
    configCompanyPostAPI(
      {
        companyName: selectedCompanyName
      },
      res => {}
    )
    Taro.navigateTo({
      url: `/subpackages/login/businessProfile/index?companyName=${selectedCompanyName}&userName=${name}`
    })
  }

  // 防抖搜索函数
  const debouncedSearch = (searchValue: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    searchDebounceTimer = setTimeout(() => {
      searchCompaniesAPI({ name: searchValue }, res => {
        if (res.data && Array.isArray(res.data)) {
          setSuggestList(res.data)
          setShowSuggest(true)
        } else {
          setShowSuggest(false)
        }
      })
    }, 300) // 300ms 防抖延迟
  }

  // 自动补全输入处理
  const handleCompanyInput = (value: string) => {
    getInputRect()
    setCustomCompany(value)

    const shouldShow = !!value.trim()
    if (shouldShow && !showSuggest) {
      setShouldRefocus(true)
    }
    setShowSuggest(shouldShow)

    if (value.trim()) {
      // 使用防抖搜索，只发送最后一次请求
      debouncedSearch(value.trim())
    } else {
      setSuggestList([])
    }
  }

  // 处理建议项点击
  const handleSuggestClick = (suggestValue: string) => {
    // 立即设置输入框内容
    setCustomCompany(suggestValue)

    // 立即关闭下拉框
    setShowSuggest(false)
    // 清空建议列表
    setSuggestList([])
  }

  // 处理页面点击，关闭下拉框
  const handlePageClick = () => {
    setShowSuggest(false)
  }

  // 获取输入框距离顶部的距离加上高度
  const getInputRect = () => {
    Taro.createSelectorQuery()
      .select('.cp_company_input')
      .boundingClientRect(rect => {
        const r = Array.isArray(rect) ? rect[0] : rect
        if (r && typeof r.top === 'number' && typeof r.height === 'number') {
          setHeight(r.top + r.height + 4)
        }
      })
      .exec()
  }

  // 使用useMemo缓存下拉框内容，避免不必要的重新渲染
  const suggestDropdown = useMemo(() => {
    if (!showSuggest || suggestList.length === 0) return null

    return (
      <View className="cp_suggest_list" style={{ top: height + 'px' }}>
        {suggestList.map(s => (
          <View
            className="cp_suggest_item"
            key={s}
            onClick={e => {
              e.stopPropagation() // 阻止事件冒泡
              handleSuggestClick(s)
            }}
          >
            {s}
          </View>
        ))}
      </View>
    )
  }, [showSuggest, suggestList, height])

  return (
    <View className="company_profile_page" onClick={handlePageClick}>
      <View className="cp_title">完善企业信息</View>
      <View className="cp_desc">填写的信息越详细，AI能为您匹配越契合的线索客户，助力快速拓展业务~</View>
      <View className="cp_section">
        <View className="cp_label">
          所在企业 <Text className="cp_required">*</Text>
        </View>
        <Form ref={formRef} footer={null} style={{ background: 'transparent' }}>
          <View className="cp_company_list" style={{ position: 'relative' }}>
            {companyList.map((item, idx) => (
              <View className={`cp_company_item${selected === idx ? ' cp_company_item--active' : ''}`} key={item} onClick={() => setSelected(idx)}>
                <Checkbox className="cp_company_checkbox" checked={selected === idx} color="#2156FE" />
                <Text className="cp_company_name">{item}</Text>
                {idx === companyList.length - 1 && (
                  <View>
                    <Input ref={inputRef} className="cp_company_input" placeholder="请输入您的企业" style="color: #333" value={customCompany} onChange={handleCompanyInput} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </Form>
      </View>
      {suggestDropdown}
      <View className="cp_section">
        <View className="cp_label" style="margin-bottom: 20rpx;">
          您的姓名（选填）
        </View>
        <View>
          <Input className="cp_name_input" placeholder="请输入您的姓名" value={name} onChange={e => setName(e)} />
        </View>
      </View>
      <Button className="cp_next_btn" onClick={handleNext}>
        下一步
      </Button>
    </View>
  )
}

export default CompanyProfile
