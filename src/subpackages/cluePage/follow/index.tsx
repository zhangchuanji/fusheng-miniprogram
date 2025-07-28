import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import './index.scss'
function FollowPage() {
  return (
    <View className="followPage">
      <ScrollView className="follow-container">
        {/* 顶部跟进摘要 */}
        <View className="follow-summary">
          <View className="user-info">
            <View className="avatar-section">
              <Image className="avatar" src="/assets/avatar.png" />
              <View className="user-details">
                <Text className="user-name">张经理</Text>
                <Text className="user-role">销售经理</Text>
              </View>
            </View>
            <View className="status-section">
              <Text className="status-text">跟进 (到访)</Text>
            </View>
          </View>

          <View className="feedback-box">
            <Text className="feedback-text">客户对产品意向很高,但是希望有优惠</Text>
          </View>

          <View className="timestamp-section">
            <Image src={require('@/assets/chat/chat1.png')} className="timestamp-img" />
            <Text className="timestamp">2023-09-09 14:09</Text>
          </View>

          <View className="lead-source">
            <Text className="lead-text">来自线索:郑州空气锚有限公司</Text>
          </View>
        </View>

        {/* 中间详细信息 */}
        <View className="detail-section">
          <View className="section-title">
            <Text className="title-text">更多信息</Text>
          </View>

          <View className="detail-list">
            <View className="detail-item">
              <Text className="item-label">跟进类型</Text>
              <Text className="item-value">客户跟进</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进方式</Text>
              <Text className="item-value">到访</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进时间</Text>
              <Text className="item-value">2024-09-09 19:00</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进内容</Text>
              <Text className="item-value">跟进描述</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">线索名称</Text>
              <Text className="item-value link">郑州空气猫有限公司</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">联系人</Text>
              <Text className="item-value link">狮子</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">相关附件</Text>
              <Text className="item-value link">附件.doc</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">评论数量</Text>
              <Text className="item-value">10条</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进人员</Text>
              <Text className="item-value">包子</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">创建时间</Text>
              <Text className="item-value">2024-09-09 19:00</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View className="action-buttons">
        <View className="edit-btn">
          <Image src={require('@/assets/chat/chat3.png')} className="btn-icon" />
          <Text className="btn-text">编辑记录</Text>
        </View>
        <View className="delete-btn">
          <Image src={require('@/assets/chat/chat2.png')} className="btn-icon" />
          <Text className="btn-text">删除任务</Text>
        </View>
      </View>
    </View>
  )
}

export default FollowPage
