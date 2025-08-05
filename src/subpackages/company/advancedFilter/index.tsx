import { ArrowRightSize6, Check } from '@nutui/icons-react-taro'
import { Popup, CalendarCard, Cascader, CascaderOption } from '@nutui/nutui-react-taro'
import { Image, Input, View } from '@tarojs/components'
import './index.scss'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { configCompanySectorAPI } from '@/api/setting'

function Index() {
  // 表单数据状态管理
  const [formData, setFormData] = useState({
    // 注册资本相关字段
    capital: '', // 预设资本范围选项
    minCapital: '', // 自定义最低资本
    maxCapital: '', // 自定义最高资本

    // 资本类型
    capitalType: '', // 资本币种类型

    // 经济类型
    ecoType: '', // 企业经济性质

    // 成立年限日期相关字段
    years: '', // 预设年限选项
    startDate: '', // 自定义开始日期
    endDate: '', // 自定义结束日期

    // 参保人数相关字段
    people: '', // 预设人数范围选项
    minPeople: '', // 自定义最低人数
    maxPeople: '', // 自定义最高人数

    // 行业相关字段
    industry: '', // 所属行业
    industryValue: '', // 级联选择的行业值

    // 产品关键词
    product: '', // 产品关键词选择

    // 关键词查找范围
    searchRange: '', // 搜索范围选择

    // 登记状态
    status: '', // 企业登记状态

    // 机构类型
    orgType: '' // 企业机构类型
  })

  const [showPopup, setShowPopup] = useState(false)
  const [showCustomYearInput, setShowCustomYearInput] = useState(false)
  const [popUpHeight, setPopUpHeight] = useState(0)
  const [sectorVisible, setSectorVisible] = useState(false)
  const [sectorValue, setSectorValue] = useState<string[]>([])
  const [sectorDesc, setSectorDesc] = useState('请选择行业')

  // 分组数据
  const searchGroups = [
    {
      key: 'searchRange',
      title: '关键词查找范围',
      items: ['企业名称', '法定代表人姓名', '股东姓名', '注册地址', '经营范围', '股东姓名']
    },
    {
      key: 'product',
      title: '产品关键词',
      items: ['扁线电机', '风力发电电机', '股东姓名', '串机电机', '经营范围', '有刷电机']
    },
    {
      key: 'industry',
      title: '所属行业',
      items: []
    },
    {
      key: 'status',
      title: '登记状态',
      items: ['存续', '注销', '吊销', '撤销', '迁出', '设立中', '清算中', '停业', '其他'],
      grid: 5
    },
    {
      key: 'years',
      title: '成立年限',
      items: ['3个月内', '半年内', '1年内', '1-3年', '3-5年', '5-10年', '10-15年', '15年以上', '自定义'],
      grid: 5
    },
    {
      key: 'capitalType',
      title: '资本类型',
      items: ['人民币', '外币', '美元'],
      grid: 5
    },
    {
      key: 'orgType',
      title: '机构类型',
      items: ['有限责任公司', '股份有限责任', '个人独资企业', '普通合伙', '有限合伙', '全名所有制', '集体所有制', '联营企业', '股份合作企业', '个体工商户', '机关单位', '事业单位', '社会组织', '农民专业合作社', '律师事务所']
    },
    {
      key: 'ecoType',
      title: '经济类型',
      items: ['国有企业', '私民企业', '港澳台投资企业', '外商投资企业']
    }
  ]

  const closeAdvancedPopup = () => {
    setShowCustomYearInput(false)
    setShowPopup(false)
  }

  const closeCustomYearInput = () => {
    setShowCustomYearInput(false)
    setShowPopup(false)
  }

  const handleMinPeople = (e: any) => {
    setFormData(prev => ({ ...prev, minPeople: e.detail.value }))
  }

  const handleMaxPeople = (e: any) => {
    setFormData(prev => ({ ...prev, maxPeople: e.detail.value }))
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

  // 处理级联选择器变化
  const onSectorChange = (value: string[], path: CascaderOption[]) => {
    setSectorValue(value)
    // 修复重复调用map的问题
    const pathTexts = path.map(item => item.text)
    const sectorNames = pathTexts[pathTexts.length - 1]
    setSectorDesc(sectorNames || '请选择行业')

    // 更新表单数据
    const lastSelected = value[value.length - 1]
    setFormData({
      ...formData,
      industryValue: lastSelected,
      industry: sectorNames || '请选择行业'
    })
  }

  const handleSubmit = () => {
  }

  // 修改日期选择函数
  const setChooseValue = (e: any) => {
    const formatDate = (date: any) => (date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '')
    const [start, end] = e
    setFormData(prev => ({
      ...prev,
      startDate: formatDate(start),
      endDate: formatDate(end)
    }))
  }

  // 选中处理
  const handleSelect = (groupKey: string, item: string) => {
    if (groupKey === 'years' && item === '自定义') {
      setShowCustomYearInput(true)
      setShowPopup(true)
      // 获取advancedPopup高度
      const query = Taro.createSelectorQuery()
      query.select('.advancedPopup').boundingClientRect()
      query.exec(res => {
        setPopUpHeight(res[0].height)
      })
      return
    }
    if (groupKey === 'industry') {
      setSectorVisible(true)
      return
    }
    setFormData(prev => ({
      ...prev,
      [groupKey]: item
    }))
  }

  // 判断输入框有值
  const isCapitalInputActive = !!(formData.minCapital || formData.maxCapital)
  const isPeopleInputActive = !!(formData.minPeople || formData.maxPeople)

  return (
    <View className="advancedFilterPage" style={{ overflow: showPopup ? 'hidden' : 'auto', height: showPopup ? '100vh' : 'auto' }}>
      <Popup className="advancedPopup" position="bottom" style={{ maxHeight: '80%', minHeight: '80%' }} visible={showCustomYearInput} onClose={closeCustomYearInput}>
        <View className="popup_header">
          <View className="popup_header_title">成立年限</View>
          <Image onClick={() => closeAdvancedPopup()} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View style={{ height: `calc(${popUpHeight}px - 380rpx)` }}>
          <CalendarCard type="range" startDate={new Date('1900-01-01')} onChange={setChooseValue} />
        </View>
        <View className="popup_bottom">
          <View className="popup_bottom_date">
            <View className="popup_bottom_date_text">
              <View className="popup_bottom_date_text_title">开始</View>
              <View style={{ color: formData.startDate ? '#333333' : '#B9B9B9' }}>{formData.startDate ? formData.startDate : '请选择'}</View>
            </View>
            <View className="popup_bottom_date_text">
              <View className="popup_bottom_date_text_title">结束</View>
              <View style={{ color: formData.endDate ? '#333333' : '#B9B9B9' }}>{formData.endDate ? formData.endDate : '请选择'}</View>
            </View>
          </View>
          <View onClick={() => closeCustomYearInput()} className="popup_bottom_btn">
            取消
          </View>
          <View onClick={() => closeCustomYearInput()} className="popup_bottom_btn" style={{ background: '#2156FE', color: '#fff' }}>
            确定
          </View>
        </View>
      </Popup>

      <Cascader visible={sectorVisible} defaultValue={sectorValue} title="选择行业" closeable onClose={() => setSectorVisible(false)} onChange={onSectorChange} lazy onLoad={loadCascaderItemData} />

      {searchGroups.map(group =>
        group.key === 'industry' ? (
          <View className="searchItem" key={group.key} onClick={() => handleSelect(group.key, '')}>
            <View className="searchTitle">{group.title}</View>
            <View className="searchSelect">
              <View className="searchSelect_text">{sectorDesc}</View>
              <ArrowRightSize6 color="#8E8E8E" size={'28rpx'} />
            </View>
          </View>
        ) : (
          <View className="searchItem" key={group.key}>
            <View className="searchTitle">
              {group.title}
              <ArrowRightSize6 color="#8E8E8E" size={'28rpx'} />
            </View>
            <View className="searchRange" style={group.grid ? { gridTemplateColumns: `repeat(${group.grid}, 1fr)` } : {}}>
              {group.items.map(item => (
                <View key={item} className={`searchRange_item${formData[group.key] === item ? ' searchRange_item--active' : ''}`} onClick={() => handleSelect(group.key, item)}>
                  {item}
                  {formData[group.key] === item && (
                    <View className="searchRange_item__tick">
                      <Check color="#fff" size={'20rpx'} />
                    </View>
                  )}
                </View>
              ))}
              {/* 下面保留原有特殊输入项和单位项的渲染逻辑 */}
              {group.key === 'people' && (
                <View className="searchRange_item searchRange_item--full" style={{ gridColumn: '2 / 4' }}>
                  <Input placeholder="最低人数" className="searchRange_item_input" value={formData.minPeople} onInput={handleMinPeople} />
                  <View className="searchRange_item_input_text">-</View>
                  <Input placeholder="最高人数" className="searchRange_item_input" value={formData.maxPeople} onInput={handleMaxPeople} />
                </View>
              )}
            </View>
          </View>
        )
      )}
      {/* 注册资本单独渲染，因有特殊输入项 */}
      <View className="searchItem">
        <View className="searchTitle">
          注册资本
          <ArrowRightSize6 color="#8E8E8E" size={'28rpx'} />
        </View>
        <View className="searchRange">
          {['100万内', '100-200万', '200-500万', '500-1000万', '1000-5000万', '5000万以上'].map(item => (
            <View
              key={item}
              className={`searchRange_item${formData['capital'] === item && !isCapitalInputActive ? ' searchRange_item--active' : ''}`}
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  capital: item,
                  minCapital: '',
                  maxCapital: ''
                }))
              }}
            >
              {item}
              {formData['capital'] === item && !isCapitalInputActive && (
                <View className="searchRange_item__tick">
                  <Check color="#fff" size={'20rpx'} />
                </View>
              )}
            </View>
          ))}
          <View className={`searchRange_item searchRange_item--full${isCapitalInputActive ? ' searchRange_item--active' : ''}`}>
            <Input
              placeholder="最低资本"
              className="searchRange_item_input"
              value={formData.minCapital}
              onInput={e => {
                setFormData(prev => ({
                  ...prev,
                  minCapital: e.detail.value,
                  capital: ''
                }))
              }}
            />
            <View className="searchRange_item_input_text">-</View>
            <Input
              placeholder="最高资本"
              className="searchRange_item_input"
              value={formData.maxCapital}
              onInput={e => {
                setFormData(prev => ({
                  ...prev,
                  maxCapital: e.detail.value,
                  capital: ''
                }))
              }}
            />
          </View>
          <View className="searchRange_item_text">万</View>
        </View>
      </View>
      {/* 参保人数特殊输入项 */}
      <View className="searchItem">
        <View className="searchTitle">
          参保人数
          <ArrowRightSize6 color="#8E8E8E" size={'28rpx'} />
        </View>
        <View className="searchRange">
          {['0人', '1-49人', '50-99人', '100-499人', '500-999人', '1000-4999人', '5000-9999人'].map(item => (
            <View
              key={item}
              className={`searchRange_item${formData['people'] === item && !isPeopleInputActive ? ' searchRange_item--active' : ''}`}
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  people: item,
                  minPeople: '',
                  maxPeople: ''
                }))
              }}
            >
              {item}
              {formData['people'] === item && !isPeopleInputActive && (
                <View className="searchRange_item__tick">
                  <Check color="#fff" size={'20rpx'} />
                </View>
              )}
            </View>
          ))}
          <View className={`searchRange_item searchRange_item--full${isPeopleInputActive ? ' searchRange_item--active' : ''}`} style={{ gridColumn: '2 / 4' }}>
            <Input
              placeholder="最低人数"
              className="searchRange_item_input"
              value={formData.minPeople}
              onInput={e => {
                setFormData(prev => ({
                  ...prev,
                  minPeople: e.detail.value,
                  people: ''
                }))
              }}
            />
            <View className="searchRange_item_input_text">-</View>
            <Input
              placeholder="最高人数"
              className="searchRange_item_input"
              value={formData.maxPeople}
              onInput={e => {
                setFormData(prev => ({
                  ...prev,
                  maxPeople: e.detail.value,
                  people: ''
                }))
              }}
            />
          </View>
        </View>
      </View>
      <View onClick={handleSubmit}>确定</View>
    </View>
  )
}

export default Index
