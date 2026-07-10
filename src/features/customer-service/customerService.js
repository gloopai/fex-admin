export const WELCOME_MESSAGE_TEXT = '你好，请问有什么需要帮助的吗？'

export const DEMO_REPLY_TEXT = '已收到您的消息，客服正在为您处理，请稍候。'

export function createCustomerMessage({ id, sender, text = '', imageUrl = '' }) {
  const normalizedText = String(text).trim()
  const normalizedImageUrl = String(imageUrl).trim()
  if (!normalizedText && !normalizedImageUrl) return null

  return {
    id,
    sender,
    text: normalizedText,
    imageUrl: normalizedImageUrl
  }
}
