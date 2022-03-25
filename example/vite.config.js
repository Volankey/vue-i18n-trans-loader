import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import axios from 'axios'
const md5 = require('md5-node')
const i18nAutoTranslatePlugin = require('../src/loaders/global')
const langs = [
  {
    name: 'zh',
    path: resolve('./src/assets/lang/zh.json'),
  },
  {
    name: 'en',
    path: resolve('./src/assets/lang/en.json'),
  },
]
const opt = {
  langs,
  includes: /\.(vue|js|ts|jsx|tsx)$/,
  translate: async function (from, to, key) {
    const appid = '20190103000254365'
    const secretKey = 'sCIvB1J_Pe08TegAX2sP'
    const sign = md5(`${appid + key}12345${secretKey}`)
    console.log(from, to, key, '翻译中....')
    console.log(
      'url',
      `http: //api.fanyi.baidu.com/api/trans/vip/translate?q=${key}&from=${from}&to=${to}&appid=${appid}&salt=12345&sign=${sign}`
    )
    const res = await axios.get(
      encodeURI(
        `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${key}&from=${from}&to=${to}&appid=${appid}&salt=12345&sign=${sign}`
      )
    )
    console.log(res.data)
    console.log(`${key}>>>${res.data.trans_result[0].dst}`)

    return res.data.trans_result[0].dst
  },
}



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),i18nAutoTranslatePlugin(opt),]
})
