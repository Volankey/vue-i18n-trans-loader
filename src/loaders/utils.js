const fs = require("fs");

const notExistFlag = "$_#NOT_EXIST";
function getObjPath(path) {
  const paths = path.substring(path.lastIndexOf("/src") + 5).split("/");
  // path = paths.join(".");
  return paths;
}
function getKeys(s) {
  let stack = [];
  let len = s.length;
  const res = [];
  for (let i = 0; i < len; i++) {
    const c = s[i];
    stack.push(c);

    if (c === ")") {
      const popStack = [];

      let popC = stack.pop();
      while (popC !== "(") {
        popStack.unshift(popC);
        popC = stack.pop();
      }
      popStack.unshift(popC);
      const str = popStack.join("");
      if (stack.length === 2) {
        // 去掉$t()的两个括号
        res.push(`$t${str.substring(0)}`);
        s = s.substring(i).match(/\$t\(\s*(.*)\s*\)/g);
        if (s) {
          s = s[0];
          i = -1;
          len = s.length;
          stack = [];
        } else break;
      } else stack.push(str);
    }
  }
  return res;
}
function trim(source, char, type) {
  if (char) {
    if (type == "left") {
      return source.replace(new RegExp("^\\" + char + "+", "g"), "");
    } else if (type == "right") {
      return source.replace(new RegExp("\\" + char + "+$", "g"), "");
    }
    return source.replace(
      new RegExp("^\\" + char + "+|\\" + char + "+$", "g"),
      ""
    );
  }
  return source.replace(/^\s+|\s+$/g, "");
}
const ifPreventResetFn = (options, willTranslateKey) => {
  try {
    const prefix = options.reset.prevent_prefix;
    console.log("TCL: ifPreventResetFn -> prefix", prefix);
    if (prefix) {
      const index = willTranslateKey.indexOf(prefix);
      console.log("TCL: ifPreventResetFn -> index", index);
      const len = prefix.length;
      if (index !== -1) {
        return {
          flag: true,
          value: willTranslateKey.substring(len)
        };
      } else {
        return { flag: false, value: willTranslateKey };
      }
    }
  } catch (e) {
    console.log(e);
  }
};
const ifExistInResetFileFn = (options, { targetLang, willTranslateKey }) => {
  const resetFileData = JSON.parse(
    fs.readFileSync(options.reset.path, {
      encoding: "utf8"
    })
  );
  if (
    resetFileData &&
    resetFileData[targetLang] &&
    resetFileData[targetLang][willTranslateKey]
  )
    return resetFileData[targetLang][willTranslateKey];
  return notExistFlag;
};
const haveResetOptionFn = options => {
  if (options.reset) {
    if (!options.reset.path) throw new Error("path 是reset里面必需参数");
    const fileExist = fs.existsSync(options.reset.path);
    let resetFile = "";
    if (!fileExist) {
      resetFile = fs.createWriteStream(options.reset.path, {
        encoding: "utf8"
      });
    } else {
      resetFile = fs.readFileSync(options.reset.path, { encoding: "utf8" });
    }
    return resetFile;
  }
  return null;
};
module.exports = {
  getObjPath,
  getKeys,
  haveResetOptionFn,
  ifExistInResetFileFn,
  notExistFlag,
  ifPreventResetFn,
  trim
};
