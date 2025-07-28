import React, { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const initialData = {
  name: '空气猫有限公司',
  shortName: 'Europa',
  phone: '0755-88888888',
  type: '私营企业',
  industry: '电子商务',
  address: '广东省深圳市南山区',
  postcode: '4324325',
  fax: '518000',
  license: '' // 营业执照图片url
}

function Index() {
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState(initialData)
  const [licensePreview, setLicensePreview] = useState('')

  // 处理输入
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
  }

  // 上传图片
  const handleUpload = () => {
    Taro.chooseImage({
      count: 1,
      success: res => {
        setForm({ ...form, license: res.tempFilePaths[0] })
        setLicensePreview(res.tempFilePaths[0])
      }
    })
  }

  // 删除图片
  const handleDeleteImg = () => {
    setForm({ ...form, license: '' })
    setLicensePreview('')
  }

  // 预览图片
  const handlePreviewImg = () => {
    if (form.license) {
      Taro.previewImage({
        current: form.license,
        urls: [form.license]
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
    if (!form.name) {
      Taro.showToast({ title: '请输入企业名称', icon: 'none' })
      return
    }
    // 这里可以提交API或校验，保存成功提示但不退出编辑模式
    Taro.showToast({ title: '保存成功', icon: 'success' })
    // 不 setIsEdit(false)
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
            <Text className="enterprise-content">{form.name}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业简称</Text>
            <Text className="enterprise-content">{form.shortName}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业电话</Text>
            <Text className="enterprise-content">{form.phone}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业类型</Text>
            <Text className="enterprise-content">{form.type}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">所属行业</Text>
            <Text className="enterprise-content">{form.industry}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业详细地址</Text>
            <Text className="enterprise-content">{form.address}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">邮政编号</Text>
            <Text className="enterprise-content">{form.postcode}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">企业传真</Text>
            <Text className="enterprise-content">{form.fax}</Text>
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label">营业执照</Text>
            <View className="enterprise-content-disabled">{form.license ? <Image src={form.license} className="enterprise-license-img" onClick={handlePreviewImg} /> : '- -'}</View>
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
            <Input className="enterprise-input" placeholder="请输入企业名称" value={form.name} onInput={e => handleChange('name', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业简称
            </Text>
            <Input className="enterprise-input" placeholder="请输入企业简称" value={form.shortName} onInput={e => handleChange('shortName', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业电话
            </Text>
            <Input className="enterprise-input" placeholder="请输入电话" value={form.phone} onInput={e => handleChange('phone', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业类型
            </Text>
            <Input className="enterprise-input" placeholder="请选择" value={form.type} onInput={e => handleChange('type', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              所属行业
            </Text>
            <Input className="enterprise-input" placeholder="请选择" value={form.industry} onInput={e => handleChange('industry', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业详细地址
            </Text>
            <Input className="enterprise-input" placeholder="请选择" value={form.address} onInput={e => handleChange('address', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              邮政编号
            </Text>
            <Input className="enterprise-input" placeholder="请输入" value={form.postcode} onInput={e => handleChange('postcode', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              企业传真
            </Text>
            <Input className="enterprise-input" placeholder="请输入" value={form.fax} onInput={e => handleChange('fax', e.detail.value)} />
          </View>
          <View className="enterprise-row">
            <Text className="enterprise-label" style={{ color: '#333333' }}>
              营业执照
            </Text>
            <View className="enterprise-content-disabled" style={{ display: 'flex', alignItems: 'center' }}>
              {form.license ? (
                <>
                  <Image src={form.license} className="enterprise-license-img" onClick={handleUpload} />
                  <Text style={{ color: '#FF1818', fontSize: '40rpx', marginLeft: '12rpx', cursor: 'pointer' }} onClick={handleDeleteImg}>
                    ×
                  </Text>
                </>
              ) : (
                <View className="enterprise-license-upload" onClick={handleUpload}>
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
    </View>
  )
}

export default Index
