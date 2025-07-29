import React, { useEffect, useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import './index.scss'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'
import { Tabs } from '@nutui/nutui-react-taro'
import Taro, { useLoad } from '@tarojs/taro'

function Index() {
  const [tabvalue, setTabvalue] = useState(0)
  const [list, setList] = useState([{}, {}, {}, {}, {}, {}])
  const [botHeight, setBotHeight] = useState([])
  const [tabHeight, setTabHeight] = useState(0)
  const [company, setCompany] = useState({ name: '' })
  const [companyList, setCompanyList] = useState([])

  useEffect(() => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.content-box').boundingClientRect()
      query.selectAll('.tagone').boundingClientRect()
      query.select('.nut-tabs-titles').boundingClientRect()
      query.select('.header-company').boundingClientRect()
      query.exec(res => {
        setTabHeight(res[3].height + res[2].height)
        const contentRect = res[0]
        const tagRects = res[1]
        if (contentRect && tagRects && tagRects.length) {
          const distances = tagRects.map((rect: { top: number }) => rect.top - contentRect.top)
          setBotHeight(distances)
        }
      })
    })
  }, [])

  useLoad(options => {
    let item = JSON.parse(options.item)
    if (item.company && item.company.name) {
      item.company.name = item.company.name.replace(/<[^>]+>/g, '')
    }
    setCompany(item?.company)
    setCompanyList(item?.companyHotResultResponse?.companyHotRequestList)
  })

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

  const getTagClass = (index: number) => {
    if (index === 0) return 'tag-active'
    if (index === 1) return 'tag-neutral'
    if (index === 2) return 'tag-negative'
    return 'tag-active'
  }

  const getTab = (value: number) => {
    setTabvalue(value as number)
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.content-box').boundingClientRect()
      query.selectAll(value == 0 ? '.tagone' : value == 1 ? '.tagtwo' : '.tagthree').boundingClientRect()
      query.exec(res => {
        const contentRect = res[0]
        const tagRects = res[1]
        if (contentRect && tagRects && tagRects.length) {
          const distances = tagRects.map((rect: { top: number }) => rect.top - contentRect.top)
          setBotHeight(distances)
        }
      })
    })
  }

  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-company">
          <View className="header-company-logo">
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="header-company-logo-img" />
          </View>
          <View className="header-company-name">{company.name}</View>
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
            <Tabs.TabPane title="新闻舆情">
              <View className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {/* 线（不是第一个点时才渲染） */}
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        {/* 点 */}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {companyList.map((item: any, index: any) => {
                      return (
                        <View className="content-item" key={index}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag ${getTagClass(index)} tagone`}>积极</View>
                            <View className="tag-news">新闻</View>
                            <View className="date">{formatTimestamp(item.rtm)}</View>
                          </View>
                          <View className="content-item__card">
                            <View className="title">{item.title}</View>
                            <View className="source">来源财经网</View>
                            <View className="arrow"></View>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </Tabs.TabPane>
            <Tabs.TabPane title="工商变更">
              <View className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {/* 线（不是第一个点时才渲染） */}
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        {/* 点 */}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {list.map((item, index) => {
                      return (
                        <View className="content-item" key={index}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag tag-yellow tagtwo`}>提示</View>
                            <View className="tag-news">其他事项备案</View>
                            <View className="date">2024-09-09</View>
                          </View>
                          <View className="content-item__cardt">
                            <View className="title">变更前</View>
                            <View className="text">区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案</View>
                            <View className="title">变更后</View>
                            <View className="text">区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案</View>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </Tabs.TabPane>
            <Tabs.TabPane title="经营动态">
              <View className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {/* 线（不是第一个点时才渲染） */}
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        {/* 点 */}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {list.map((item, index) => {
                      return (
                        <View className="content-item" key={index}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag tag-yellow tagthree`}>提示</View>
                            <View className="tag-news">招标结果</View>
                            <View className="date">2024-09-09</View>
                          </View>
                          <View className="content-item__cardth">
                            <View className="title">西安经发城市服务有限公司有人驾驶移动充电车采购项目（二次）中标候选人公示</View>
                            <View className="text">
                              类型：<Text>招标结果</Text>
                            </View>
                            <View className="text">
                              招采方：<Text style={{ color: '#1B5BFF' }}>西安经发城市服务有限公司</Text>
                            </View>
                            <View className="text">
                              中标方：<Text style={{ color: '#1B5BFF' }}>柳州五萎汽车工业有限公司</Text>
                            </View>
                            <View className="text">
                              地区：<Text>陕西省</Text>
                            </View>
                            <View className="text">
                              发布日期：<Text>2024-09-09</Text>
                            </View>
                          </View>
                        </View>
                      )
                    })}
                  </View>
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
