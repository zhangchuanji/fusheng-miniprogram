export default defineAppConfig({
  pages: ['pages/login/index', 'pages/index/index'],
  subPackages: [
    {
      root: 'subpackages/login',
      name: 'login',
      pages: ['loginCode/index', 'loginPhone/index', 'companyProfile/index', 'businessProfile/index']
    },
    {
      root: 'subpackages/cluePage',
      name: 'clue',
      pages: ['follow/index', 'editFollow/index', 'addFollow/index']
    },
    {
      root: 'subpackages/setting',
      name: 'setting',
      pages: ['index', 'account/index', 'changePhone/index', 'aboutUs/index', 'contactUs/index', 'personal/index', 'feedback/index', 'feedbackRecords/index', 'feedbackDetail/index', 'enterprise/index', 'userAgreement/index', 'privacyPolicy/index']
    },
    {
      root: 'subpackages/company',
      name: 'company',
      pages: [
        'aiResearchReport/index',
        'enterpriseDetail/index',
        'enterpriseDetail/detail/businessInfo/index',
        'enterpriseDetail/detail/shareholderInfo/index',
        'enterpriseDetail/detail/personnelInfo/index',
        'enterpriseDetail/detail/corePersonnel/index',
        'enterpriseDetail/detail/businessChange/index',
        'enterpriseDetail/detail/annualReport/index',
        'enterpriseDetail/detail/foreignInvestment/index',
        'enterpriseDetail/detail/branchOffice/index',
        'enterpriseDetail/detail/actualController/index',
        'enterpriseDetail/detail/actualControl/index',
        'enterpriseDetail/detail/directControl/index',
        'enterpriseDetail/detail/businessPublicity/index',
        'enterpriseDetail/detail/cooperativeShareholder/index',
        'enterpriseDetail/detail/indirectHolding/index',
        'enterpriseDetail/detail/suspectedRelation/index',
        'enterpriseDetail/detail/enterpriseProduct/index',
        'enterpriseDetail/detail/industryAnalysis/index',
        'enterpriseDetail/detail/analysisInfo/index',
        'enterpriseDetail/detail/peerInfo/index',
        'enterpriseDetail/detail/enterpriseManagement/index',
        'enterpriseDetail/detail/dynamicInfo/index',
        'enterpriseDetail/detail/legalCase/index',
        'enterpriseDetail/detail/legalCaseDetail/index',
        'enterpriseDetail/detail/judgmentDetail/index',
        'enterpriseSearch/index',
        'advancedFilter/index',
        'searchEnterprise/index'
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
  // lazyCodeLoading: 'requiredComponents'
})
