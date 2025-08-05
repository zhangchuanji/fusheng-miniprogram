import React, { useState, useEffect, Children } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import { Button, Cascader, CascaderOption, Cell, Picker } from '@nutui/nutui-react-taro'
import { configCompanyGetAPI, configCompanySectorAPI, configCompanyUpdateAPI, getAreaAPI } from '@/api/setting'
import Taro from '@tarojs/taro'
import './index.scss'
import { BASE_URL } from '@/service/config'
import { useSelector } from 'react-redux'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'

const initialData = {
  companyName: undefined as string | undefined,
  companyShortName: undefined as string | undefined,
  companyPhone: undefined as string | undefined,
  companyType: undefined as number | undefined,
  industryCategoryId: undefined as string | undefined,
  industryCategoryName: undefined as string | undefined,
  areaId: undefined as string | undefined,
  postalCode: undefined as string | undefined,
  fax: undefined as string | undefined,
  businessLicense: undefined as string | undefined
}

// 在组件开始部分添加企业类型数据
const companyTypes = [
  { text: '有限责任公司', value: 1 },
  { text: '股份有限公司', value: 2 },
  { text: '个人独资企业', value: 3 },
  { text: '合伙企业', value: 4 },
  { text: '普通合伙企业', value: 5 },
  { text: '有限合伙企业', value: 6 },
  { text: '国有企业', value: 7 },
  { text: '集体企业', value: 8 },
  { text: '外商投资企业', value: 9 },
  { text: '中外合资企业', value: 10 },
  { text: '中外合作企业', value: 11 },
  { text: '外资企业', value: 12 },
  { text: '港澳台投资企业', value: 13 },
  { text: '个体工商户', value: 14 },
  { text: '农民专业合作社', value: 15 },
  { text: '农民专业合作社联合社', value: 16 },
  { text: '分公司', value: 17 },
  { text: '子公司', value: 18 },
  { text: '代表处', value: 19 },
  { text: '办事处', value: 20 },
  { text: '联营企业', value: 21 },
  { text: '股份合作企业', value: 22 },
  { text: '私营企业', value: 23 },
  { text: '民营企业', value: 24 },
  { text: '社会团体', value: 25 },
  { text: '事业单位', value: 26 },
  { text: '民办非企业单位', value: 27 },
  { text: '基金会', value: 28 },
  { text: '其他', value: 99 }
]

