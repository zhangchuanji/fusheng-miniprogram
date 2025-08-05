import { createAsyncThunk } from '@reduxjs/toolkit'
import { IThunkState } from '../types/index'
import { setLoading, setConversations, setFavorites } from '../modules/conversation'
import { aiSessionListAPI, userFavoriteListAPI } from '@/api/chatMsg'

// 将API转换为Promise
const aiSessionListPromise = (params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    aiSessionListAPI(params, (res) => {
      if (res.success) {
        resolve(res.data)
      } else {
        reject(res)
      }
    })
  })
}

const userFavoriteListPromise = (params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    userFavoriteListAPI(params, (res) => {
      if (res.success) {
        resolve(res.data)
      } else {
        reject(res)
      }
    })
  })
}

// 获取会话列表
export const getSessionListAsync = createAsyncThunk<void, void, IThunkState>(
  'conversation/getSessionListAsync',
  async (_, { dispatch, getState }) => {
    const state = getState()
    const userId = state.login.userInfo?.id
    
    if (!userId) {
      console.error('用户未登录')
      return
    }
    
    dispatch(setLoading(true))
    
    try {
      const data = await aiSessionListPromise({ userId })
      const convertedData = Object.entries(data).map(([name, list]) => ({
        name,
        list: list as any[]
      }))
      dispatch(setConversations(convertedData))
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      dispatch(setLoading(false))
    }
  },
  {
    condition: undefined
  }
)

// 获取收藏列表
export const getFavoriteListAsync = createAsyncThunk<void, void, IThunkState>(
  'conversation/getFavoriteListAsync',
  async (_, { dispatch, getState }) => {
    const state = getState()
    const userId = state.login.userInfo?.id
    
    if (!userId) {
      console.error('用户未登录')
      return
    }
    
    dispatch(setLoading(true))
    
    try {
      const data = await userFavoriteListPromise({ userId })
      const favoriteList = data.map((item: any) => ({
        ...item,
        role: 'ai',
        apiStatus: {
          textComplete: true,
          companyComplete: true
        },
        content: item.contentSummary,
        companyList: JSON.parse(item.enterpriseInfo).companyList,
        splitNum: JSON.parse(item.enterpriseInfo).splitNum,
        total: JSON.parse(item.enterpriseInfo).total
      }))
      dispatch(setFavorites(favoriteList))
    } catch (error) {
      console.error('获取收藏列表失败:', error)
    } finally {
      dispatch(setLoading(false))
    }
  },
  {
    condition: undefined
  }
)
