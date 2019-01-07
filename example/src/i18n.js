import cn from './assets/lang/cn.json'
import en from './assets/lang/en.json'
import jp from './assets/lang/jp.json'
import yue from './assets/lang/yue.json'


import VueI18n from 'vue-i18n'
import Vue from 'vue'

Vue.use(VueI18n);

var lastLang = window.localStorage.getItem("lang") || 'JP';

const i18n = new VueI18n({
  locale: lastLang, // 语言标识
  messages: {
    'CN':cn , // 中文语言包
    'EN':en,  // 英文语言包
    'JP':jp,
    'YUE':yue
  },
})

export default i18n;