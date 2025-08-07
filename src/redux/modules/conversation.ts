import { createSlice } from '@reduxjs/toolkit'

// 会话消息接口
export interface IMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
  companyList?: any[]
  apiStatus?: { textComplete: boolean; companyComplete: boolean }
  messageId?: string
  splitNum?: number
  total?: number
}

// 历史会话接口
export interface IConversation {
  name: string
  list: IMessage[]
  createdAt: number
  updatedAt: number
}

// 收藏项接口
export interface IFavoriteItem {
  id: string
  type: 'company' | 'message' | 'conversation'
  title: string
  content: any
  createdAt: number
  tags?: string[]
}

// 会话状态接口
export interface IConversationState {
  conversations: IConversation[]
  currentConversationId: string | null
  favorites: IFavoriteItem[]
  loading: boolean
}

const initialState: IConversationState = {
  conversations: [],
  currentConversationId: null,
  favorites: [],
  loading: false
}

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, { payload }) => {
      state.loading = payload
      return state
    },

    // 设置会话列表
    setConversations: (state, { payload }) => {
      state.conversations = payload
      return state
    },

    // 设置当前会话ID
    setCurrentConversationId: (state, { payload }) => {
      state.currentConversationId = payload
      return state
    },

    // 设置收藏列表
    setFavorites: (state, { payload }) => {
      state.favorites = payload
      return state
    }
  }
})

export const { setLoading, setConversations, setCurrentConversationId, setFavorites } = conversationSlice.actions

export default conversationSlice.reducer
