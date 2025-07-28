import React, { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import {} from '@nutui/nutui-react-taro'
import './index.scss'

function Index() {
  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-title">登记信息</View>
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row-title">法定代表人</View>
          <View className="row-value" style={{ fontSize: '32rpx', color: '#426EFF' }}>
            刘录刚
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">成立日期</View>
            <View className="row-left-value">2002-09-09</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">企业经营状态</View>
            <View className="row-right-value">存续</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">注册资本</View>
            <View className="row-left-value">40450万人民币</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">实缴资本</View>
            <View className="row-right-value">35450.00人民币</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">所属行业</View>
            <View className="row-value">制造业</View>
          </View>
        </View>
      </View>

      <View className="content">
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">统一社会信用代码</View>
            <View className="row-left-value">91440101100006899U</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">工商注册号</View>
            <View className="row-right-value">440108000000021</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">企业类型</View>
            <View className="row-left-value">其他股份有限公司(上市)</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">组织机构代码</View>
            <View className="row-right-value">10000032</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">参保人数</View>
            <View className="row-left-value">123</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">员工人数</View>
            <View className="row-right-value">1032</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">纳税人识别号</View>
            <View className="row-left-value">91440101100006899U</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">纳税人资质</View>
            <View className="row-right-value">增值税一般纳税人</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">进出口企业代码</View>
            <View className="row-left-value">12412412</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">海关注册编码</View>
            <View className="row-right-value">10000032</View>
          </View>
        </View>
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">经营期限</View>
            <View className="row-value">2002-09-09 至 无固定期限</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">核准日期</View>
            <View className="row-left-value">2002-09-09</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">登记机关</View>
            <View className="row-right-value">广州市市场监督管理局</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">曾用名</View>
            <View className="row-value">921</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">英文名</View>
            <View className="row-value">sqdwwqfqf</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">经营范围</View>
            <View className="row-value">经营范围经营范围经营范围经营范围经营范围经营范围经营范围经营范围经营范围经营范围</View>
          </View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">联系方式</View>
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Index
