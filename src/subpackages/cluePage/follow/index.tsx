import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { clueFollowUpDetailAPI, clueFollowUpDeleteAPI } from '@/api/clue'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useSelector } from 'react-redux'

import './index.scss'
function FollowPage() {
  const [followUpDetail, setFollowUpDetail] = useState<any>({})
  const [followUpId, setFollowUpId] = useState<string>('') // 新增：保存跟进ID
  const userInfo = useSelector((state: any) => state.login.userInfo)

  const navigateToEditPage = () => {
    Taro.navigateTo({
      url: `/subpackages/cluePage/editFollow/index?item=${followUpDetail.id}`
    })
  }

  const deleteFollowUp = () => {
    Taro.showModal({
      title: '删除跟进',
      content: '确定删除跟进吗？',
      success: res => {
        if (res.confirm) {
          clueFollowUpDeleteAPI({ id: followUpDetail.id }, res => {
            if (res.success) {
              Taro.showToast({
                title: '删除成功',
                icon: 'none'
              })
              Taro.navigateBack()
            }
          })
        }
      }
    })
  }

  function parseDate(createTime: any): React.ReactNode {
    let time = new Date(createTime)
    // 转为2025-01-01 12:00:00
    let year = time.getFullYear()
    let month = time.getMonth() + 1
    let day = time.getDate()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let second = time.getSeconds()
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  // 获取跟进详情的函数
  const fetchFollowUpDetail = useCallback((id: string) => {
    clueFollowUpDetailAPI(
      {
        id: id
      },
      res => {
        if (res.success) {
          setFollowUpDetail(res.data)
        }
      }
    )
  }, [])

  useLoad(options => {
    const item = options.item
    setFollowUpId(item) // 保存ID
    fetchFollowUpDetail(item)
  })

  // 新增：页面显示时刷新数据
  useDidShow(() => {
    if (followUpId) {
      fetchFollowUpDetail(followUpId)
    }
  })

  return (
    <View className="followPage">
      <ScrollView className="follow-container">
        {/* 顶部跟进摘要 */}
        <View className="follow-summary">
          <View className="user-info">
            <View className="avatar-section">
              <Image className="avatar" src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" />
              <View className="user-details">
                <Text className="user-name">{userInfo?.nickname}</Text>
                <Text className="user-role">{userInfo?.position || '职位'}</Text>
              </View>
            </View>
            <View className="status-section">
              {followUpDetail.type || '跟进类型'}（{followUpDetail.method || '跟进方式'})
            </View>
          </View>

          <View className="feedback-box">
            <Text className="feedback-text">{followUpDetail?.content || '跟进内容'}</Text>
          </View>

          <View className="timestamp-section">
            <Image src="http://36.141.100.123:10013/glks/assets/chat/chat1.png" className="timestamp-img" />
            <Text className="timestamp">{parseDate(followUpDetail?.createTime) || '跟进时间'}</Text>
          </View>

          <View className="lead-source">
            <Text className="lead-text">来自线索:{followUpDetail?.followUpCompany?.name || '线索名称'}</Text>
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
              <Text className="item-value"> {followUpDetail.type || '跟进类型'}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进方式</Text>
              <Text className="item-value">{followUpDetail.method || '跟进方式'}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进时间</Text>
              <Text className="item-value">{followUpDetail?.followUpTime}天</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">跟进内容</Text>
              <Text className="item-value">{followUpDetail?.content || '跟进描述'}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">线索名称</Text>
              <Text className="item-value link">{followUpDetail?.followUpCompany?.name || '线索名称'}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">联系人</Text>
              <Text className="item-value link">{followUpDetail?.followUpCompany?.contact || '联系人'}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">相关附件</Text>
              {followUpDetail?.followUpFileList?.length > 0 && (
                <>
                  <Text className="item-value link">{followUpDetail.followUpFileList[0]?.name || '附件'}</Text>
                  {followUpDetail.followUpFileList.length > 1 && <Text style={{ color: '#2156FE', fontSize: '28rpx', fontWeight: '500', marginLeft: '14rpx' }}>(+{followUpDetail.followUpFileList.length - 1})</Text>}
                </>
              )}
              {followUpDetail?.followUpFileList?.length === 0 && <Text className="item-value link">暂无附件</Text>}
            </View>

            {/* <View className="detail-item">
              <Text className="item-label">评论数量</Text>
              <Text className="item-value">- -</Text>
            </View> */}

            <View className="detail-item">
              <Text className="item-label">跟进人员</Text>
              <Text className="item-value">{userInfo?.nickname}</Text>
            </View>

            <View className="detail-item">
              <Text className="item-label">创建时间</Text>
              <Text className="item-value">{parseDate(followUpDetail?.createTime) || '创建时间'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View className="action-buttons">
        <View className="edit-btn" onClick={() => navigateToEditPage()}>
          <Image src="http://36.141.100.123:10013/glks/assets/chat/chat3.png" className="btn-icon" />
          <Text className="btn-text">编辑记录</Text>
        </View>
        <View className="delete-btn" onClick={() => deleteFollowUp()}>
          <Image src="http://36.141.100.123:10013/glks/assets/chat/chat2.png" className="btn-icon" />
          <Text className="btn-text">删除任务</Text>
        </View>
      </View>
    </View>
  )
}

export default FollowPage
