import { ArrowRightSize6, Check } from '@nutui/icons-react-taro'
import { Popup, CalendarCard, Cascader } from '@nutui/nutui-react-taro'
import { Image, Input, View } from '@tarojs/components'
import './index.scss'
import { useState } from 'react'
import Taro from '@tarojs/taro'

function Index() {
  const [minCapital, setMinCapital] = useState('')
  const [maxCapital, setMaxCapital] = useState('')
  const [minPeople, setMinPeople] = useState('')
  const [maxPeople, setMaxPeople] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [showCustomYearInput, setShowCustomYearInput] = useState(false)
  const [showIndustry, setShowIndustry] = useState(false)
  // 多分组选中项
  const [selected, setSelected] = useState<{ [key: string]: string | null }>({})
  const [popUpHeight, setPopUpHeight] = useState(0)
  const [industryValue, setIndustryValue] = useState([])
  const [industryOptions, setIndustryOptions] = useState([
    {
      value1: 'ZheJiang',
      text1: '浙江',
      items: [
        {
          value1: 'HangZhou',
          text1: '杭州',
          disabled: true,
          items: [
            { value1: 'XiHu', text1: '西湖区', disabled: true },
            { value1: 'YuHang', text1: '余杭区' }
          ]
        },
        {
          value1: 'WenZhou',
          text1: '温州',
          items: [
            { value1: 'LuCheng', text1: '鹿城区' },
            { value1: 'OuHai', text1: '瓯海区' }
          ]
        }
      ]
    },
    {
      value1: '湖南',
      text1: '湖南',
      disabled: true,
      items: [
        {
          value1: '长沙',
          text1: '长沙',
          disabled: true,
          items: [
            { value1: '芙蓉区', text1: '芙蓉区' },
            { value1: '岳麓区', text1: '岳麓区' }
          ]
        },
        {
          value1: '岳阳',
          text1: '岳阳',
          children: [
            { value1: '岳阳楼区', text1: '岳阳楼区' },
            { value1: '云溪区', text1: '云溪区' }
          ]
        }
      ]
    },
    {
      value1: '福建',
      text1: '福建',
      items: [
        {
          value1: '福州',
          text1: '福州',
          items: [
            { value1: '鼓楼区', text1: '鼓楼区' },
            { value1: '台江区', text1: '台江区' }
          ]
        }
      ]
    }
  ])

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
      items: ['住宿和餐饮']
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

  const closeIndustryPopup = () => {
    setShowIndustry(false)
    setShowPopup(false)
  }

  const changeIndustryValue = () => {
    setShowIndustry(false)
    setShowPopup(false)
  }

  const closeSwitch = () => {
    setShowPopup(false)
  }

  const handleMinPeople = (e: any) => {
    setMinPeople(e.detail.value)
  }

  const handleMaxPeople = (e: any) => {
    setMaxPeople(e.detail.value)
  }

  const setChooseValue = (e: any) => {
    const formatDate = (date: any) => (date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '')
    const [start, end] = e
    setMinCapital(formatDate(start))
    setMaxCapital(formatDate(end))
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
      setShowIndustry(true)
      setShowPopup(true)
    }
    setSelected(prev => ({ ...prev, [groupKey]: item }))
  }

  // 判断输入框有值
  const isCapitalInputActive = !!(minCapital || maxCapital)
  const isPeopleInputActive = !!(minPeople || maxPeople)

  return (
    <View className="advancedFilterPage" style={{ overflow: showPopup ? 'hidden' : 'auto', height: showPopup ? '100vh' : 'auto' }}>
      <Popup className="advancedPopup" position="bottom" style={{ maxHeight: '80%', minHeight: '80%' }} visible={showCustomYearInput} onClose={closeSwitch}>
        <View className="popup_header">
          <View className="popup_header_title">成立年限</View>
          <Image onClick={() => closeAdvancedPopup()} src={require('@/assets/enterprise/enterprise14.png')} className="popup_header_img" />
        </View>
        <View style={{ height: `calc(${popUpHeight}px - 380rpx)` }}>
          <CalendarCard type="range" startDate={new Date('1900-01-01')} onChange={setChooseValue} />
        </View>
        <View className="popup_bottom">
          <View className="popup_bottom_date">
            <View className="popup_bottom_date_text">
              <View className="popup_bottom_date_text_title">开始</View>
              <View style={{ color: minCapital ? '#333333' : '#B9B9B9' }}>{minCapital ? minCapital : '请选择'}</View>
            </View>
            <View className="popup_bottom_date_text">
              <View className="popup_bottom_date_text_title">结束</View>
              <View style={{ color: maxCapital ? '#333333' : '#B9B9B9' }}>{maxCapital ? maxCapital : '请选择'}</View>
            </View>
          </View>
          <View className="popup_bottom_btn">取消</View>
          <View className="popup_bottom_btn" style={{ background: '#2156FE', color: '#fff' }}>
            确定
          </View>
        </View>
      </Popup>

      <Popup className="advancedPopup" position="bottom" style={{ maxHeight: '80%', minHeight: '80%' }} visible={showIndustry} onClose={closeSwitch}>
        <View className="popup_header">
          <View className="popup_header_title">所属行业</View>
          <Image onClick={() => closeIndustryPopup()} src={require('@/assets/enterprise/enterprise14.png')} className="popup_header_img" />
        </View>
        <Cascader
          optionKey={{
            textKey: 'text1',
            valueKey: 'value1',
            childrenKey: 'items'
          }}
          popup={false}
          value={industryValue}
          options={industryOptions}
          closeable
          onClose={() => closeIndustryPopup()}
          onChange={() => changeIndustryValue()}
        />
      </Popup>
      {searchGroups.map(group => (
        <View className="searchItem" key={group.key}>
          <View className="searchTitle">
            {group.title}
            <ArrowRightSize6 color="#8E8E8E" size={'28rpx'} />
          </View>
          <View className="searchRange" style={group.grid ? { gridTemplateColumns: `repeat(${group.grid}, 1fr)` } : {}}>
            {group.items.map(item => (
              <View key={item} className={`searchRange_item${selected[group.key] === item ? ' searchRange_item--active' : ''}`} onClick={() => handleSelect(group.key, item)}>
                {item}
                {selected[group.key] === item && (
                  <View className="searchRange_item__tick">
                    <Check color="#fff" size={'20rpx'} />
                  </View>
                )}
              </View>
            ))}
            {/* 下面保留原有特殊输入项和单位项的渲染逻辑 */}
            {group.key === 'people' && (
              <View className="searchRange_item searchRange_item--full" style={{ gridColumn: '2 / 4' }}>
                <Input placeholder="最低人数" className="searchRange_item_input" value={minPeople} onInput={handleMinPeople} />
                <View className="searchRange_item_input_text">-</View>
                <Input placeholder="最高人数" className="searchRange_item_input" value={maxPeople} onInput={handleMaxPeople} />
              </View>
            )}
          </View>
        </View>
      ))}
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
              className={`searchRange_item${selected['capital'] === item && !isCapitalInputActive ? ' searchRange_item--active' : ''}`}
              onClick={() => {
                setSelected(prev => ({ ...prev, capital: item }))
                setMinCapital('')
                setMaxCapital('')
              }}
            >
              {item}
              {selected['capital'] === item && !isCapitalInputActive && (
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
              value={minCapital}
              onInput={e => {
                setMinCapital(e.detail.value)
                setSelected(prev => ({ ...prev, capital: '' }))
              }}
            />
            <View className="searchRange_item_input_text">-</View>
            <Input
              placeholder="最高资本"
              className="searchRange_item_input"
              value={maxCapital}
              onInput={e => {
                setMaxCapital(e.detail.value)
                setSelected(prev => ({ ...prev, capital: '' }))
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
              className={`searchRange_item${selected['people'] === item && !isPeopleInputActive ? ' searchRange_item--active' : ''}`}
              onClick={() => {
                setSelected(prev => ({ ...prev, people: item }))
                setMinPeople('')
                setMaxPeople('')
              }}
            >
              {item}
              {selected['people'] === item && !isPeopleInputActive && (
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
              value={minPeople}
              onInput={e => {
                setMinPeople(e.detail.value)
                setSelected(prev => ({ ...prev, people: '' }))
              }}
            />
            <View className="searchRange_item_input_text">-</View>
            <Input
              placeholder="最高人数"
              className="searchRange_item_input"
              value={maxPeople}
              onInput={e => {
                setMaxPeople(e.detail.value)
                setSelected(prev => ({ ...prev, people: '' }))
              }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default Index
