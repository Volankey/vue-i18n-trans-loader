
function getObjPath(path){
    let paths = path.substring(path.lastIndexOf("/src") + 5).split("/");
    // path = paths.join(".");
    return paths;
}
function getKeys(s) {
    var stack = [];
    var len = s.length;
    var res = [];
    for (let i = 0; i < len; i++) {
      let c = s[i];
      stack.push(c);
  
      if (c === ")") {
        let popStack = [],
          popC = "";
        while ((popC = stack.pop()) !== "(") {
          popStack.unshift(popC);
        }
        popStack.unshift(popC);
        let str = popStack.join("");
        if (stack.length === 2) {
          // 去掉$t()的两个括号
          res.push("$t" + str.substring(0));
          s = s.substring(i).match(/\$t\((.*)\)/g);
          if (s) (s = s[0]), (i = -1), (len = s.length), (stack = []);
          else break;
        } else stack.push(str);
      }
    }
    return res;
  }
module.exports = {
    getObjPath,
    getKeys
}