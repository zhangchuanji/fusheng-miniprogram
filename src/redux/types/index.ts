import { DispatchType, IRootState } from '..'
  
  export interface IThunkState {
    state: IRootState
    dispatch: DispatchType
  }
