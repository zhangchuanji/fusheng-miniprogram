import { useAppSelector, useAppDispatch } from './useAppStore'
import { getExampleDataAsync } from '@/redux/asyncs/example'
import { IExampleRequest } from '@/api/types/example'
import { useCallback } from 'react'

export const useExampleActions = () => {
  const dispatch = useAppDispatch()
  // Fix: Select only the specific data you need instead of the entire state
  const exampleData = useAppSelector(state => state.example.data)

  // 获取示例数据
  const getExampleData = useCallback(
    (request: IExampleRequest) => {
      dispatch(getExampleDataAsync(request))
    },
    [dispatch]
  )

  return {
    exampleData,
    getExampleData
  }
}
