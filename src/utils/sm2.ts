import config from '@/config/settings'
import { sm2 } from 'sm-crypto'

/**
 * Sm2 加密方法
 * @param data
 */
export function sm2Encrypt(data: string) {
  return '04' + sm2.doEncrypt(data, config.security.sm2PubKey, 1)
}