function Index() {
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState(initialData)
  const [licensePreview, setLicensePreview] = useState('')

  // Cascader 相关状态（移除重复定义）
  const [sectorVisible, setSectorVisible] = useState(false)
  const [sectorValue, setSectorValue] = useState<string[]>([])
  const [sectorDesc, setSectorDesc] = useState('请选择行业')

  // 企业类型选择器状态
  const [companyTypeVisible, setCompanyTypeVisible] = useState(false)
  const [companyTypeDesc, setCompanyTypeDesc] = useState('请选择企业类型')

  // 地区选择相关状态
  const [isVisible, setIsVisible] = useState(false)
  const [customCityData, setCustomCityData] = useState([])
  const [value, setValue] = useState([])
  const [selectedAreaText, setSelectedAreaText] = useState('请选择地区')
  const [originalAreaData, setOriginalAreaData] = useState([])

  // 合并重复的useEffect
  useEffect(() => {
    // 获取地区数据
    getAreaAPI({}, res => {
      if (res.success && res.data) {
        setOriginalAreaData(res.data)
        const transformedData = transformAreaData(res.data)
        setCustomCityData(transformedData)
      }
    })
  }, [])

  // 处理地区数据转换
  const transformAreaData = (data: any) => {
    return data.map((province: any) => ({
      text: province.name,
      value: province.id,
      children: province.children
        ? province.children.map((city: any) => ({
            text: city.name,
            value: city.id,
            children: city.children
              ? city.children.map((district: any) => ({
                  text: district.name,
                  value: district.id
                }))
              : []
          }))
        : []
    }))
  }

  // 根据地区ID查找完整路径
  const findAreaPath = (areaId: any, data: any, path = []) => {
    for (const province of data) {
      if (province.id === areaId) {
        return [...path, { id: province.id, name: province.name }]
      }

      if (province.children) {
        for (const city of province.children) {
          if (city.id === areaId) {
            return [...path, { id: province.id, name: province.name }, { id: city.id, name: city.name }]
          }

          if (city.children) {
            for (const district of city.children) {
              if (district.id === areaId) {
                return [...path, { id: province.id, name: province.name }, { id: city.id, name: city.name }, { id: district.id, name: district.name }]
              }
            }
          }
        }
      }
    }
    return null
  }

  useEffect(() => {
    if (form.areaId && originalAreaData.length > 0) {
      setAreaEcho(form.areaId, originalAreaData)
    }
  }, [form.areaId, originalAreaData])

  // 设置回显数据
  const setAreaEcho = (areaId: any, areaData: any) => {
    if (!areaId || !areaData.length) return

    const areaPath = findAreaPath(areaId, areaData)
    if (areaPath) {
      const valueArray: any = areaPath.map(item => item.id)
      const textArray = areaPath.map(item => item.name)
      setValue(valueArray)
      setSelectedAreaText(textArray.join(' '))
    }
  }

  // 改进的懒加载函数
  const loadCascaderItemData = (node: any, resolve: (data: any[]) => void) => {
    // 获取父节点ID，根节点使用0
    const parentId = node.value ? parseInt(node.value) : 0
    configCompanySectorAPI({ id: parentId }, res => {
      if (res.success) {
        const options = res.data.map(item => ({
          value: item.id.toString(),
          text: item.name,
          leaf: false // 先设为false，让组件自己判断
        }))
        resolve(options)
      } else {
        resolve([])
      }
    })
  }

  // 设置选择的地区值
  const setChooseValueCustom = (chooseValue: any) => {
    const valueArray = chooseValue.map((item: any) => item.value)
    setValue(valueArray)
    const selectedText = chooseValue.map((item: any) => item.text).join(' ')
    setSelectedAreaText(selectedText)
    const lastAreaId = valueArray[valueArray.length - 1]
    setForm({
      ...form,
      areaId: lastAreaId
    })

    setIsVisible(false)
  }

  // 处理级联选择器变化
  const onSectorChange = (value: string[], path: CascaderOption[]) => {
    setSectorValue(value)
    // 修复重复调用map的问题
    const pathTexts = path.map(item => item.text)
    const sectorNames = pathTexts[pathTexts.length - 1]
    setSectorDesc(sectorNames || '请选择行业')

    // 更新表单数据
    const lastSelected = value[value.length - 1]
    setForm({
      ...form,
      industryCategoryId: lastSelected,
      industryCategoryName: sectorNames || '请选择行业'
    })
  }

  // 处理企业类型选择
  // 在组件开始部分添加企业类型选中值状态
  const [companyTypeValue, setCompanyTypeValue] = useState<(string | number)[]>([])

  // 在useEffect中设置回显值
  useEffect(() => {
    configCompanyGetAPI({}, res => {
      if (res.success) {
        setForm(res.data)
        if (res.data.industryCategoryName) {
          setSectorDesc(res.data.industryCategoryName)
        }
        if (res.data.companyType) {
          // 根据接口返回的ID匹配companyTypes中的value，显示对应的text
          const matchedType = companyTypes.find(type => type.value === res.data.companyType)
          if (matchedType) {
            setCompanyTypeDesc(matchedType.text)
            setCompanyTypeValue([matchedType.value]) // 设置选中值用于回显
            setForm(prevForm => ({
              ...prevForm,
              companyType: matchedType.value
            }))
          } else {
            setCompanyTypeDesc('请选择企业类型')
          }
        }
        if (res.data.industryCategoryId) {
          setSectorValue([res.data.industryCategoryId.toString()])
        }
      }
    })
  }, [])

  // 修改onCompanyTypeChange函数
  const onCompanyTypeChange = (options: any[], value: (string | number)[]) => {
    const selectedType = options[0]?.text || ''
    setCompanyTypeDesc(selectedType)
    setCompanyTypeValue(value) // 更新选中值
    setForm({
      ...form,
      companyType: options[0]?.value
    })
    setCompanyTypeVisible(false)
  }

  // 处理输入
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
  }

  // 上传图片
  const handleUpload = async () => {
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

        // 开始上传
        await uploadFile(file.path)
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
  const uploadFile = async fileItem => {
    try {
      // 获取token
      const tokenData = Taro.getStorageSync('token')
      const token = tokenData?.accessToken

      // 使用Taro.uploadFile，它会自动处理FormData格式
      const uploadRes = await Taro.uploadFile({
        url: `${BASE_URL}/app-api/infra/file/upload`,
        filePath: fileItem!,
        name: 'file', // 这是FormData中的字段名
        header: {
          Authorization: `Bearer ${token}`,
          'tenant-id': '1'
        },
        formData: {
          // 这里的数据会自动转换为FormData格式
          fileName: fileItem
        },
        success: res => {
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
          setForm(prev => ({ ...prev, businessLicense: fileUrl }))
        },
        fail: error => {
          console.error('上传失败:', error)
        }
      })
    } catch (error) {
      console.error('上传文件失败:', error)
    }
  }

  // 删除图片
  const handleDeleteImg = () => {
    setForm({ ...form, businessLicense: '' })
    setLicensePreview('')
  }

  // 预览图片
  const handlePreviewImg = () => {
    if (form.businessLicense) {
      Taro.previewImage({
        current: form.businessLicense,
        urls: [form.businessLicense]
      })
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setTimeout(() => {
      setForm(initialData)
      setIsEdit(false)
      setLicensePreview('')
    }, 300)
  }

  // 保存提交
  const handleSave = () => {
    if (!form.companyName) {
      Taro.showToast({ title: '请输入企业名称', icon: 'none' })
      return
    }
    configCompanyUpdateAPI(form, res => {
      if (res.success) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setIsEdit(false)
      } else {
        Taro.showToast({ title: res.data.msg || '保存失败', icon: 'none' })
      }
    })
  }

  // 进入编辑
  const handleEdit = () => {
    setTimeout(() => {
      setIsEdit(true)
    }, 300)
  }

  return (
    <View className="enterprise-page">
      {/* 预览模式 */}
      {!isEdit && (
        <View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业名称</Text>
            <Text className="enterprise-content">{form.companyName || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业简称</Text>
            <Text className="enterprise-content">{form.companyShortName || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业电话</Text>
            <Text className="enterprise-content">{form.companyPhone || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业类型</Text>
            <Text className="enterprise-content">{companyTypeDesc || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">所属行业</Text>
            <Text className="enterprise-content">{form.industryCategoryName || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业详细地址</Text>
            <Text className="enterprise-content">{selectedAreaText || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">邮政编号</Text>
            <Text className="enterprise-content">{form.postalCode || '- -'}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业传真</Text>
            <Text className="enterprise-content">{form.fax || '- -'}</Text>
          </View>
          <View className="enterprise-row" style={{ marginBottom: '80rpx', alignItems: 'normal' }}>
            <Text className="enterprise-label">营业执照</Text>
            <View className="enterprise-content-disabled" style={{ paddingLeft: '20rpx' }}>
              {form.businessLicense ? <Image src={form.businessLicense} className="enterprise-businessLicense-img" onClick={handlePreviewImg} /> : '- -'}
            </View>
          </View>
          <View className="enterprise-btn-box">
            <Button className="enterprise-btn" onClick={handleEdit}>
              编辑信息
            </Button>
          </View>
        </View>
      )}
      {/* 编辑模式 */}
      {isEdit && (
        <View onClick={e => e.stopPropagation()}>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              <Text style={{ color: 'red' }}>*</Text>企业名称
            </Text>
            <Input className="enterprise-input" placeholder="请输入企业名称" value={form.companyName} onInput={e => handleChange('companyName', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业简称
            </Text>
            <Input className="enterprise-input" placeholder="请输入企业简称" value={form.companyShortName} onInput={e => handleChange('companyShortName', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业电话
            </Text>
            <Input className="enterprise-input" placeholder="请输入电话" value={form.companyPhone} onInput={e => handleChange('companyPhone', e.detail.value)} />
          </View>
          <View className="enterprise-row" onClick={() => setCompanyTypeVisible(true)}>
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业类型
            </Text>
            <View className="enterprise-show">
              <View className="text">{companyTypeDesc}</View>
              <ArrowRightSize6 color="#333" size="32rpx" />
            </View>
          </View>
          <View className="enterprise-row" onClick={() => setIsVisible(true)}>
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              所属行业
            </Text>
            <View className="enterprise-show">
              <View className="text">{selectedAreaText}</View>
              <ArrowRightSize6 color="#333" size="32rpx" />
            </View>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              邮政编号
            </Text>
            <Input className="enterprise-input" placeholder="请输入" value={form.postalCode} onInput={e => handleChange('postalCode', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业传真
            </Text>
            <Input className="enterprise-input" placeholder="请输入" value={form.fax} onInput={e => handleChange('fax', e.detail.value)} />
          </View>
          <View className="enterprise-row" style={{ marginBottom: '80rpx', alignItems: 'normal' }}>
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              营业执照
            </Text>
            <View className="enterprise-content-disabled" style={{ display: 'flex', alignItems: 'center', marginLeft: '32rpx' }}>
              {form.businessLicense ? (
                <>
                  <Image src={form.businessLicense} className="enterprise-img" onClick={handleUpload} />
                  <View className="enterprise-delete" onClick={handleDeleteImg}>
                    ×
                  </View>
                </>
              ) : (
                <View className="enterprise-upload" onClick={handleUpload}>
                  +
                </View>
              )}
            </View>
          </View>
          <View className="enterprise-btn-box">
            <Button className="enterprise-btn-cancel" onClick={handleCancel}>
              取消
            </Button>
            <Button className="enterprise-btn" onClick={handleSave}>
              保存提交
            </Button>
          </View>
        </View>
      )}
      <Picker visible={isVisible} options={customCityData} value={value} onClose={() => setIsVisible(false)} onConfirm={setChooseValueCustom} />
      <Picker visible={companyTypeVisible} options={[companyTypes]} value={companyTypeValue} onClose={() => setCompanyTypeVisible(false)} onConfirm={onCompanyTypeChange} title="选择企业类型" />
      {/* Cascader 组件 */}
      <Cascader visible={sectorVisible} defaultValue={sectorValue} title="选择行业" closeable onClose={() => setSectorVisible(false)} onChange={onSectorChange} lazy onLoad={loadCascaderItemData} />
    </View>
  )
}

export default Index
