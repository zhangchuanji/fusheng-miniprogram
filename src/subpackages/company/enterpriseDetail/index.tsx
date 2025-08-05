import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Checkbox, Popup, Tabs, TextArea } from '@nutui/nutui-react-taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import { enterpriseDetailAPI } from '@/api/company'
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'

function Index() {
  // 企业信息数据，提取自图片（无children）
  const [enterpriseInfo, setEnterpriseInfo] = useState([
    { title: '工商信息', value: 67, router: '/subpackages/company/enterpriseDetail/detail/businessInfo/index' },
    { title: '股东信息', value: 1, router: '/subpackages/company/enterpriseDetail/detail/shareholderInfo/index' },
    { title: '人员信息', value: 1, router: '/subpackages/company/enterpriseDetail/detail/personnelInfo/index' },
    { title: '核心人员', value: 67, router: '/subpackages/company/enterpriseDetail/detail/corePersonnel/index' },
    { title: '工商变更', value: 1, router: '/subpackages/company/enterpriseDetail/detail/businessChange/index' },
    { title: '企业年报', value: 1, router: '/subpackages/company/enterpriseDetail/detail/annualReport/index' },
    { title: '对外投资', value: 67, router: '/subpackages/company/enterpriseDetail/detail/foreignInvestment/index' },
    { title: '分支机构', value: 1, router: '/subpackages/company/enterpriseDetail/detail/branchOffice/index' },
    { title: '实际控制人', value: 1, router: '/subpackages/company/enterpriseDetail/detail/actualController/index' },
    { title: '实际控制权', value: 67, router: '/subpackages/company/enterpriseDetail/detail/actualControl/index' },
    { title: '直接控制企业', value: 1, router: '/subpackages/company/enterpriseDetail/detail/directControl/index' },
    { title: '工商自主公示', value: 1, router: '/subpackages/company/enterpriseDetail/detail/businessPublicity/index' },
    { title: '协同股东', value: 67, router: '/subpackages/company/enterpriseDetail/detail/cooperativeShareholder/index' },
    { title: '间接持股企业', value: 1, router: '/subpackages/company/enterpriseDetail/detail/indirectHolding/index' },
    { title: '疑似关系', value: 1, router: '/subpackages/company/enterpriseDetail/detail/suspectedRelation/index' },
    { title: '企业产品', value: 67, router: '/subpackages/company/enterpriseDetail/detail/enterpriseProduct/index' },
    { title: '同业分析', value: 1, router: '/subpackages/company/enterpriseDetail/detail/industryAnalysis/index' }
  ])
  const [company, setCompany] = useState<any>({})
  const [companyDetail, setCompanyDetail] = useState<any>({
    similarCompanies: [],
    enterpriseResponses: [],
    companyHotResultResponse: []
  })
  // ==================== 弹窗显示状态 ====================
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗
  const [showBusinessIntelligence, setShowBusinessIntelligence] = useState(false) // 商机情报弹窗
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [showPopup, setShowPopup] = useState(false) // 商机情报弹窗
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他

  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页
  const [allContactInformation, setAllContactInformation] = useState(0) // 全部联系数量
  const tabList = useMemo(
    () => [
      { id: 1, name: `手机号 ${phoneInfo?.length || 0}` },
      { id: 2, name: `固话 ${fixedLines?.length || 0}` },
      { id: 3, name: `邮箱 ${emails?.length || 0}` },
      { id: 4, name: `地址 ${address?.length || 0}` },
      { id: 5, name: `其他 ${others?.length || 0}` }
    ],
    [phoneInfo, fixedLines, emails, address, others]
  )

  // ==================== 线索操作状态 ====================
  const [isShowAdd, setIsShowAdd] = useState(true) // 是否显示加入线索按钮
  const [dialogType, setDialogType] = useState<'add' | 'remove'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [isLiked, setIsLiked] = useState(false) // 是否已点赞
  const [isDisliked, setIsDisliked] = useState(false) // 是否已点踩
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

  // ==================== 内容展开状态 ====================
  const [expandedCompanyScale, setExpandedCompanyScale] = useState(false) // 企业规模展开状态
  const [expandedCompanyIntro, setExpandedCompanyIntro] = useState(false) // 企业简介展开状态

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

  // 更安全的时间戳转换函数，包含错误处理
  const formatTimestamp = (timestamp: number | string) => {
    try {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      if (isNaN(date.getTime())) return '--'

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('时间戳转换错误:', error)
      return '--'
    }
  }

  // 处理确认弹窗
  const handleDialogConfirm = () => {
    setShowCustomDialog(false)
    if (dialogType === 'add') {
      setIsShowAdd(false)
      clueCreateAPI({ unifiedSocialCreditCode: company.creditCode }, res => {
        if (res.success) {
          Taro.showToast({
            title: '已添加线索',
            icon: 'none',
            duration: 500
          })
        }
      })
    } else {
      setIsShowAdd(true)
      clueDeleteAPI({ unifiedSocialCreditCode: company.creditCode }, res => {
        if (res.success) {
          Taro.showToast({
            title: '已移除线索',
            icon: 'none',
            duration: 500
          })
        }
      })
    }
  }

  // 处理查看全部动态点击
  const toAllDynamic = () => {
    let res = { companyHotResultResponse: companyDetail?.companyHotResultResponse, name: company.name }
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseDetail/detail/dynamicInfo/index?item=${JSON.stringify(res)}`
    })
  }

  // 处理查看全部风险点击
  const toAllRisk = () => {
    let res = { enterpriseResponses: companyDetail?.enterpriseResponses, name: company.name }
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseDetail/detail/scanInfo/index?item=${JSON.stringify(res)}`
    })
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

  function toAiResearchReport(): void {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}`
    })
  }

  useLoad(options => {
    let res = JSON.parse(options.company)

    // 统计联系方式总数
    const totalCount = Object.values(res.contactInfo || {}).reduce<number>((sum, arr: any) => {
      return sum + (Array.isArray(arr) ? arr.length : 0)
    }, 0)
    setPhoneInfo(res.contactInfo?.phones || []) // 添加默认值 []
    setEmails(res.contactInfo?.emails || []) // 添加默认值 []
    // 同样需要为其他可能缺失的字段添加默认值
    setFixedLines(res.contactInfo?.fixedLines || [])
    setAddress(res.contactInfo?.address || [])
    setOthers(res.contactInfo?.others || [])
    setAllContactInformation(totalCount)
    enterpriseDetailAPI({ gid: res.gid, pageNum: 1, pageSize: 3 }, res => {
      if (res.success) {
        setCompanyDetail(res.data)
      }
    })
    setCompany(res)
  })

  return (
    <View className="searchEnterprisePage" style={showPopup ? { position: 'fixed', width: '100%', top: 0, left: 0 } : {}}>
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
        <View className="invalid_content">不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因不匹配原因</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
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
                    {phoneInfo.map((item, index) => (
                      <View className="tab_content_item" key={item} onClick={() => Taro.makePhoneCall({ phoneNumber: item })}>
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          {index < 3 ? <View className="recommend">推荐</View> : null}
                        </View>
                        <View className="tab_content_item_two">
                          <View className="name">- -</View>
                          <View className="position">- -</View>
                          <View className="security">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                            <View className="security_dot"></View>
                            <View className="security_text">未检测</View>
                          </View>
                        </View>
                        <View className="tab_content_item_three">
                          <Text style={{ color: '#333333' }}>来自：</Text> - -
                        </View>
                        {index < 3 ? (
                          <View className="tab_content_item_four">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 1 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
                        </View>
                        <View className="tab_content_item_two">
                          <View className="name">- -</View>
                          <View className="position">- -</View>
                          <View className="security">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                            <View className="security_dot"></View>
                            <View className="security_text">未检测</View>
                          </View>
                        </View>
                        <View className="tab_content_item_three">
                          <Text style={{ color: '#333333' }}>来自：</Text> - -
                        </View>
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 2 && (
                <>
                  <View className="tab_content">
                    {emails.map(item => (
                      <View className="tab_content_item" key={item} onClick={() => Taro.setClipboardData({ data: item })}>
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
                        </View>
                        <View className="tab_content_item_two">
                          <View className="name">- -</View>
                          <View className="position">- -</View>
                          <View className="security">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                            <View className="security_dot"></View>
                            <View className="security_text">未检测</View>
                          </View>
                        </View>
                        <View className="tab_content_item_three">
                          <Text style={{ color: '#333333' }}>来自：</Text> - -
                        </View>
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 3 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
                        </View>
                        <View className="tab_content_item_two">
                          <View className="name">- -</View>
                          <View className="position">- -</View>
                          <View className="security">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                            <View className="security_dot"></View>
                            <View className="security_text">未检测</View>
                          </View>
                        </View>
                        <View className="tab_content_item_three">
                          <Text style={{ color: '#333333' }}>来自：</Text> - -
                        </View>
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {tabValue === 4 && (
                <>
                  <View className="tab_content">
                    {phoneInfo.map(item => (
                      <View className="tab_content_item">
                        <View className="tab_content_item_one">
                          <View className="modile">{item}</View>
                          <View className="recommend">推荐</View>
                        </View>
                        <View className="tab_content_item_two">
                          <View className="name">- -</View>
                          <View className="position">- -</View>
                          <View className="security">
                            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise12.png" className="security_img" />
                            <View className="security_dot"></View>
                            <View className="security_text">未检测</View>
                          </View>
                        </View>
                        <View className="tab_content_item_three">
                          <Text style={{ color: '#333333' }}>来自：</Text> - -
                        </View>
                        <View className="tab_content_item_four">
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                          <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Popup>

      <View className="enterpriseContent_item">
        <View className="enterpriseContent_item_top">
          {company.logo ? (
            // 判断是否为图片链接（包含http或https）
            company.logo.includes('http') ? (
              <Image src={company.logo} className="enterpriseContent_item_Img" />
            ) : (
              // 如果是文字，显示文字
              <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="enterpriseContent_item_Img">
                {company.logo}
              </Text>
            )
          ) : (
            // 如果为空，显示"暂无"
            <Text className="enterpriseContent_item_Img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx' }}>
              暂无
            </Text>
          )}
          <View className="enterpriseContent_item_Text">
            <View className="title">{company.name}</View>
            <View className="enterpriseContent_item_tag">
              <View className="enterpriseContent_item_tag_item">{company.regStatus}</View>
              {company.tags?.map((item: any, index: number) => {
                // 过滤掉"曾用名"标签
                if (item === '曾用名') return null
                return (
                  <View key={index} className="enterpriseContent_item_tag_item">
                    {item}
                  </View>
                )
              })}
            </View>
          </View>
        </View>
        <View className="enterpriseContent_item_info">
          <View className="enterpriseContent_item_info_item">
            <View style={{ justifyContent: 'flex-start' }} className="enterpriseContent_item_info_item_title">
              法定代表人
            </View>
            <View style={{ color: '#3094FF', justifyContent: 'flex-start' }} className="enterpriseContent_item_info_item_value">
              {company.legalPerson}
            </View>
          </View>
          <View className="enterpriseContent_item_info_item">
            <View className="enterpriseContent_item_info_item_title">注册资本</View>
            <View className="enterpriseContent_item_info_item_value">{company.regCapital}</View>
          </View>
          <View className="enterpriseContent_item_info_item">
            <View style={{ justifyContent: 'flex-end' }} className="enterpriseContent_item_info_item_title">
              成立日期
            </View>
            <View style={{ justifyContent: 'flex-end' }} className="enterpriseContent_item_info_item_value">
              {company.establishTime}
            </View>
          </View>
        </View>

        <View className="enterpriseContent_item_product">
          <View className={`enterpriseContent_item_product_left${expandedCompanyScale ? ' expanded' : ''}`}>
            企业规模：<Text style={{ color: '#7B7B7B' }}>{company.companyScaleInfo}</Text>
          </View>
          <View className="enterpriseContent_item_product_right" onClick={() => setExpandedCompanyScale(!expandedCompanyScale)}>
            {expandedCompanyScale ? '收起' : '展开'}
          </View>
        </View>

        <View className="enterpriseContent_item_product">
          <View className={`enterpriseContent_item_product_left${expandedCompanyIntro ? ' expanded' : ''}`}>
            企业简介：<Text style={{ color: '#7B7B7B' }}>{company.businessScope}</Text>
          </View>
          <View className="enterpriseContent_item_product_right" onClick={() => setExpandedCompanyIntro(!expandedCompanyIntro)}>
            {expandedCompanyIntro ? '收起' : '展开'}
          </View>
        </View>

        <View className="enterpriseContent_item_product_phone">
          <View className="phone_left">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail20.png" className="phone_left_img" />
            <View className="phone_text" onClick={() => Taro.makePhoneCall({ phoneNumber: phoneInfo[0] })}>
              {phoneInfo[0]}
            </View>
            <View className="phone_more" onClick={() => setIsShowPhone(true)}>
              全部{allContactInformation}
            </View>
          </View>
          <View className="phone_right">
            <View className="phone_right_item">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail21.png" className="phone_right_img" />
              <View className="phone_right_text">官网</View>
            </View>
            <View className="phone_right_item">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail22.png" className="phone_right_img" />
              <View className="phone_right_text">邮箱</View>
            </View>
            <View className="phone_right_item">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail23.png" className="phone_right_img" />
              <View className="phone_right_text">产品应用</View>
            </View>
          </View>
        </View>

        <View className="enterpriseContent_item_product_phone">
          <View className="phone_left">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail24.png" className="phone_left_img" />
            <View className="phone_more">{company.location}</View>
          </View>
        </View>

        <Image onClick={() => toAiResearchReport()} src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail18.png" className="enterpriseContent_Img" />
      </View>

      {/* 智能分析结果 */}
      <View className="analysis">
        <View className="analysis_content" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/analysisInfo/index' })}>
          <View className="analysis_top">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail25.png" className="analysis_top_Img" />
            <View className="analysis_top_left">
              匹配度：<Text className="analysis_top_left_text">{Math.floor(company.score)}%</Text>
            </View>
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="analysis_top_leftImg" />
          </View>
          <View className="analysis_bottom">
            <View className="analysis_bottom_item">
              产品匹配度：<Text style={{ color: '#629EE7' }}>{company.productMatch}%</Text>
            </View>
            <View className="analysis_bottom_item">
              合作风险：<Text style={{ color: '#629EE7' }}>{company.riskLevel}%</Text>
            </View>
            <View className="analysis_bottom_item">
              市场潜力：<Text style={{ color: '#629EE7' }}>{company.marketPotential}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 商机情报 */}
      <View
        className="business_intelligence"
        onClick={() => {
          setShowBusinessIntelligence(true)
          setShowPopup(true)
        }}
      >
        <View className="business_intelligence_title">商机情报</View>
        <View className="business_intelligence_content">
          <View className="businessItem">
            主营产品：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            涉足企业：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            关键词分析：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            招标/中标：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            企业商品：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="business_intelligence_content_img" />
        </View>
      </View>

      {/* 商机情报弹窗 */}
      <Popup
        position="bottom"
        style={{ maxHeight: '95%', minHeight: '60%' }}
        visible={showBusinessIntelligence}
        onClose={() => {
          setShowBusinessIntelligence(false)
          setShowPopup(false)
        }}
      >
        <View className="popup_header">
          <View className="popup_header_title">商机情报</View>
          <Image
            onClick={() => {
              setShowBusinessIntelligence(false)
              setShowPopup(false)
            }}
            src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View className="business_intelligence_popup_content">
          <View className="businessItem">主营产品 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <View className="tag">扇线电机</View>
              <View className="tag">风力发电电机</View>
              <View className="tag">汽车发动机</View>
              <View className="tag">汽车发电机</View>
              <View className="tag">扇线电机</View>
              <View className="tag">风力发电电机</View>
              <View className="tag">汽车发动机</View>
              <View className="tag">汽车发电机</View>
            </View>
          </ScrollView>
          <View className="businessItem">涉足产业 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <View className="enterprise_graph_content_item">
                <Image onClick={() => Taro.previewImage({ urls: ['http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png'] })} src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
              <View className="enterprise_graph_content_item">
                <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
              <View className="enterprise_graph_content_item">
                <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
            </View>
          </ScrollView>
          <View className="businessItem">招标/中标 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <Text className="tag_blue">中标方 872</Text>
              <Text className="tag_blue">招标方 876</Text>
              <Text className="tag_blue">代理方 0</Text>
              <Text className="tag_blue">候选人 0</Text>
            </View>
          </ScrollView>
          <View className="businessItem">企业商品 0</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <Text className="tag_blue">中标方 872</Text>
              <Text className="tag_blue">招标方 876</Text>
              <Text className="tag_blue">代理方 0</Text>
              <Text className="tag_blue">候选人 0</Text>
            </View>
          </ScrollView>
        </View>
      </Popup>

      {/* 风险扫描 */}
      <View className="risk_scan">
        <View className="risk_scan_title">风险扫描</View>
        <View className="risk_scan_content">
          {companyDetail?.enterpriseResponses?.map((item: any, index: any) => (
            <View className="risk_scan_content_item" onClick={toAllRisk} key={index}>
              <View className="risk_scan_content_item_title">
                {item?.name} <Text className="texts">{item?.count}</Text>
              </View>
              <View className="risk_scan_content_item_content">{item?.details?.[0]?.title}</View>
            </View>
          ))}
        </View>
      </View>

      {/* 企业动态 */}
      <View className="enterprise_dynamic">
        <View className="enterprise_dynamic_title">企业动态</View>
        <View className="enterprise_dynamic_content">
          <View className="enterprise_dynamic_content_one">{companyDetail.companyHotResultResponse?.companyHotRequestList?.[0]?.rtm ? formatTimestamp(companyDetail.companyHotResultResponse.companyHotRequestList[0].rtm) : '--'}</View>
          <View className="enterprise_dynamic_content_two">{companyDetail.companyHotResultResponse?.companyHotRequestList?.[0]?.title || '--'}</View>
          <View className="enterprise_dynamic_content_three">
            该企业存在 <Text style={{ color: '#629EE7' }}>{companyDetail.companyHotResultResponse?.realTotal || 0}条</Text> 相关动态{' '}
            <Text style={{ color: '#1B5BFF' }} onClick={toAllDynamic}>
              查看全部
            </Text>
          </View>
        </View>
      </View>

      {/* 企业图谱 */}
      <View className="enterprise_graph">
        <View className="enterprise_graph_title">企业图谱</View>
        <View className="enterprise_graph_content">
          <View className="enterprise_graph_content_item">
            <Image onClick={() => Taro.previewImage({ urls: ['http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png'] })} src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
            <View className="enterprise_graph_content_item_text">企业图谱</View>
          </View>
          <View className="enterprise_graph_content_item">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
            <View className="enterprise_graph_content_item_text">企业图谱</View>
          </View>
          <View className="enterprise_graph_content_item">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
            <View className="enterprise_graph_content_item_text">企业图谱</View>
          </View>
        </View>
      </View>

      {/* 基本信息 */}
      <View className="enterprise_info">
        <View className="enterprise_info_title">基本信息</View>
        <View className="enterprise_info_content">
          {enterpriseInfo.map((item, index) => (
            <View className="enterprise_info_content_item" onClick={() => Taro.navigateTo({ url: item.router })} key={index}>
              <View className="enterprise_info_content_item_title">{item.title}</View>
              <View className="enterprise_info_content_item_value">{item.value}</View>
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="info_Img" />
            </View>
          ))}
        </View>
      </View>

      {/* 同行企业 */}
      <View className="enterprise_peer">
        <View className="peer_title">
          同行企业
          <View className="peer_title_right" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/peerInfo/index?list=' + JSON.stringify(companyDetail.similarCompanies) })}>
            <Text className="peer_title_right_text">查看更多</Text>
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="peer_title_right_img" />
          </View>
        </View>
        <View className="peer_content">
          {companyDetail.similarCompanies.slice(0, 3).map((item: any, simIndex: number) => {
            return (
              <View className="peer_content_item" key={simIndex}>
                <View className="peer_content_item_top">
                  {item.logo ? (
                    // 判断是否为图片链接（包含http或https）
                    item.logo.includes('http') ? (
                      <Image src={item.logo} className="peer_content_item_img" />
                    ) : (
                      // 如果是文字，显示文字
                      <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="peer_content_item_img">
                        {item.logo}
                      </Text>
                    )
                  ) : (
                    // 如果为空，显示"暂无"
                    <Text className="peer_content_item_img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '24rpx' }}>
                      暂无
                    </Text>
                  )}
                  <View className="peer_content_item_text">{item.name}</View>
                </View>
                <View className="peer_content_item_bottom">主营：{item.alias}</View>
              </View>
            )
          })}
        </View>

        <View className="enterpriseContent_item_bottom">
          <View className="enterpriseContent_item_bottom_left">
            {!isDisliked && (
              <View onClick={handleLike} className={`enterpriseContent_item_bottom_left_good ${isLiked ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
                <Image src={!isLiked ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise8.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png'} className="enterpriseContent_item_bottom_left_good_img" />
                <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
              </View>
            )}
            {!isLiked && (
              <View onClick={handleDislike} className={`enterpriseContent_item_bottom_left_bad ${isDisliked ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
                <Image src={!isDisliked ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise9.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png'} className="enterpriseContent_item_bottom_left_bad_img" />
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
    </View>
  )
}

export default Index
