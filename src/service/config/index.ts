export const TIME_OUT = 120000

// export const BASE_URL = 'http://192.168.110.20:10017'
export const BASE_URL = 'http://192.168.110.43:10017'
// export const BASE_URL = 'https://fs.xiaohengquan.com'

// 上传文件
export const uploadFileURL = '/infra/file/upload'

// 用户/隐私协议
export const userAgreementURL = '/system/protocol/get-enabled-by-type'

// 获取地区
export const getAreaURL = '/system/area/tree'

// 配置企业信息
export const configCompanyGetURL = '/fs/user-company/get'
export const configCompanyPostURL = '/fs/user-company/create'
export const configCompanyUpdateURL = '/fs/user-company/update'

// 企业分类
export const configCompanySectorURL = '/fs/industry-category/get'

// 企业分类
export const configPreprocessingURL = '/fs/ai/data-preprocessing'

// 用户认证相关API
export const loginByPhoneURL = '/member/auth/weixin-mini-app-login'
export const loginByCodeURL = '/member/auth/sms-login'
export const loginInfoURL = '/member/user/get'
export const loginInfoUpdateURL = '/member/user/update'
export const loginSocialURL = '/member/auth/social-login'
export const refreshTokenURL = '/member/auth/refresh-token'
export const validateSmsCodeURL = '/member/auth/validate-sms-code'
export const sendSmsCodeURL = '/member/auth/send-sms-code'
export const logoutURL = '/member/auth/logout'
export const updateMobileURL = '/member/user/update-mobile'

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
export const aiSessionDeleteURL = '/fs/ai-session/delete'
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
// 删除对话反馈
export const aiMessageEvaluationDeleteURL = '/fs/ai-message-evaluation/delete'
// 添加收藏
export const userFavoriteCreateURL = '/fs/user-favorite/create'
// 删除收藏
export const userFavoriteDeleteURL = '/fs/user-favorite/delete'
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
// 获取线索跟进详情
export const clueFollowUpDetailURL = '/fs/follow-up/get'
// 更新线索跟进
export const clueFollowUpUpdateURL = '/fs/follow-up/update'
// 删除线索跟进
export const clueFollowUpDeleteURL = '/fs/follow-up/delete'
// 获取历史记录
export const clueFollowUpHistoryURL = '/fs/ai-message/page'

// 企业反馈
export const companyFeedbackCreateURL = '/fs/company-feedback/create'

// 意见反馈
export const feedbackCreateURL = '/member/feedback/create'
// 意见反馈列表
export const feedbackListURL = '/member/feedback/list'
// 意见反馈详情
export const feedbackDetailURL = '/member/feedback/get'
