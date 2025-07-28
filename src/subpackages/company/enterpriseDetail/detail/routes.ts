// 企业信息详情页面路由配置
export const enterpriseDetailRoutes = {
  // 工商信息详情
  businessInfo: {
    path: '/subpackages/company/enterpriseDetail/detail/businessInfo/index',
    title: '工商信息'
  },
  // 股东信息详情
  shareholderInfo: {
    path: '/subpackages/company/enterpriseDetail/detail/shareholderInfo/index',
    title: '股东信息'
  },
  // 人员信息详情
  personnelInfo: {
    path: '/subpackages/company/enterpriseDetail/detail/personnelInfo/index',
    title: '人员信息'
  },
  // 核心人员详情
  corePersonnel: {
    path: '/subpackages/company/enterpriseDetail/detail/corePersonnel/index',
    title: '核心人员'
  },
  // 工商变更详情
  businessChange: {
    path: '/subpackages/company/enterpriseDetail/detail/businessChange/index',
    title: '工商变更'
  },
  // 企业年报详情
  annualReport: {
    path: '/subpackages/company/enterpriseDetail/detail/annualReport/index',
    title: '企业年报'
  },
  // 对外投资详情
  foreignInvestment: {
    path: '/subpackages/company/enterpriseDetail/detail/foreignInvestment/index',
    title: '对外投资'
  },
  // 分支机构详情
  branchOffice: {
    path: '/subpackages/company/enterpriseDetail/detail/branchOffice/index',
    title: '分支机构'
  },
  // 实际控制人详情
  actualController: {
    path: '/subpackages/company/enterpriseDetail/detail/actualController/index',
    title: '实际控制人'
  },
  // 实际控制权详情
  actualControl: {
    path: '/subpackages/company/enterpriseDetail/detail/actualControl/index',
    title: '实际控制权'
  },
  // 直接控制企业详情
  directControl: {
    path: '/subpackages/company/enterpriseDetail/detail/directControl/index',
    title: '直接控制企业'
  },
  // 工商自主公示详情
  businessPublicity: {
    path: '/subpackages/company/enterpriseDetail/detail/businessPublicity/index',
    title: '工商自主公示'
  },
  // 协同股东详情
  cooperativeShareholder: {
    path: '/subpackages/company/enterpriseDetail/detail/cooperativeShareholder/index',
    title: '协同股东'
  },
  // 间接持股企业详情
  indirectHolding: {
    path: '/subpackages/company/enterpriseDetail/detail/indirectHolding/index',
    title: '间接持股企业'
  },
  // 疑似关系详情
  suspectedRelation: {
    path: '/subpackages/company/enterpriseDetail/detail/suspectedRelation/index',
    title: '疑似关系'
  },
  // 企业产品详情
  enterpriseProduct: {
    path: '/subpackages/company/enterpriseDetail/detail/enterpriseProduct/index',
    title: '企业产品'
  },
  // 同业分析详情
  industryAnalysis: {
    path: '/subpackages/company/enterpriseDetail/detail/industryAnalysis/index',
    title: '同业分析'
  }
}

// 获取详情页面路径
export const getDetailPath = (type: string) => {
  return enterpriseDetailRoutes[type as keyof typeof enterpriseDetailRoutes]?.path || ''
}

// 获取详情页面标题
export const getDetailTitle = (type: string) => {
  return enterpriseDetailRoutes[type as keyof typeof enterpriseDetailRoutes]?.title || '详情'
}
