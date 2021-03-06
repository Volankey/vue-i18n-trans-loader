var fs = require("fs");
var utils = require("./utils.js");
const colors = require("colors");
const loaderUtils = require("loader-utils");
//需要一个lang来保存读取文件中的数据,避免重复翻译
var GlobalLang = {};
var log = console.log;
console.log = (...args) => {
    log("\n" + " global ".black.bgBlue, ...args);
}
const _init = (langs) => {
    // console.log(langs)
    // 遍历一次langs 文件不存在则创建 存在则读取
    langs.forEach((item) => {
        let {
            path,
            name
        } = item;
        if (!fs.existsSync(path)) {
            console.log((path + " not exists!").yellow);
            fs.writeFileSync(path, JSON.stringify({}, null, "\t"), {
                flag: "w",
                encoding: "utf8"
            });
        }
        GlobalLang[name] = JSON.parse(fs.readFileSync(path, {
            encoding: "utf8"
        }));

    });
}
const getLangIndexes = (langs) => {
    return langs.map(({
        name
    }) => {
        return GlobalLang[name]
    })
}

const _processTranslate = async ({
    inputSource,
    options,
    objPaths
}) => {
    let hasTrans = {};
    //寻找 $t(xxx)
    let matches = inputSource.match(/\$t\((.*)\)/g);

    if (matches) {
        for (let match of matches) {
            let keys = utils.getKeys(match);

            for (let key of keys) {
                //拿到$t()中间的文字
                let willTranslateKey = key.substring(4, key.length - 2);

                let langIndexs = getLangIndexes(options.langs);

                for (let nextNodeName of objPaths) {
                    langIndexs = langIndexs.map((item) => {
                        if (!item[nextNodeName]) {
                            item[nextNodeName] = {};
                        }
                        return item = item[nextNodeName];
                    })
                }
                if (objPaths.length) {
                    let sourceLang = options.langs[0].name;
                    for (let j = 0, len = langIndexs.length; j < len; j++) {
                        if(!hasTrans[options.langs[j].name]){
                            hasTrans[options.langs[j].name] = {};
                        }
                        let langIndex = langIndexs[j];
                        //如果是source的索引
                        if (j === 0) {
                            langIndex[willTranslateKey] = willTranslateKey;
                        } else if (!hasTrans[options.langs[j].name][willTranslateKey] && !langIndex[willTranslateKey]) {
                            try {
                                // console.log("不存在嘛? ".red,langIndex[willTranslateKey])
                                // console.log("000000",j,len,options.langs[j].name)
                                
                                let targetLang = options.langs[j].name;
                                langIndex[willTranslateKey] = await options.translate(sourceLang, targetLang, willTranslateKey);
                                //cache
                                hasTrans[options.langs[j].name][willTranslateKey] = langIndex[willTranslateKey];
                            } catch (error) {
                                // console.log(error)
                                console.log((willTranslateKey + "翻译出错").red, error)
                                langIndex[willTranslateKey] = "!! TRANSLATE ERROR !!"
                            }
                        } else {
                            langIndex[willTranslateKey] = hasTrans[options.langs[j].name][willTranslateKey] || langIndex[willTranslateKey];
                        }
                    }
                }

                let pathStr = `[\\'` + objPaths.concat(willTranslateKey).join(`\\'][\\'`) + `\\']`
                inputSource = inputSource.replace(key, `$t('${pathStr}')`);
            }

        }
    }
    return inputSource;
}

const saveToLangFile = function (langs) {
    langs.forEach(item => {
        let willWriteContent = JSON.stringify(GlobalLang[item.name], null, "\t"),
            oldContent = fs.readFileSync(item.path, {
                encoding: "utf8"
            });

        if (oldContent !== willWriteContent) {
            fs.writeFileSync(item.path, willWriteContent, {
                flag: "w",
                encoding: "utf8"
            });
            console.log(("更新file: " + item.path).green);

        }


    })


}
module.exports = async function (source) {


    const options = loaderUtils.getOptions(this);
    //我们需要拿到这个文件的path，以确定他是src下哪个目录下的哪个文件

    let langs = options.langs;

    // console.log(options);
    _init(langs);
    let objPaths = utils.getObjPath(this.resourcePath);
    // console.log(objPaths);
    var outputSource = await _processTranslate({
        inputSource: source,
        options,
        objPaths
    });

    saveToLangFile(langs);

    return outputSource;

}