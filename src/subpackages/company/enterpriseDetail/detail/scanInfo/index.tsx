import React, { useEffect, useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import './index.scss'
import { ArrowDown, ArrowRightSize6, ArrowRightSmall, Checked, TriangleDown } from '@nutui/icons-react-taro'
import { Collapse, Menu, Tabs } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'

function Index() {
  const [tabvalue, setTabvalue] = useState(0)
  const [list, setList] = useState([{}, {}, {}, {}, {}, {}])
  const [botHeight, setBotHeight] = useState([])
  const [tabHeight, setTabHeight] = useState(0)

  const [options] = useState([
    { text: '全部', value: 1 },
    { text: '警示', value: 2 }
  ])
  const [options1] = useState([
    { text: '全部', value: 1 },
    { text: '司法风险', value: 2 },
    { text: '经营风险', value: 3 }
  ])
  const [options2] = useState([
    { text: '全部', value: 1 },
    { text: '近一月', value: 2 },
    { text: '近三月', value: 3 },
    { text: '近一年', value: 4 },
    { text: '近三年', value: 5 }
  ])
  const [stateOne, setStateOne] = useState(1)
  const [stateTwo, setStateTwo] = useState(1)
  const [stateThree, setStateThree] = useState(1)

  useEffect(() => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.nut-tabs-titles').boundingClientRect()
      query.select('.header-company').boundingClientRect()
      query.select('.content-filter').boundingClientRect()
      query.exec(res => {
        setTabHeight(res[0].height + res[1].height + (res[2]?.height || 0))
      })
    })
  }, [])

  const getTab = (value: number) => {
    setTabvalue(value as number)
  }

  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-company">
          <View className="header-company-logo">
            <Image src={require('@/assets/enterprise/enterprise11.png')} className="header-company-logo-img" />
          </View>
          <View className="header-company-name">柳州五萎汽车工业有限公司</View>
          <ArrowRightSize6 color="#333" size={'24rpx'} />
        </View>
        <View className="header-tabs">
          <Tabs
            value={tabvalue}
            onChange={value => {
              getTab(value as number)
            }}
            align="left"
          >
            <Tabs.TabPane title="自身风险">
              <View className="content">
                <View className="content-filter">
                  <View style={{ padding: '24rpx', paddingBottom: '0', boxSizing: 'border-box' }}>
                    <View className="filter-list">
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFEDEC', color: '#F83B34' }}>
                          <Text>高风险</Text>
                        </View>
                      </View>
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFF1EC', color: '#F88F34' }}>
                          <Text>中风险</Text>
                        </View>
                      </View>
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFF1EC', color: '#F88F34' }}>
                          <Text>警示</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Menu activeColor="#2156FE">
                    <Menu.Item
                      title="风险等级"
                      options={options}
                      value={stateOne}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateOne(val.value)
                      }}
                    />
                    <Menu.Item
                      title="风险类型"
                      options={options1}
                      value={stateTwo}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateTwo(val.value)
                      }}
                    />
                    <Menu.Item
                      title="风险时间"
                      options={options2}
                      value={stateThree}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateThree(val.value)
                      }}
                    />
                  </Menu>
                </View>
                <View className="content-list" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="司法风险 43">
                      <View className="list-item">
                        <View className="list-item-title">
                          <View className="list-item-bot"></View>
                          <View className="list-item-bot-title">失信被执行人</View>
                          <View className="list-item-bot-tag">高风险</View>
                        </View>
                        <View className="list-item-msg">
                          <View className="msg-title">
                            风险数：<Text style={{ color: '#333333' }}>1</Text>
                          </View>
                          <View className="msg-title">
                            关联企业：<Text style={{ color: '#333333' }}>1</Text>
                          </View>
                        </View>
                        <View className="list-item-msg-content">
                          <View className="msg-content-title">
                            <View className="msg-title-left">柳州五萎汽车工业有限公司</View>
                            <View className="msg-title-right">（投资的企业，持股100%）</View>
                          </View>
                          <View className="msg-content-text">
                            <View className="msg-title-left">被法院列为失信被执行人</View>
                            <View className="msg-title-right">
                              （5）
                              <ArrowRightSmall size={'24rpx'} color="#9C9C9C" />
                            </View>
                          </View>
                        </View>
                      </View>
                    </Collapse.Item>
                  </Collapse>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="监管风险 43">京东“厂直优品计划”首推“政府优品馆” 3年覆盖80%镇级政府</Collapse.Item>
                  </Collapse>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="经营风险 43">京东“厂直优品计划”首推“政府优品馆” 3年覆盖80%镇级政府</Collapse.Item>
                  </Collapse>
                </View>
              </View>
            </Tabs.TabPane>
            <Tabs.TabPane title="关联企业风险">
              <View className="content">
                <View className="content-filter">
                  <View style={{ padding: '24rpx', paddingBottom: '0', boxSizing: 'border-box' }}>
                    <View className="filter-list">
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFEDEC', color: '#F83B34' }}>
                          <Text>高风险</Text>
                        </View>
                      </View>
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFF1EC', color: '#F88F34' }}>
                          <Text>中风险</Text>
                        </View>
                      </View>
                      <View className="filter-item">
                        <View className="filter-item-title">
                          213
                          <Text style={{ color: '#818181', fontSize: '20rpx' }}>条</Text>
                        </View>
                        <View className="filter-item-tag" style={{ background: '#FFF1EC', color: '#F88F34' }}>
                          <Text>警示</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Menu activeColor="#2156FE">
                    <Menu.Item
                      title="风险等级"
                      options={options}
                      value={stateOne}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateOne(val.value)
                      }}
                    />
                    <Menu.Item
                      title="风险类型"
                      options={options1}
                      value={stateTwo}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateTwo(val.value)
                      }}
                    />
                    <Menu.Item
                      title="风险时间"
                      options={options2}
                      value={stateThree}
                      titleIcon={<TriangleDown size={'20rpx'} />}
                      icon={<Checked color="#2146FE" size={'28rpx'} />}
                      onChange={val => {
                        setStateThree(val.value)
                      }}
                    />
                  </Menu>
                </View>
                <View className="content-list" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="司法风险 43">
                      <View className="list-item">
                        <View className="list-item-title">
                          <View className="list-item-bot"></View>
                          <View className="list-item-bot-title">失信被执行人</View>
                          <View className="list-item-bot-tag">高风险</View>
                        </View>
                        <View className="list-item-msg">
                          <View className="msg-title">
                            风险数：<Text style={{ color: '#333333' }}>1</Text>
                          </View>
                          <View className="msg-title">
                            关联企业：<Text style={{ color: '#333333' }}>1</Text>
                          </View>
                        </View>
                        <View className="list-item-msg-content">
                          <View className="msg-content-title">
                            <View className="msg-title-left">柳州五萎汽车工业有限公司</View>
                            <View className="msg-title-right">（投资的企业，持股100%）</View>
                          </View>
                          <View className="msg-content-text">
                            <View className="msg-title-left">被法院列为失信被执行人</View>
                            <View className="msg-title-right">
                              （5）
                              <ArrowRightSmall size={'24rpx'} color="#9C9C9C" />
                            </View>
                          </View>
                        </View>
                      </View>
                    </Collapse.Item>
                  </Collapse>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="监管风险 43">京东“厂直优品计划”首推“政府优品馆” 3年覆盖80%镇级政府</Collapse.Item>
                  </Collapse>
                  <Collapse expandIcon={<ArrowDown size={'34rpx'} color="#9C9C9C" />}>
                    <Collapse.Item title="经营风险 43">京东“厂直优品计划”首推“政府优品馆” 3年覆盖80%镇级政府</Collapse.Item>
                  </Collapse>
                </View>
              </View>
            </Tabs.TabPane>
          </Tabs>
        </View>
      </View>
    </View>
  )
}

export default Index
