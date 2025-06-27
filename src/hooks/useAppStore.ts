import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { IRootState, DispatchType } from '@/redux'

export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector
export const useAppDispatch: () => DispatchType = useDispatch
