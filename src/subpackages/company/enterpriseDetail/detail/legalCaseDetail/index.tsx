import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const [stepsList, setStepsList] = useState([1, 2, 3])
  return (
    <View className="detailPage">
      <View className="enterprise-card">
        <View className="enterprise-title">中山大某电机股份有限公司、东莞中汽宏某汽车有限公司买卖合同纠纷民事一审民事判决书</View>
        <View className="enterprise-tag-box">
          <View className="enterprise-tag">民事案件</View>
        </View>
      </View>
      <View className="header">案件进程</View>
      <View className="card">
        <View className="card-title">民事一审</View>
        <View className="card-content">
          <View className="title-con">法律诉讼</View>
          <View className="text-con">
            案号：<Text style={{ color: '#333333' }}>65464747574</Text>
          </View>
          <View className="text-con">
            案由：<Text style={{ color: '#333333' }}>- -</Text>
          </View>
          <View className="text-con">
            原告：<Text style={{ color: '#333333' }}>西安经发城市服务有限公司</Text>
          </View>
          <View className="text-con">
            被告：<Text style={{ color: '#333333' }}>西安经发城市服务有限公司</Text>
          </View>
          <View className="text-con">
            法院：<Text style={{ color: '#333333' }}>中山第一人民法院</Text>
          </View>
          <View className="text-con-value">
            <View className="steps-list">
              {stepsList.map((item, index) => {
                return (
                  <View className="steps-item">
                    <View className="steps-item-dot">
                      <View className="steps-item-dot-icon"></View>
                      {index !== stepsList.length - 1 && <View className="steps-item-dot-line"></View>}
                    </View>
                    <View className="steps-item-title">
                      <View className="steps-item-title-time">2025-01-01</View>
                      <View className="steps-item-title-text">立案</View>
                    </View>
                  </View>
                )
              })}
              <View className="steps-bottom">
                <View className="steps-bottom-title">
                  <View className="steps-bottom-left">裁判结果：</View>
                  <View
                    className="steps-bottom-right"
                    onClick={() => {
                      Taro.navigateTo({
                        url: '/subpackages/company/enterpriseDetail/detail/judgmentDetail/index'
                      })
                    }}
                  >
                    查看判决原文
                    <ArrowRightSize6 color="#1B5BFF" size={'22rpx'} />
                  </View>
                </View>
                <View className="steps-bottom-content">
                  <EllipsisText content="区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公" />
                </View>
              </View>
            </View>
          </View>
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
