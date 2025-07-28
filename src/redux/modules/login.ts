import { createSlice } from '@reduxjs/toolkit'
import { ILoginState } from '../types/login'

const initialState: ILoginState = {
  loginStatus: 0,
  userInfo: null
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginStatus: (state, { payload }) => {
      state.loginStatus = payload
      return state
    },
    userInfoAction: (state, { payload: { type, data } }) => {
      switch (type) {
        case 'set':
          state.userInfo = { ...data }
          break
        case 'delete':
          state.userInfo = null
          break
      }
      return state
    }
  }
})

export const { setLoginStatus, userInfoAction } = loginSlice.actions
export default loginSlice.reducer
