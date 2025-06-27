import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './modules/example'

const store = configureStore({
  reducer: {
    example: exampleReducer,
  },
})

export type IRootState = ReturnType<typeof store.getState>
export type DispatchType = typeof store.dispatch

export default store
