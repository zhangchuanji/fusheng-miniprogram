import { useAppSelector, useAppDispatch } from './useAppStore'
import { getExampleDataAsync } from '@/redux/asyncs/example'
import { IExampleRequest } from '@/api/types/example'

export const useExampleActions = () => {
  const dispatch = useAppDispatch()
  const {
    example: {
      data
    }
  } = useAppSelector((state) => state)

  // 获取示例数据
  const getExampleData = (request: IExampleRequest) => {
    dispatch(getExampleDataAsync(request))
  }

  return {
    exampleData: data,
    getExampleData
  }
}