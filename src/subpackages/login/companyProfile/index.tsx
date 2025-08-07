import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Cell, Checkbox, Empty, SearchBar } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { Button, Input, Form, Popup } from '@nutui/nutui-react-taro'
import './index.scss'
import { companyInfoAPI, searchCompaniesAPI } from '@/api/company'
import { useAppSelector } from '@/hooks/useAppStore'
import { configCompanyPostAPI, configCompanyGetAPI, configCompanyUpdateAPI } from '@/api/setting'
import { useDebounceValue } from '@/hooks/useDebounce'
function CompanyProfile() {
  const [selected, setSelected] = useState(1)
  const [name, setName] = useState('')
  const [companyList, setCompanyList] = useState<string[]>([])
  const [customCompany, setCustomCompany] = useState('')
  const [suggestList, setSuggestList] = useState<string[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [hasInput, setHasInput] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<any>({})
  const userInfo = useAppSelector(state => state.login.userInfo)
  const formRef = useRef<any>(null)
  const inputRef = useRef<any>(null)

  // 使用防抖hook，延迟500ms
  const debouncedInputValue = useDebounceValue(inputValue, 500)

  // 监听防抖后的值变化
  useEffect(() => {
    if (debouncedInputValue) {
      searchCompaniesAPI({ name: debouncedInputValue }, res => {
        setSuggestList(res.data)
      })
    } else {
      setSuggestList([])
    }
  }, [debouncedInputValue])

  useEffect(() => {
    try {
      companyInfoAPI({ phone: userInfo?.mobile }, res => {
        if (res.success) {
          setCompanyList([...res.data, ''])
        } else {
          setCompanyList([''])
        }
      })
      configCompanyGetAPI({}, res => {
        try {
          if (res.success && res.data) {
            setCompanyInfo(res.data)
          }
        } catch (error) {
          console.log(error)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }, [])

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
    if (companyInfo.id) {
      configCompanyUpdateAPI({ id: companyInfo.id, companyName: selectedCompanyName }, res => {})
    } else {
      configCompanyPostAPI({ companyName: selectedCompanyName }, res => {})
    }
    Taro.navigateTo({
      url: `/subpackages/login/businessProfile/index?companyName=${selectedCompanyName}&userName=${name}`
    })
  }

  const onInputClick = () => {
    setShowSuggest(true)
  }

  const selectCompany = val => {
    setCustomCompany(val)
    setShowSuggest(false)
  }

  const onInputChange = (e: any) => {
    const value = e
    // 更新输入状态
    setHasInput(!!value.trim())
    // 只更新输入值，不直接调用API
    setInputValue(value)
  }

  // 获取Empty组件的描述文本
  const getEmptyDescription = () => {
    if (!hasInput) {
      return '请输入公司名称'
    }
    return '暂无公司信息'
  }

  return (
    <View className="company_profile_page">
      <Popup visible={showSuggest} title="查询企业" style={{ minHeight: '70%' }} position="bottom" onClose={() => setShowSuggest(false)}>
        <View className="cp_suggest">
          <View className="cp_suggest_input">
            <Input className="cp_suggest_input" clearable={true} placeholder="请输入企业名称" onChange={onInputChange} />
          </View>
          <View className="cp_suggest_list">
            {suggestList.map(item => (
              <Cell title={item} clickable onClick={() => selectCompany(item)} />
            ))}
            {/* 根据输入状态显示不同的提示信息 */}
            {suggestList.length === 0 && (
              <Empty
                description={getEmptyDescription()}
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
          </View>
        </View>
      </Popup>
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
                    <Input ref={inputRef} disabled onClick={onInputClick} className="cp_company_input" placeholder="请输入您的企业" style="color: #333" value={customCompany} confirmType="search" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </Form>
      </View>

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
