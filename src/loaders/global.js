/* eslint-disable */
const fs = require('fs')
const colors = require('colors')
const loaderUtils = require('loader-utils')
const utils = require('./utils.js')
// 需要一个lang来保存读取文件中的数据,避免重复翻译
const GlobalLang = {}
const log = console.log
console.log = (...args) => {
  log(`\n${' global '.black.bgBlue}`, ...args)
}
const _init = langs => {
  // console.log(langs)
  // 遍历一次langs 文件不存在则创建 存在则读取
  langs.forEach(item => {
    const { path, name } = item
    if (!fs.existsSync(path)) {
      console.log(`${path} not exists!`.yellow)
      fs.writeFileSync(path, JSON.stringify({}, null, '\t'), {
        flag: 'w',
        encoding: 'utf8'
      })
    }
    GlobalLang[name] = JSON.parse(
      fs.readFileSync(path, {
        encoding: 'utf8'
      })
    )
  })
}
const getLangIndexes = langs => langs.map(({ name }) => GlobalLang[name])

const _processTranslate = async ({ inputSource, options, objPaths }) => {
  const hasTrans = {}
  // 寻找 $t(xxx)
  const matches = inputSource.match(/\$t\(\s*(.*)\s*\)/g)

  if (matches) {
    for (const match of matches) {
      const keys = utils.getKeys(match)

      for (const key of keys) {
         let tmpKey = key.substring(3, key.length - 1).replace(/^[\s]*|[\s]*$/g, '')
         // 如果传递的是一个变量而不是字符串,但是这个变量的值要在翻译内容中!
         if(!/^[\'\"]+.*[\'\"]+$/.test(tmpKey)){
           const willTranslateKey = key.substring(3, key.length - 1).replace(/^[\'\"\s]*|[\'\"\s]*$/g, '')

           const pathStr = `[\\'${objPaths
          .join("\\'][\\'")}\\'][\\'\${${willTranslateKey}}\\']`
           console.log("TCL: pathStr", pathStr)
           inputSource = inputSource.replace(key, "$t(`" + pathStr +"`)")
           continue
        }
        // 拿到$t()中间的文字
        const willTranslateKey = key
          .substring(3, key.length - 1)
          .replace(/^[\'\"\s]*|[\'\"\s]*$/g, '')

        let langIndexs = getLangIndexes(options.langs)

        for (const nextNodeName of objPaths) {
          langIndexs = langIndexs.map(item => {
            if (!item[nextNodeName]) {
              item[nextNodeName] = {}
            }
            return (item = item[nextNodeName])
          })
        }
        if (objPaths.length) {
          const sourceLang = options.langs[0].name
          for (let j = 0, len = langIndexs.length; j < len; j++) {
            if (!hasTrans[options.langs[j].name]) {
              hasTrans[options.langs[j].name] = {}
            }
            const langIndex = langIndexs[j]
            // 如果是source的索引
            if (j === 0) {
              langIndex[willTranslateKey] = willTranslateKey
            } else if (
              !hasTrans[options.langs[j].name][willTranslateKey] &&
              !langIndex[willTranslateKey]
            ) {
              try {
                const targetLang = options.langs[j].name
                langIndex[willTranslateKey] = await options.translate(
                  sourceLang,
                  targetLang,
                  willTranslateKey
                )
                // cache
                hasTrans[options.langs[j].name][willTranslateKey] =
                  langIndex[willTranslateKey]
              } catch (error) {
                console.log(`${willTranslateKey}翻译出错`.red, error)
                langIndex[willTranslateKey] = '!! TRANSLATE ERROR !!'
              }
            } else {
              langIndex[willTranslateKey] =
                hasTrans[options.langs[j].name][willTranslateKey] ||
                langIndex[willTranslateKey]
            }
          }
        }

        const pathStr = `[\\'${objPaths
          .concat(willTranslateKey)
          .join("\\'][\\'")}\\']`
        inputSource = inputSource.replace(key, `$t('${pathStr}')`)
      }
    }
  }
  return inputSource
}

const saveToLangFile = function(langs) {
  langs.forEach(item => {
    const willWriteContent = JSON.stringify(GlobalLang[item.name], null, '\t')

    const oldContent = fs.readFileSync(item.path, {
      encoding: 'utf8'
    })

    if (oldContent !== willWriteContent) {
      fs.writeFileSync(item.path, willWriteContent, {
        flag: 'w',
        encoding: 'utf8'
      })
      console.log(`更新file: ${item.path}`.green)
    }
  })
}
module.exports = async function(source) {
  const options = loaderUtils.getOptions(this)
  // 我们需要拿到这个文件的path，以确定他是src下哪个目录下的哪个文件

  const langs = options.langs
  _init(langs)
  const objPaths = utils.getObjPath(this.resourcePath)
  const outputSource = await _processTranslate({
    inputSource: source,
    options,
    objPaths
  })

  saveToLangFile(langs)

  return outputSource
}
