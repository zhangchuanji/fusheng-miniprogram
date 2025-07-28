export const TIME_OUT = 120000
export const BASE_URL = 'http://192.168.110.35:10017'

// 用户认证相关API
export const loginByPhoneURL = '/member/auth/weixin-mini-app-login'
export const loginByCodeURL = '/member/auth/sms-login'
export const loginInfoURL = '/member/user/get'
export const loginSocialURL = '/member/auth/social-login'
export const refreshTokenURL = '/member/auth/refresh-token'
export const validateSmsCodeURL = '/member/auth/validate-sms-code'
export const sendSmsCodeURL = '/member/auth/send-sms-code'

// 企业信息相关API
export const getCompanyInfoURL = '/fs/ai/get-company-info'
export const searchCompaniesURL = '/fs/ai/search-companies'
export const getProductSellingPointsURL = '/fs/ai/getProductSellingPoints'
export const generateReportURL = '/fs/ai/generate-report'
export const enterpriseDetailURL = '/fs/ai/enterprise-detail'


// AI对话相关API
export const textStageURL = '/fs/ai/text-stage'
export const companyStageURL = '/fs/ai/company-stage'
export const guessYouWantURL = '/fs/ai/guess-you-want'

// AI会话管理相关API
export const aiSessionCreateURL = '/fs/ai-session/create'
export const aiSessionGetURL = '/fs/ai-session/get'
export const aiSessionGetHistorySessionURL = '/fs/ai-session/get-history-session'
export const aiSessionListURL = '/fs/ai-session/list'
export const aiSessionPageURL = '/fs/ai-session/page'
export const aiSessionUpdateURL = '/fs/ai-session/update'

// AI消息管理相关API
// 获取新会话
export const aiMessageCreateURL = '/fs/ai-message/create'
// 添加对话反馈
export const aiMessageEvaluationCreateURL = '/fs/ai-message-evaluation/create'
// 添加收藏
export const userFavoriteCreateURL = '/fs/user-favorite/create'
// 获取收藏列表
export const userFavoriteListURL = '/fs/user-favorite/list'

// 线索管理相关API
// 获得线索列表
export const clueListURL = '/fs/lead/page'
// 创建线索
export const clueCreateURL = '/fs/lead/create'
// 删除线索
export const clueDeleteURL = '/fs/lead/delete'
// 创建线索跟进
export const clueFollowUpCreateURL = '/fs/follow-up/create'
// 获得线索跟进分页
export const clueFollowUpPageURL = '/fs/follow-up/page'
// 更新线索跟进
export const clueFollowUpUpdateURL = '/fs/follow-up/update'
