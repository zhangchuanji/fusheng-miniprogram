import React from 'react'
import { View, Text } from '@tarojs/components'
import './CustomDialog.scss'

interface CustomDialogProps {
  visible: boolean
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const CustomDialog: React.FC<CustomDialogProps> = ({ visible, title, content, confirmText = '确定', cancelText = '取消', onConfirm, onCancel }) => {
  if (!visible) return null
  return (
    <View className="custom-dialog-mask">
      <View className="custom-dialog-container">
        <View className="custom-dialog-title">{title}</View>
        <View className="custom-dialog-content">{content}</View>
        <View className="custom-dialog-divider" />
        <View className="custom-dialog-actions">
          <View className="custom-dialog-btn cancel" onClick={onCancel}>
            {cancelText}
          </View>
          <View className="custom-dialog-btn confirm" onClick={onConfirm}>
            {confirmText}
          </View>
        </View>
      </View>
    </View>
  )
}

export default CustomDialog
