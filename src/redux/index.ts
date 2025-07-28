import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './modules/example'
import loginReducer from './modules/login'

const store = configureStore({
  reducer: {
    example: exampleReducer,
    login: loginReducer
  }
})

export type IRootState = ReturnType<typeof store.getState>
export type DispatchType = typeof store.dispatch

export default store
