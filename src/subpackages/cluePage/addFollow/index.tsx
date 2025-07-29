import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Input, Textarea, Button } from '@tarojs/components'
import { ArrowDownSize6, Close, Checked, Search, Success, CheckClose } from '@nutui/icons-react-taro'
import { searchCompaniesAPI } from '@/api/company'
import { clueFollowUpCreateAPI } from '@/api/clue' // 移除uploadFileAPI
import { Calendar, Popup } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { useSelector } from 'react-redux'
import { clueListAPI } from '@/api/clue'
import { BASE_URL } from '@/service/config' // 新增导入

// 文件类型定义
interface FileItem {
  fileId: number
  name: string
  size: string
  sizeInBytes: number
  progress: number
  status: 'uploading' | 'completed' | 'failed'
  filePath?: string
  tempFilePath?: string
  errorMessage?: string
  url?: string // 新增：服务器返回的文件URL
}

function AddFollowPage() {
  const [formData, setFormData] = useState({
    userId: Taro.getStorageSync('token').userId,
    associateLead: '',
    leadId: '',
    associateLeadContact: '',
    contactId: '',
    type: '',
    method: '',
    followUpTime: new Date().toISOString().split('T')[0],
    content: '',
    followUpFileList: [] as FileItem[]
  })

  const userInfo = useSelector((state: any) => state.login.userInfo)
  const [showFollowUpType, setShowFollowUpType] = useState(false)
  const [showFollowUpMethod, setShowFollowUpMethod] = useState(false)
  const [showFollowUpTime, setShowFollowUpTime] = useState(false)

  // 跟进类型选项
  const [followUpTypeOptions, setFollowUpTypeOptions] = useState([
    { id: 1, name: '线索', selected: false },
    { id: 2, name: '客户', selected: false },
    { id: 3, name: '联系人', selected: false },
    { id: 4, name: '商机', selected: false }
  ])

  // 跟进方式选项
  const [followUpMethodOptions, setFollowUpMethodOptions] = useState([
    { id: 1, name: '电话', selected: false },
    { id: 2, name: '邮件', selected: false },
    { id: 3, name: '微信', selected: false },
    { id: 4, name: '拜访', selected: false },
    { id: 5, name: '其他', selected: false }
  ])

  // 下拉选项数据
  const [dropdownData, setDropdownData] = useState({
    associateLead: [],

    associateLeadContact: [
      { id: 1, name: '张三', phone: '13800138001' },
      { id: 2, name: '李四', phone: '13800138002' },
      { id: 3, name: '王五', phone: '13800138003' },
      { id: 4, name: '赵六', phone: '13800138004' },
      { id: 5, name: '钱七', phone: '13800138005' }
    ]
  })

  // 下拉框显示状态
  const [dropdownVisible, setDropdownVisible] = useState({
    associateLead: false,
    associateLeadContact: false
  })

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState({
    associateLead: '',
    associateLeadContact: ''
  })

  const [followUpFileList, setFollowUpFileList] = useState<FileItem[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    clueListAPI({ pageNo: 1, pageSize: 10, userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        // 将 API 返回的数据转换为正确的数组格式
        // 添加HTML清理函数
        const stripHtml = (html: string): string => {
          return html.replace(/<[^>]*>/g, '').trim()
        }

        // 修改第95-98行
        const newOptions = res.data.list.map((item: any) => ({
          id: item.id,
          name: stripHtml(item.name || '- -')
        }))
        setDropdownData(prev => ({
          ...prev,
          associateLead: newOptions // 设置为数组而不是单个字符串
        }))
      }
    })
  }, [])

  // 处理搜索输入
  const handleSearchInput = (field: string, value: string) => {
    clueListAPI({ pageNo: 1, pageSize: 10, userId: userInfo?.id, keywords: value }, res => {
      if (res.success && res.data) {
        // 将 API 返回的数据转换为正确的数组格式
        const newOptions = res.data.list.map((item: any) => ({
          id: item.id,
          name: item.name
        }))

        setDropdownData(prev => ({
          ...prev,
          [field]: newOptions // 设置为数组而不是单个字符串
        }))
      }
    })
    setSearchKeyword(prev => ({
      ...prev,
      [field]: value
    }))

    // 同时更新formData，这样用户手动输入时也能保存
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    setDropdownVisible(prev => {
      // 如果是打开下拉框，先关闭所有其他下拉框
      if (!prev[field]) {
        return {
          associateLead: false,
          associateLeadContact: false,
          [field]: true
        }
      }
      // 如果是关闭下拉框，只关闭当前字段
      return {
        ...prev,
        [field]: !prev[field]
      }
    })
  }

  // 切换下拉框显示状态
  const toggleDropdown = (field: string) => {
    setDropdownVisible(prev => {
      // 如果是打开下拉框，先关闭所有其他下拉框
      if (!prev[field]) {
        return {
          associateLead: false,
          associateLeadContact: false,
          [field]: true
        }
      }
      // 如果是关闭下拉框，只关闭当前字段
      return {
        ...prev,
        [field]: !prev[field]
      }
    })
  }

  // 选择下拉选项
  const selectOption = (field: string, option: any) => {
    const optionName = typeof option === 'string' ? option : option.name

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: optionName
      }

      // 根据字段类型设置对应的ID
      if (field === 'associateLead') {
        newData.leadId = option.id
      } else if (field === 'associateLeadContact') {
        newData.contactId = option.id
      }

      return newData
    })

    // 关闭所有下拉框
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })

    // 清空搜索关键词
    setSearchKeyword(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // 过滤搜索结果
  const getFilteredOptions = (field: string) => {
    const keyword = searchKeyword[field].toLowerCase()
    const options = dropdownData[field]

    if (!keyword) return options

    return options.filter((option: any) => {
      // 处理字符串格式的数据
      if (typeof option === 'string') {
        return option.toLowerCase().includes(keyword)
      }

      // 处理对象格式的数据
      if (field === 'associateLead') {
        return (option.name && option.name.toLowerCase().includes(keyword)) || (option.contact && option.contact.toLowerCase().includes(keyword))
      } else if (field === 'associateLeadContact') {
        return (option.name && option.name.toLowerCase().includes(keyword)) || (option.company && option.company.toLowerCase().includes(keyword))
      }
      return false
    })
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 生成唯一ID
  const generateId = (): number => {
    return Date.now() + Math.random()
  }

  // 文件上传处理
  const handleFileUpload = async () => {
    try {
      // 选择文件
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0]

        // 检查文件大小限制 (50MB)
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
          Taro.showToast({
            title: '文件大小不能超过50MB',
            icon: 'none'
          })
          return
        }

        // 创建文件项
        const newFile: FileItem = {
          fileId: generateId(),
          name: `文件_${Date.now()}`,
          size: formatFileSize(file.size),
          sizeInBytes: file.size,
          progress: 0,
          status: 'uploading',
          tempFilePath: file.path
        }

        // 添加到文件列表
        setFollowUpFileList(prev => [...prev, newFile])

        // 开始上传
        await uploadFile(newFile)
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      Taro.showToast({
        title: '已取消选择图片',
        icon: 'none'
      })
    }
  }

  // 上传文件到服务器
  const uploadFile = async (fileItem: FileItem) => {
    try {
      let progressInterval: NodeJS.Timeout | null = null

      // 模拟上传进度
      const simulateProgress = () => {
        let progress = 0
        progressInterval = setInterval(() => {
          progress += Math.random() * 10 + 5
          if (progress >= 95) {
            progress = 95
            if (progressInterval) {
              clearInterval(progressInterval)
            }
          }
          setFollowUpFileList(prev => prev.map(file => (file.fileId === fileItem.fileId ? { ...file, progress: Math.round(progress) } : file)))
        }, 200)
      }

      simulateProgress()

      // 获取token
      const tokenData = Taro.getStorageSync('token')
      const token = tokenData?.accessToken

      // 使用Taro.uploadFile，它会自动处理FormData格式
      const uploadRes = await Taro.uploadFile({
        url: `${BASE_URL}/app-api/infra/file/upload`,
        filePath: fileItem.tempFilePath!,
        name: 'file', // 这是FormData中的字段名
        header: {
          Authorization: `Bearer ${token}`,
          'tenant-id': '1'
        },
        formData: {
          // 这里的数据会自动转换为FormData格式
          fileName: fileItem.name
        },
        success: res => {
          console.log('上传成功:', res)
          if (progressInterval) {
            clearInterval(progressInterval)
          }

          // 解析服务器返回的数据
          let responseData
          try {
            responseData = JSON.parse(res.data)
          } catch (error) {
            console.error('解析响应数据失败:', error)
            responseData = res.data
          }

          // 获取服务器返回的文件URL
          const fileUrl = responseData?.data

          // 更新文件状态，添加URL
          setFollowUpFileList(prev =>
            prev.map(file =>
              file.fileId === fileItem.fileId
                ? {
                    ...file,
                    progress: 100,
                    status: 'completed',
                    url: fileUrl // 添加服务器返回的URL
                  }
                : file
            )
          )
        },
        fail: error => {
          console.error('上传失败:', error)
          if (progressInterval) {
            clearInterval(progressInterval)
          }
          setFollowUpFileList(prev => prev.map(file => (file.fileId === fileItem.fileId ? { ...file, status: 'failed', errorMessage: '上传失败' } : file)))
        }
      })
    } catch (error) {
      console.error('上传文件失败:', error)
      setFollowUpFileList(prev => prev.map(file => (file.fileId === fileItem.fileId ? { ...file, status: 'failed' as const, errorMessage: '上传失败' } : file)))
    }
  }

  // 删除文件
  const removeFile = (fileId: number) => {
    setFollowUpFileList(prev => prev.filter(file => file.fileId !== fileId))
  }

  const closeSelect = (e: any) => {
    e.stopPropagation()
    if (dropdownVisible.associateLead || dropdownVisible.associateLeadContact) {
      setDropdownVisible({
        associateLead: false,
        associateLeadContact: false
      })
    }
  }

  const onInputClick = (field: any) => {
    console.log(field, 'onInputClick')

    // 先关闭所有下拉选项
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })
    if (field === 'type') {
      setShowFollowUpType(true)
    } else if (field === 'method') {
      setShowFollowUpMethod(true)
    } else if (field === 'followUpTime') {
      setShowFollowUpTime(true)
    }
  }

  const setChooseValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      followUpTime: `${value[0]}-${value[1]}-${value[2]}`
    }))
  }

  const closePopup = (field: string) => {
    // 关闭所有下拉选项
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })

    if (field === 'type') {
      setShowFollowUpType(false)
    } else if (field === 'method') {
      setShowFollowUpMethod(false)
    } else if (field === 'followUpTime') {
      setShowFollowUpTime(false)
    }
  }

  // 选择跟进类型
  const selectFollowUpType = (optionId: number) => {
    const updatedOptions = followUpTypeOptions.map(option => ({
      ...option,
      selected: option.id === optionId
    }))
    setFollowUpTypeOptions(updatedOptions)
    const selectedOption = updatedOptions.find(option => option.selected)
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        type: selectedOption.name
      }))
    }
    setShowFollowUpType(false)
  }

  // 选择跟进方式
  const selectFollowUpMethod = (optionId: number) => {
    const updatedOptions = followUpMethodOptions.map(option => ({
      ...option,
      selected: option.id === optionId
    }))
    setFollowUpMethodOptions(updatedOptions)
    const selectedOption = updatedOptions.find(option => option.selected)
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        method: selectedOption.name
      }))
    }
    setShowFollowUpMethod(false)
  }

  const renderFormField = (label: string, field: string, placeholder: string, required: boolean = false, hasSearch: boolean = false, hasDropdown: boolean = true, hasRightIcon: boolean = false, isShowDropdownIcon: boolean = true, layoutType: 'vertical' | 'horizontal' = 'vertical') => {
    const isDropdownField = field === 'associateLead' || field === 'associateLeadContact'
    const filteredOptions = isDropdownField ? getFilteredOptions(field) : []

    return (
      <View className={`form-field ${layoutType}`}>
        <View className="field-label">
          {required && <Text className="required-mark">*</Text>}
          <Text className="label-text">{label}</Text>
        </View>
        <View className="field-input-container">
          <View className="input-wrapper">
            {hasSearch && (
              <View className="search-icon">
                <Search size="32rpx" color="#AAAAAA" />
              </View>
            )}
            {isShowDropdownIcon ? (
              <View onClick={() => onInputClick(field)} className="field-input-disabled">
                {formData[field] ? formData[field] : placeholder}
              </View>
            ) : (
              <Input className="field-input" placeholder={placeholder} value={isDropdownField ? formData[field] || searchKeyword[field] : formData[field]} onInput={e => (isDropdownField ? handleSearchInput(field, e.detail.value) : handleInputChange(field, e.detail.value))} />
            )}
            {hasDropdown && (
              <View
                className="dropdown-icon-wrapper"
                onClick={e => {
                  e.stopPropagation()
                  isDropdownField && toggleDropdown(field)
                }}
              >
                <View className={`dropdown-icon ${isDropdownField && dropdownVisible[field] ? 'active' : ''}`}>
                  <ArrowDownSize6 size="28rpx" color="#333333" className={isDropdownField && dropdownVisible[field] ? 'nut-icon-am-blink nut-icon-am-infinite' : ''} />
                </View>
              </View>
            )}
            {hasRightIcon && (
              <View className="right-icon">
                <ArrowDownSize6 size="28rpx" color="#333333" />
              </View>
            )}
          </View>

          {/* 下拉选项 */}
          {isDropdownField && dropdownVisible[field] && (
            <View className="dropdown-options" onClick={e => e.stopPropagation()}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: any, index: number) => (
                  <View key={typeof option === 'string' ? index : option.id} className="dropdown-option" onClick={() => selectOption(field, option)}>
                    {field === 'associateLead' ? (
                      <View className="option-content">
                        <Text className="option-name" dangerouslySetInnerHTML={{ __html: option.name }}></Text>
                      </View>
                    ) : (
                      <View className="option-content">
                        <Text className="option-name">{option.name}</Text>
                        <Text className="option-company">{option.phone}</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View className="dropdown-option no-data">
                  <Text className="no-data-text">暂无数据</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

  function handleSubmit(): void {
    if (!formData.type) {
      Taro.showToast({
        title: '请选择跟进类型',
        icon: 'none'
      })
      return
    }
    if (!formData.method) {
      Taro.showToast({
        title: '请选择跟进方式',
        icon: 'none'
      })
      return
    }
    if (!formData.content) {
      Taro.showToast({
        title: '请输入跟进内容',
        icon: 'none'
      })
      return
    }
    if (followUpFileList && followUpFileList.length > 0) {
      formData.followUpFileList = followUpFileList
    }

    clueFollowUpCreateAPI(formData, res => {
      if (res.success) {
        Taro.showToast({
          title: '添加成功',
          icon: 'none'
        })
        Taro.navigateBack()
      }
    })
  }

  return (
    <View className="addFollowPage">
      <ScrollView enhanced showScrollbar={false} className="form-container" scrollY onClick={e => closeSelect(e)}>
        {/* 关联线索 - 垂直布局 */}
        {renderFormField('关联线索', 'associateLead', '下拉选择企业名称,或者关键词搜索', true, true, true, false, false, 'vertical')}

        {/* 关联线索联系人 - 水平布局 */}
        {renderFormField('关联线索联系人', 'associateLeadContact', '下拉选择企业名称,或者关键词搜索', true, true, true, false, false, 'vertical')}

        {/* 跟进类型 - 垂直布局 */}
        {renderFormField('跟进类型', 'type', '请选择', true, false, false, true, true, 'horizontal')}

        {/* 跟进方式 - 水平布局 */}
        {renderFormField('跟进方式', 'method', '请选择', false, false, false, true, true, 'horizontal')}

        {/* 跟进时间 - 垂直布局 */}
        {renderFormField('跟进时间', 'followUpTime', '请选择开始时间', true, false, false, false, true, 'horizontal')}

        {/* 跟进内容 - 水平布局 */}
        <View className="form-field vertical" style={{ marginTop: '40rpx' }}>
          <View className="field-label">
            <Text className="required-mark">*</Text>
            <Text className="label-text">跟进内容</Text>
          </View>
          <View className="field-input-container">
            <Textarea className="content-textarea" placeholder="请输入内容" value={formData.content} onInput={e => handleInputChange('content', e.detail.value)} />
          </View>
        </View>

        {/* 上传附件 */}
        <View className="upload-section">
          <View className="upload-title">上传附件</View>
          <View className="upload-area" onClick={handleFileUpload}>
            <View className="upload-icon">
              <Image src="http://36.141.100.123:10013/glks/assets/chat/chat4.png" className="upload-icon-image" />
            </View>
            <Text className="upload-text">点击上传文件</Text>
            <Text className="upload-tips">支持.png .jpg .jpeg .gif .svg .dsg</Text>
          </View>

          {/* 已上传文件列表 */}
          <View className="uploaded-files">
            {followUpFileList &&
              followUpFileList.length > 0 &&
              followUpFileList.map(file => (
                <View key={file.fileId} className="file-item">
                  <View className="file-info">
                    <View className="file-name">{file.name}</View>
                    <View className="file-size">{file.size}</View>
                  </View>
                  <View className="file-progress">
                    <View className="progress-bar">
                      <View className="progress-fill" style={{ width: `${file.progress}%` }} />
                    </View>
                    <Text className="progress-text">{file.progress}%</Text>
                  </View>
                  <View className="file-action" onClick={() => removeFile(file.fileId)}>
                    {file.status === 'completed' ? <Success size="30rpx" color="#2156FE" /> : <CheckClose size="30rpx" color="#333" />}
                  </View>
                </View>
              ))}
          </View>

          <View className="submit-btn" onClick={handleSubmit}>
            提交
          </View>
        </View>
      </ScrollView>

      <Popup zIndex={99999} closeIcon={<Close size="32rpx" color="#333333" />} onClose={() => closePopup('type')} closeable style={{ height: '90%' }} visible={showFollowUpType} title="选择跟进类型" position="bottom">
        <View className="followUpType">
          <View className="followUpTypeHeader">
            <View className="link" />
            <Text>跟进类型</Text>
          </View>
          {followUpTypeOptions &&
            followUpTypeOptions.length > 0 &&
            followUpTypeOptions.map(option => (
              <View key={option.id} className={`followUpTypeItem ${option.selected ? 'active' : ''}`} onClick={() => selectFollowUpType(option.id)}>
                <View className="name">{option.name}</View>
                {option.selected && <Checked color="#2F5AF1" size="30rpx" />}
              </View>
            ))}
        </View>
      </Popup>
      <Popup zIndex={99999} closeIcon={<Close size="32rpx" color="#333333" />} onClose={() => closePopup('method')} closeable style={{ height: '90%' }} visible={showFollowUpMethod} title="选择跟进方式" position="bottom">
        <View className="followUpType">
          <View className="followUpTypeHeader">
            <View className="link" />
            <Text>跟进方式</Text>
          </View>
          {followUpMethodOptions &&
            followUpMethodOptions.length > 0 &&
            followUpMethodOptions.map(option => (
              <View key={option.id} className={`followUpTypeItem ${option.selected ? 'active' : ''}`} onClick={() => selectFollowUpMethod(option.id)}>
                <View className="name">{option.name}</View>
                {option.selected && <Checked color="#2F5AF1" size="30rpx" />}
              </View>
            ))}
        </View>
      </Popup>
      <Calendar visible={showFollowUpTime} defaultValue={formData.followUpTime} startDate={'1900-01-01'} onClose={() => closePopup('followUpTime')} onConfirm={setChooseValue} />
    </View>
  )
}

export default AddFollowPage
