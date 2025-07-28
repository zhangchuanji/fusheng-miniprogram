import React, { useState, useRef, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

function Index() {
  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-title">
          共<Text style={{ color: '#2156FE' }}>20</Text>个核心成员
        </View>
      </View>

      <View className="content-item">
        <View className="item-top">
          <View className="item-top-name">刘录刚</View>
          <View className="item-top-position">执行董事</View>
        </View>
        <View className="item-bottom">
          <View className="item-bottom-title">简介：</View>
          <EllipsisText content="张心强，男，1996年出生，中国国籍，无境外居留权，中共党员，本科学历，高级工程师。曾担任国际层压板材料有限公司总经理助理曾担任国际层压板材压板际层压板材压板层压板材压" />
        </View>
      </View>
    </View>
  )
}

// 新增可展开文本组件
function EllipsisText({ content }) {
  const [showModal, setShowModal] = useState(false)
  const previewLen = 70 // 让内容足够撑满三行

  return (
    <View className="item-bottom-position">
      <Text className="desc-text">
        {content.length > previewLen ? content.slice(0, previewLen) + '...' : content}
        {content.length > previewLen && (
          <Text className="see-more" onClick={() => setShowModal(true)}>
            查看更多
          </Text>
        )}
      </Text>
      {showModal && (
        <View className="modal-mask">
          <View className="modal-content">
            <View className="modal-title">简介</View>
            <View className="modal-body">{content}</View>
            <View className="modal-close-btn" onClick={() => setShowModal(false)}>
              关闭
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default Index
