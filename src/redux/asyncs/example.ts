/**
 * 示例异步请求
 * 使用 createAsyncThunk 创建异步请求
 * 使用 condition 禁用 AbortController 依赖
 * 使用 payload 作为请求参数
 * 使用 dispatch 分派数据到 redux
 * 使用 res.success 判断请求是否成功
 * 使用 res.data 获取请求数据
 * 使用 res.errMsg 获取请求错误信息
 * @reduxjs/toolkit不使用最新版使用1.8.0，确保@reduxjs/toolkit内部不使用AbortController
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { IThunkState } from '../types/index'
import { dataAction } from '../modules/example'
// 请求参数类型
import { IExampleRequest } from '@/api/types/example'

export const getExampleDataAsync = createAsyncThunk<void, IExampleRequest, IThunkState>('example/getExampleDataAsync', async (payload, { dispatch }) => {}, {
  condition: undefined // 禁用条件,禁用 AbortController 依赖
})
