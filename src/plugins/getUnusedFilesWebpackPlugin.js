const globAll = require("glob-all");// 获取路径下的所有文件和文件夹路径
const path = require("path");
const fs = require("fs");

// 组装全局配置
const globOptionsWith = (compiler, globOptions) => {
  return {
    cwd: compiler.context,// 当前路径
    ...globOptions// 配置
  };
}


// 获取依赖资源文件路径列表
const getFileDepsMap = (compilation) => {
  /*
  compilation.fileDependencies一个存放模块中包含的源文件路径的数组。它包含了 JavaScript 源文件自身（例如：index.js），和所有被请求（required）的依赖资源文件（样式表，图像等等）。想要知道哪些源文件属于这个模块时，检查这些依赖是有帮助的。
  */
  const fileDepsBy = [...compilation.fileDependencies].reduce(
    (acc, usedFilepath) => {
      acc[usedFilepath] = true;
      return acc;
    },
    {}
  );
  const { assets } = compilation;
  Object.keys(assets).forEach(assetRelpath => {
    const existsAt = assets[assetRelpath].existsAt;
    fileDepsBy[existsAt] = true;
  });
  return fileDepsBy;
}

// 同步获取路径下面的文件夹
const syncGetDirAllFiles = (patterns, options) => {
  return globAll.sync(
    patterns,
    options
  );
}

// 获取未使用文件及文件夹列表
const syncApplyAfterEmit = (compiler, compilation, plugin) => {
  const globOptions = globOptionsWith(compiler, plugin.globOptions);
  const fileDepsMap = getFileDepsMap(compilation);
  // 获取
  const files = syncGetDirAllFiles(
    plugin.options.patterns,
    globOptions
  );
  // 过滤出未使用的文件
  const unused = files.filter(
    it => !fileDepsMap[path.join(globOptions.cwd, it)] && it.indexOf('.') !== -1
  );
  console.log('unused file num', unused.length)
  unused.forEach(file => {
    console.log('unused file', file)
  })
  return unused
}

// 删除未使用的文件的翻译
const deleteTranslationOfUnusedFiles = (unusedFiles, langs) => {
  // 获取要删除的文件路径
  const filePaths = unusedFiles.reduce((acc, filePath) => {
    const paths = filePath.substring(4).split('/').filter(item => item.length).map(item => `${item}`)
    acc.push(paths)
    return acc
  }, []).filter(item => item.length)
  // 读取翻译文件
  const langsObj = readLangFiles(langs)
  let needToSave = false
  // 删除未使用文件的翻译
  Object.values(langsObj).forEach(langObj => {
    filePaths.forEach(filePath => {
      let tmpLangObj = langObj
      let needDelete = true
      let parentLangObj = langObj
      for (let i = 0; i < filePath.length; i++) {
        const curFilePath = filePath[i]
        if (!tmpLangObj[curFilePath]) {
          needDelete = false
          break
        }
        parentLangObj = tmpLangObj
        tmpLangObj = tmpLangObj[curFilePath]
      }
      if (needDelete) {
        const key = filePath[filePath.length - 1]
        delete parentLangObj[key]
        needToSave = true
      }
    })
  })
  if (needToSave)
    saveToLangFile(langsObj, langs)
}

const readLangFiles = (langs) => {
  const langsObj = {};
  langs.forEach((item) => {
    let {
      path: langFilePath,
      name
    } = item;
    if (!fs.existsSync(langFilePath)) {
      console.log((langFilePath + " not exists!").yellow);
    }
    langsObj[name] = JSON.parse(fs.readFileSync(langFilePath, {
      encoding: "utf8"
    }));
  });
  return langsObj
}

const saveToLangFile = function (langsObj, langs) {
  langs.forEach(item => {
    fs.writeFileSync(item.path, JSON.stringify(langsObj[item.name], null, "\t"), {
      flag: "w",
      encoding: "utf8"
    });
    console.log(("更新file: " + item.path).green);
  })
}

class getUnusedFilesWebpackPlugin {
  constructor(options = {}) {
    // 挂载options
    this.options = {
      ...options,
      patterns: options.patterns || [`**/*.*`],
    };
    // 挂载globOptions
    this.globOptions = {
      ignore: `node_modules/**/*`,
      ...options.globOptions
    };
  }

  apply(compiler) {
    // 注册afterEmit处理
    compiler.hooks.afterEmit.tap('get-unused-files-webpack-plugin', (compilation) => {
      const unusedFiles = syncApplyAfterEmit(compiler, compilation, this)
      deleteTranslationOfUnusedFiles(unusedFiles, this.options.langs)
    });
  }
}

module.exports = getUnusedFilesWebpackPlugin;
