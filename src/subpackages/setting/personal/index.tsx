import React, { useState, useEffect, useRef } from 'react'
import { Image, Input, View, Button, ScrollView } from '@tarojs/components'
import { Radio, Picker } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { ArrowRightSize6, CheckNormal, Checked } from '@nutui/icons-react-taro'
import { loginInfoAPI, getAreaAPI, loginInfoUpdateAPI } from '@/api/setting'
import { BASE_URL } from '@/service/config' // 新增导入
import { useAppDispatch } from '@/hooks/useAppStore'
import { userInfoAction } from '@/redux/modules/login'

interface UserInfo {
  id: undefined | number
  nickname: undefined | string
  position: undefined | string
  avatar: undefined | string
  areaId: undefined | number
  mobile: undefined | string
  sex: undefined | number
}

function Index() {
  const dispatch = useAppDispatch()

  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: undefined,
    nickname: undefined,
    position: undefined,
    avatar: undefined,
    areaId: undefined,
    mobile: undefined,
    sex: undefined
  })

  // 添加地区选择相关状态
  const [isVisible, setIsVisible] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [customCityData, setCustomCityData] = useState([])
  const [value, setValue] = useState([])
  const [selectedAreaText, setSelectedAreaText] = useState('请选择地区')
  const [originalAreaData, setOriginalAreaData] = useState([]) // 保存原始地区数据
  const scrollViewRef = useRef(null)

  // 处理地区数据转换
  const transformAreaData = (data: any) => {
    return data.map((province: any) => ({
      text: province.name,
      value: province.id,
      children: province.children
        ? province.children.map((city: any) => ({
            text: city.name,
            value: city.id,
            children: city.children
              ? city.children.map((district: any) => ({
                  text: district.name,
                  value: district.id
                }))
              : []
          }))
        : []
    }))
  }

  // 根据地区ID查找完整路径
  const findAreaPath = (areaId: any, data: any, path = []) => {
    for (const province of data) {
      if (province.id === areaId) {
        return [...path, { id: province.id, name: province.name }]
      }

      if (province.children) {
        for (const city of province.children) {
          if (city.id === areaId) {
            return [...path, { id: province.id, name: province.name }, { id: city.id, name: city.name }]
          }

          if (city.children) {
            for (const district of city.children) {
              if (district.id === areaId) {
                return [...path, { id: province.id, name: province.name }, { id: city.id, name: city.name }, { id: district.id, name: district.name }]
              }
            }
          }
        }
      }
    }
    return null
  }

  // 设置回显数据
  const setAreaEcho = (areaId: any, areaData: any) => {
    if (!areaId || !areaData.length) return

    const areaPath = findAreaPath(areaId, areaData)
    if (areaPath) {
      const valueArray: any = areaPath.map(item => item.id)
      const textArray = areaPath.map(item => item.name)
      setValue(valueArray)
      setSelectedAreaText(textArray.join(' '))
    }
  }

  // 设置选择的地区值
  const setChooseValueCustom = (chooseValue: any) => {
    const valueArray = chooseValue.map((item: any) => item.value)
    setValue(valueArray)
    const selectedText = chooseValue.map((item: any) => item.text).join(' ')
    setSelectedAreaText(selectedText)
    const lastAreaId = valueArray[valueArray.length - 1]
    setUserInfo({ ...userInfo, areaId: lastAreaId })

    setIsVisible(false)
  }

  useEffect(() => {
    loginInfoAPI({}, res => {
      if (res.success) {
        setUserInfo(res.data)
      }
    })

    getAreaAPI({}, res => {
      if (res.success && res.data) {
        setOriginalAreaData(res.data)
        const transformedData = transformAreaData(res.data)
        setCustomCityData(transformedData)
      }
    })
  }, [])

  useEffect(() => {
    if (userInfo.areaId && originalAreaData.length > 0) {
      setAreaEcho(userInfo.areaId, originalAreaData)
    }
  }, [userInfo.areaId, originalAreaData])

  function formatId(id: any) {
    const numId = parseInt(id)
    const formattedId = numId >= 100 ? numId.toString() : numId.toString().padStart(3, '0')
    return `GLKS${formattedId}`
  }

  const [isKeyboardActive, setIsKeyboardActive] = useState(false)

  // 改进的焦点处理函数
  const getFocusScrollTop = async (e: any, inputType: string = 'position') => {
    try {
      setIsKeyboardActive(true)

      const systemInfo = await Taro.getSystemInfo()
      const windowHeight = systemInfo.windowHeight
      const keyboardHeight = e.detail.height || windowHeight * 0.4 // 键盘高度

      const visibleHeight = windowHeight - keyboardHeight

      let targetScrollTop = 0

      if (inputType === 'nickname') {
        targetScrollTop = 0
      } else if (inputType === 'position') {
        const estimatedInputPosition = 144 + 72 + 5 * 110 // 约766rpx
        const estimatedInputPositionPx = estimatedInputPosition * (systemInfo.screenWidth / 750) // 转换为px
        if (estimatedInputPositionPx > visibleHeight * 0.6) {
          targetScrollTop = estimatedInputPositionPx - visibleHeight * 0.3
        } else {
          targetScrollTop = Math.max(100, keyboardHeight * 0.3)
        }
      }
      setScrollTop(targetScrollTop)
    } catch (error) {
      setIsKeyboardActive(true)
      const fallbackScrollTop = inputType === 'position' ? 400 : 0
      setScrollTop(fallbackScrollTop)
    }
  }

  const getBlurScrollTop = (e: any) => {
    setIsKeyboardActive(false)
    setTimeout(() => {
      setScrollTop(0)
    }, 300)
  }

  function onChooseAvatar(val: any) {
    // 获取token
    const tokenData = Taro.getStorageSync('token')
    const token = tokenData?.accessToken
    Taro.uploadFile({
      url: `${BASE_URL}/app-api/infra/file/upload`,
      filePath: val.detail.avatarUrl,
      name: 'file', // 这是FormData中的字段名
      header: {
        Authorization: `Bearer ${token}`,
        'tenant-id': '1'
      },
      formData: {
        // 这里的数据会自动转换为FormData格式
        fileName: 'avatarUrl'
      },
      success: res => {
        let responseData
        try {
          responseData = JSON.parse(res.data)
        } catch (error) {
          console.error('解析响应数据失败:', error)
          responseData = res.data
        }

        // 获取服务器返回的文件URL
        const fileUrl = responseData?.data
        setUserInfo({ ...userInfo, avatar: fileUrl })

        fail: error => {
          console.error('上传失败:', error)
        }
      }
    })
  }

  function saveInfo() {
    if( userInfo?.position && userInfo.position.length > 6 ) {
      Taro.showToast({
        title: '职位不能超过6个字符',
        icon: 'none'
      })
      return
    }
    loginInfoUpdateAPI(userInfo, res => {
      if (res.success) {
        loginInfoAPI({}, res => {
          if (res.success) {
            dispatch(userInfoAction({ type: 'set', data: res.data }))
            Taro.navigateBack()
            Taro.showToast({
              title: '保存成功',
              icon: 'none'
            })
          }
        })
      }
    })
  }

  return (
    <ScrollView ref={scrollViewRef} scrollY scrollTop={scrollTop} scrollWithAnimation className={`detailPage ${isKeyboardActive ? 'keyboard-active' : ''}`}>
      <Button open-type="chooseAvatar" onChooseAvatar={onChooseAvatar} className="avatar">
        <Image src={userInfo.avatar || 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png'} className="avatar_img" />
      </Button>
      <Picker visible={isVisible} options={customCityData} value={value} onClose={() => setIsVisible(false)} onConfirm={setChooseValueCustom} />
      <View className="info_list">
        <View className="info_item">
          <View>昵称</View>
          <View>
            <Input type="nickname" style={{ textAlign: 'right' }} value={userInfo?.nickname} onInput={e => setUserInfo({ ...userInfo, nickname: e.detail.value })} adjustPosition={false} onFocus={e => getFocusScrollTop(e, 'nickname')} onBlur={getBlurScrollTop} />
          </View>
        </View>

        <View className="info_item">
          <View>ID</View>
          <View>{formatId(userInfo?.id)}</View>
        </View>

        <View className="info_item">
          <View>手机号</View>
          <View>{userInfo?.mobile}</View>
        </View>

        <View className="info_item" onClick={() => setIsVisible(true)}>
          <View>地区</View>
          <View>
            {selectedAreaText} <ArrowRightSize6 size={'28rpx'} color="#8A8A8A" />
          </View>
        </View>

        <View className="info_item">
          <View>性别</View>
          <View>
            <Radio.Group labelPosition="left" value={userInfo.sex || '1'} direction="horizontal" onChange={(value: any) => setUserInfo({ ...userInfo, sex: value })}>
              <Radio activeIcon={<Checked color="#666666" size="24rpx" />} icon={<CheckNormal color="#dfdfdf" size="24rpx" />} value={1}>
                男
              </Radio>
              <Radio activeIcon={<Checked color="#666666" size="24rpx" />} icon={<CheckNormal color="#dfdfdf" size="24rpx" />} value={2}>
                女
              </Radio>
            </Radio.Group>
          </View>
        </View>

        <View className="info_item">
          <View>职位</View>
          <View>
            <Input adjustPosition={false}  onFocus={e => getFocusScrollTop(e, 'position')} onBlur={getBlurScrollTop} style={{ textAlign: 'right' }} value={userInfo?.position} onInput={e => setUserInfo({ ...userInfo, position: e.detail.value })} />
          </View>
        </View>
      </View>
      <View onClick={() => saveInfo()} className="save_btn">
        保存
      </View>
    </ScrollView>
  )
}

export default Index
