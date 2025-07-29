import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { Table } from '@nutui/nutui-react-taro'
import './index.scss'

function Index() {
  const [columnsData, setColumnsData] = useState([
    {
      title: '评分维度',
      key: 'scoring',
      align: 'center'
    },
    {
      title: '权重',
      key: 'weight',
      align: 'center'
    },
    {
      title: '客户实际情况',
      key: 'actualSituation',
      align: 'center'
    },
    {
      title: '得分',
      key: 'score',
      align: 'center'
    }
  ])
  const [tableData, setTableData] = useState([
    {
      scoring: '企业规模',
      weight: '20%',
      actualSituation: '员工人数500人以上',
      score: '85'
    },
    {
      scoring: '财务状况',
      weight: '20%',
      actualSituation: '年营收5000万以上',
      score: '92'
    },
    {
      scoring: '技术实力',
      weight: '15%',
      actualSituation: '拥有核心技术专利',
      score: '78'
    },
    {
      scoring: '市场地位',
      weight: '15%',
      actualSituation: '行业排名前20%',
      score: '88'
    },
    {
      scoring: '管理能力',
      weight: '10%',
      actualSituation: '管理体系完善',
      score: '82'
    },
    {
      scoring: '创新能力',
      weight: '10%',
      actualSituation: '近3年有新产品推出',
      score: '75'
    },
    {
      scoring: '风险控制',
      weight: '5%',
      actualSituation: '无重大风险事件',
      score: '95'
    }
  ])
  // 统计总权重
  const totalWeight = tableData.reduce((sum, row) => sum + parseFloat(row.weight), 0) + '%'
  // 统计总分（直接相加，不考虑权重）
  const totalScore = tableData.reduce((sum, row) => sum + Number(row.score), 0)
  const tableDataWithTotal = [
    ...tableData,
    {
      scoring: '总匹配度',
      weight: totalWeight,
      actualSituation: '–',
      score: totalScore + '分'
    }
  ]

  return (
    <View className="detailPage">
      {/* 顶部 */}
      <View className="top">
        <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail25.png" className="top_left_Img" />
        <View className="top_right">
          <Text>匹配度：</Text>
          <Text className="top_right_item_text">90%</Text>
        </View>
      </View>

      {/* 表格 */}
      <View className="table">
        <Table columns={columnsData} data={tableDataWithTotal} />
      </View>

      {/* 主营产品 */}
      <View className="common_title">
        <View className="common_title_title">
          <Text>主营产品</Text>
        </View>
        <View className="common_content">
          <View className="common_content_item">汽车发动机汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
        </View>
      </View>

      {/* 核心应用领域及典型案例 */}
      <View className="common_title">
        <View className="common_title_title">
          <Text>核心应用领域及典型案例</Text>
        </View>
        <View className="common_text">案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例</View>
      </View>

      {/* 潜在需求分析 */}
      <View className="common_title">
        <View className="common_title_title">
          <Text>潜在需求分析</Text>
        </View>
        <View className="common_content">
          <View className="common_content_item">汽车发动机汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
          <View className="common_content_item">汽车发动机</View>
        </View>
      </View>

      {/* 关键信息 */}
      <View className="common_title">
        <View className="common_title_title">
          <Text>关键信息</Text>
        </View>
        <View className="common_content">
          <View className="common_item">
            <View className="common_item_left">
              <Text className="common_item_left_title">官网提示“2024年新增3条产线”</Text>
              <Text className="common_item_left_text">查看</Text>
            </View>
            <View className="common_item_right">跟进建议：直接推定制方案</View>
          </View>
        </View>
      </View>
       
      {/* 潜在风险提示 */}
      <View className="common_title">
        <View className="common_title_title">
          <Text>潜在风险提示</Text>
        </View>
        <View className="common_text">案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例案例</View>
      </View>
    </View>
  )
}

export default Index
