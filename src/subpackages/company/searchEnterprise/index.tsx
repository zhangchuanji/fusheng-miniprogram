import React, { useEffect, useState, useCallback } from 'react'
import { Checkbox, InfiniteLoading, Radio, Popup, Cell, Button, Tabs, TextArea, SearchBar } from '@nutui/nutui-react-taro'
import { View, Image, Text } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { options } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'

function Index() {
  // ==================== 搜索相关状态 ====================
  const [searchValue, setSearchValue] = useState('') // 搜索关键词
  const [headerHeight, setHeaderHeight] = useState(0) // 头部高度

  // ==================== 列表数据状态 ====================
  const [customHasMore, setCustomHasMore] = useState(true) // 是否还有更多数据
  const [customList, setCustomList] = useState<any[]>([{}, {}]) // 企业列表数据

  // ==================== 弹窗显示状态 ====================
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [isShowAddress, setIsShowAddress] = useState(false) // 工厂地址弹窗
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗

  // ==================== 线索操作状态 ====================
  const [isShowAdd, setIsShowAdd] = useState(true) // 是否显示加入线索按钮
  const [dialogType, setDialogType] = useState<'add' | 'remove'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [isLiked, setIsLiked] = useState(false) // 是否已点赞
  const [isDisliked, setIsDisliked] = useState(false) // 是否已点踩
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

  // ==================== 标签页相关状态 ====================
  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页
  const [tabList, setTabList] = useState([
    { id: 1, name: '手机号 148' },
    { id: 2, name: '固话 148' },
    { id: 3, name: '邮箱 148' },
    { id: 4, name: '地址 148' },
    { id: 5, name: '其他 148' }
  ]) // 标签页列表

  // ==================== 反馈相关状态 ====================
  const [feedBackValue, setFeedBackValue] = useState('') // 反馈内容

  // ==================== 工具函数 ====================
  // 使用 useCallback 优化高亮关键词函数
  const highlightKeyword = useCallback((text: string, keyword: string) => {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={{ color: '#426EFF', fontWeight: 'bold' }}>
          {part}
        </Text>
      ) : (
        part
      )
    )
  }, [])

  // 延迟函数
  const sleep = (time: number): Promise<unknown> =>
    new Promise(resolve => {
      setTimeout(resolve, time)
    })

  // ==================== 事件处理函数 ====================
  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 4) {
      setIsShowPhone(true)
    }
    if (index === 5) {
      setIsShowAddress(true)
    }
  }

  // 处理搜索
  const handleSearch = () => {
    console.log(searchValue)
  }

  // ==================== 点赞点踩处理函数 ====================
  // 处理点赞点击
  const handleLike = (e: any) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)

    // 触发心跳动画
    if (!isLiked) {
      setShowHeartbeat(true)
      setTimeout(() => {
        setShowHeartbeat(false)
      }, 600)
    }
  }

  // 处理点踩点击
  const handleDislike = (e: any) => {
    // 触发抖动动画
    setShowShake(true)
    setTimeout(() => {
      setShowShake(false)
    }, 500)
    if (isDisliked) {
      setIsShowInvalid(true)
    } else {
      setIsShowFeedback(true)
    }
  }

  // ==================== 线索操作处理函数 ====================
  // 处理加入线索点击
  const handleAddToLeads = (e: any) => {
    e.stopPropagation()
    setDialogType('add')
    setShowCustomDialog(true)
  }

  // 处理移除线索点击
  const handleRemoveFromLeads = (e: any) => {
    e.stopPropagation()
    setDialogType('remove')
    setShowCustomDialog(true)
  }

  // 处理确认弹窗
  const handleDialogConfirm = () => {
    setShowCustomDialog(false)
    if (dialogType === 'add') {
      setIsShowAdd(false)
      Taro.showToast({
        title: '已添加线索',
        icon: 'none',
        duration: 500
      })
    } else {
      setIsShowAdd(true)
      Taro.showToast({
        title: '已移除线索',
        icon: 'none',
        duration: 500
      })
    }
  }

  // 处理取消弹窗
  const handleDialogCancel = () => {
    setShowCustomDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 恢复操作处理函数 ====================
  // 处理恢复确认
  const handleRestoreConfirm = () => {
    setShowRestoreDialog(false)
    setIsShowInvalid(false)
    setIsDisliked(false)
    Taro.showToast({
      title: '已恢复',
      icon: 'none',
      duration: 500
    })
  }

  // 处理恢复取消
  const handleRestoreCancel = () => {
    setShowRestoreDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 反馈处理函数 ====================
  // 处理反馈内容变化
  const changeTextArea = useCallback((value: string) => {
    setFeedBackValue(value)
  }, [])

  // 处理提交反馈
  const handleSubmitFeedback = () => {
    setIsShowFeedback(false)
    setIsDisliked(!isDisliked)
    setFeedBackValue('')
    Taro.showToast({
      title: '提交成功',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 数据加载函数 ====================
  // 自定义加载更多数据
  const customLoadMore = async () => {
    await sleep(10000)
    setCustomList([...customList, {}, {}, {}, {}, {}, {}, {}, {}, {}])
    setCustomHasMore(false)
  }

  // ==================== 生命周期钩子 ====================
  // 初始化页面尺寸
  useEffect(() => {
    const query = Taro.createSelectorQuery()

    query.select('.headerSearch').boundingClientRect(rect => {
      if (rect && 'height' in rect) {
        setHeaderHeight(rect.height)
      }
    })
    query.exec()
  }, [])

  return (
    <View className="searchEnterprisePage">
      {/* 自定义弹窗 */}
      <CustomDialog visible={showCustomDialog} title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : '您确定要将该线索移除线索池吗？'} content={dialogType === 'add' ? '标记后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'} onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />

      {/* 恢复弹窗 */}
      <CustomDialog visible={showRestoreDialog} title="您确定要恢复该线索吗？" content="恢复后该线索可以重新选择匹配与不匹配" onConfirm={handleRestoreConfirm} onCancel={handleRestoreCancel} />

      {/* 无效线索原因 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowInvalid} onClose={() => setIsShowInvalid(false)}>
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image onClick={() => setIsShowInvalid(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="invalid_content">不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

      {/* 联系人 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowPhone} onClose={() => setIsShowPhone(false)}>
        <View className="popup_header">
          <View className="popup_header_title">联系人</View>
          <Image onClick={() => setIsShowPhone(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <Tabs
          value={tabValue}
          onChange={(value: number) => {
            setTabValue(value)
          }}
        >
          {tabList.map(item => (
            <Tabs.TabPane key={item.id} title={item.name}>
              {tabValue === 0 && (
                <>
                  <View className="tab_content">
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                      </View>
                    </View>
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                      </View>
                    </View>
                    <View className="tab_content_item">
                      <View className="tab_content_item_one">
                        <View className="modile">13355557676</View>
                        <View className="recommend">推荐</View>
                      </View>
                      <View className="tab_content_item_two">
                        <View className="name">王紫郡</View>
                        <View className="position">总经理</View>
                        <View className="security">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                          <View className="security_dot"></View>
                          <View className="security_text">未检测</View>
                        </View>
                      </View>
                      <View className="tab_content_item_three">
                        <Text style={{ color: '#333333' }}>来自：</Text>杭州XX科技有限公司
                      </View>
                      <View className="tab_content_item_four">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                      </View>
                    </View>
                  </View>
                </>
              )}
              {tabValue === 1 && (
                <>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                  <View>固话内容</View>
                </>
              )}
              {tabValue === 2 && (
                <>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                  <View>邮箱内容</View>
                </>
              )}
              {tabValue === 3 && (
                <>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                  <View>地址内容</View>
                </>
              )}
              {tabValue === 4 && (
                <>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
                  <View>其他内容</View>
                </>
              )}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Popup>

      {/* 工厂地址 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowAddress} onClose={() => setIsShowAddress(false)}>
        <View className="popup_header">
          <View className="popup_header_title">工厂地址</View>
          <Image onClick={() => setIsShowAddress(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="address_content">
          <Cell.Group>
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
            <Cell align="center" title="公司总部地址" description="中国(上海)自由贸易试验区临港新片区江山路" />
          </Cell.Group>
        </View>
      </Popup>

      {/* 反馈 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowFeedback} onClose={() => setIsShowFeedback(false)}>
        <View className="popup_header">
          <View className="popup_header_title" style={{ fontSize: '40rpx', color: '#333333', textAlign: 'left', paddingLeft: '24rpx' }}>
            反馈-不匹配/不合适
          </View>
          <Image onClick={() => setIsShowFeedback(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="feedBack_content">
          <Checkbox.Group defaultValue={['1']} style={{ width: '100%', padding: '24rpx', boxSizing: 'border-box' }}>
            <Checkbox value="1" label="产品不匹配" />
            <Checkbox value="2" label="公司与信息匹配不上" />
            <Checkbox value="3" label="公司类型错误" />
            <Checkbox value="4" label="贸易公司" />
            <Checkbox value="5" label="公司经营问题" />
          </Checkbox.Group>
          <View className="feedBack_content_footer">
            <View className="feedBack_content_footer_text">其他原因（选填）</View>
            <View className="feedBack_content_footer_input">
              <TextArea cursorSpacing={100} value={feedBackValue} onChange={changeTextArea} placeholder="请输入备注" autoSize maxLength={500} showCount={false} adjustPosition={true} />
            </View>
          </View>
          <View className="feedBack_content_footer_text">您的反馈有助于我们改进数据更精准</View>
          <View className="feedBack_content_footer_bottom">
            <View className="feedBack_cancel" onClick={() => setIsShowFeedback(false)}>
              取消
            </View>
            <View className="feedBack_submit" onClick={() => handleSubmitFeedback()}>
              提交反馈
            </View>
          </View>
        </View>
      </Popup>

      {/* 头部搜索区域 */}
      <View className="headerSearch">
        <SearchBar placeholder="搜企业、搜索内容" value={searchValue} onChange={setSearchValue} onSearch={handleSearch} />
      </View>

      {/* 筛选内容区域 */}
      <View className="enterpriseContent" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        <InfiniteLoading
          target="enterpriseContent"
          loadingText={
            <>
              <View className="loadingText">
                <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="loadingImg" />
                <Text className="loading-char">l</Text>
                <Text className="loading-char">o</Text>
                <Text className="loading-char">a</Text>
                <Text className="loading-char">d</Text>
                <Text className="loading-char">i</Text>
                <Text className="loading-char">n</Text>
                <Text className="loading-char">g</Text>
                <Text className="loading-char">.</Text>
                <Text className="loading-char">.</Text>
                <Text className="loading-char">.</Text>
              </View>
            </>
          }
          loadMoreText="没有啦～"
          hasMore={customHasMore}
          onLoadMore={customLoadMore}
        >
          {customList.map((item, index) => (
            <View key={index}>
              <View className="enterpriseContent_item">
                <View className="enterpriseContent_item_top">
                  <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="enterpriseContent_item_Img" />
                  <View className="enterpriseContent_item_Text">
                    <View className="title">杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司杭州XX科技有限公司</View>
                    <View className="description">
                      <View className="certification">
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise3.png" className="certification_img" />
                        <View className="certification_text">认证</View>
                      </View>
                      <View className="match">匹配80%</View>
                    </View>
                  </View>
                </View>
                <View className="enterpriseContent_item_tag">
                  <View className="enterpriseContent_item_tag_item">存续</View>
                  <View className="enterpriseContent_item_tag_item">省级制造业单项冠军企业</View>
                  <View className="enterpriseContent_item_tag_item">高新企业</View>
                  <View className="enterpriseContent_item_tag_item">展开</View>
                </View>
                <View className="enterpriseContent_item_info">
                  <View className="enterpriseContent_item_info_item">郭雄</View>
                  <View className="enterpriseContent_item_info_item">10000万人民币</View>
                  <View className="enterpriseContent_item_info_item">2003-11-10</View>
                  <View className="enterpriseContent_item_info_item">深圳</View>
                </View>
                <View className="enterpriseContent_item_product">
                  <View className={`enterpriseContent_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{highlightKeyword('产品与服务：柴油发电机组、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机、驱动电机、新能源发电机、高新能源发电机', searchValue || '电机')}</View>
                  <View className="enterpriseContent_item_product_right" onClick={() => setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))}>
                    {expandedProducts[index] ? '收起' : '展开'}
                  </View>
                </View>
                <View className="enterpriseContent_item_contact">
                  <View className="enterpriseContent_item_contact_item">
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise5.png" className="enterpriseContent_item_contact_item_img" />
                  </View>
                  <View onClick={() => handleActiveIndex(4)} className="enterpriseContent_item_contact_item">
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise1.png" className="enterpriseContent_item_contact_item_img" />
                    电话(112)
                  </View>
                  <View onClick={() => handleActiveIndex(5)} className="enterpriseContent_item_contact_item">
                    <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise2.png" className="enterpriseContent_item_contact_item_img" />
                    地址(2)
                  </View>
                </View>
                <View className="enterpriseContent_item_bottom">
                  <View className="enterpriseContent_item_bottom_left">
                    {!isDisliked && (
                      <View onClick={handleLike} className={`enterpriseContent_item_bottom_left_good ${isLiked ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png" className="enterpriseContent_item_bottom_left_good_img" />
                        <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
                      </View>
                    )}
                    {!isLiked && (
                      <View onClick={handleDislike} className={`enterpriseContent_item_bottom_left_bad ${isDisliked ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
                        <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png" className="enterpriseContent_item_bottom_left_bad_img" />
                        <Text className="enterpriseContent_item_bottom_left_bad_text">无效线索</Text>
                        {isDisliked && <ArrowDown color="#8E8E8E" style={{ width: '28rpx', height: '28rpx', marginLeft: '6rpx' }} />}
                      </View>
                    )}
                  </View>
                  {isShowAdd ? (
                    <View onClick={handleAddToLeads} className="enterpriseContent_item_bottom_right">
                      <Add color="#fff" style={{ marginRight: '12rpx', width: '32rpx', height: '32rpx' }} />
                      <Text className="enterpriseContent_item_bottom_right_add_text">加入线索</Text>
                    </View>
                  ) : (
                    <View onClick={handleRemoveFromLeads} className="remove">
                      <Text className="remove_text">移除</Text>
                      <View className="remove_icon"></View>
                    </View>
                  )}
                </View>
              </View>
              <View className="enterpriseContent_divider" />
            </View>
          ))}
        </InfiniteLoading>
      </View>
    </View>
  )
}

export default Index
