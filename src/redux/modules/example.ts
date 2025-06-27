import { createSlice } from '@reduxjs/toolkit'
import { IExampleState } from '../types/example'

const initialState: IExampleState = {
  data: {
    total: 0,
    list: []
  },
}

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    dataAction: (state, { payload: { type, data } }) => {
      switch (type) {
        case 'set':
          state.data = {
            total: data.total,
            list: data.list
          }
          break
        default:
          break
      }
    },
    dataListAction: (state, { payload: { type, data } }) => {
      switch (type) {
        case 'set':
          state.data.list = [...data]
          break
        case 'add':
          state.data.list = [...state.data.list, ...data]
          break
        case 'remove':
          state.data.list = state.data.list.filter((item) => item.id !== data.id)
          break
        case 'update':
          state.data.list = state.data.list.map((item) => item.id === data.id ? data : item)
          break
      }
    },
  }
})

export const { dataAction, dataListAction } = exampleSlice.actions
export default exampleSlice.reducer
