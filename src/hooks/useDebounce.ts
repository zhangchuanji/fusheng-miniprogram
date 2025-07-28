import { useCallback, useRef } from 'react'

/**
 * 防抖 Hook
 * @param callback 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * 防抖 Hook（带立即执行选项）
 * @param callback 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 * @returns 防抖后的函数
 */
export function useDebounceWithImmediate<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const immediateRef = useRef<boolean>(true)

  return useCallback(
    (...args: Parameters<T>) => {
      const callNow = immediate && immediateRef.current

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 如果需要立即执行且是第一次调用
      if (callNow) {
        callback(...args)
        immediateRef.current = false
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(() => {
        immediateRef.current = true
        if (!callNow) {
          callback(...args)
        }
      }, delay)
    },
    [callback, delay, immediate]
  )
}

export default useDebounce