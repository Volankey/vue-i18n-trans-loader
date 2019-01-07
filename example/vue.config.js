var path = require("path");
var axios = require("axios");
var md5 = require("md5-node");

function resolve(dir) {
  console.log(__dirname);
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: false,
  // devServer: {
  //     proxy: {
  //         '/api': {
  //             target: 'http://xxx.xxx/',
  //             ws: true,
  //             changeOrigin: true
  //         }
  //     }
  // },
  // vue.config.js

  configureWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      // 生产环境去掉console.loggit
      config.optimization.minimizer[0].options.uglifyOptions.compress.drop_console = true;
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set("@", resolve("src")); // key,value自行定义，比如.set('@@', resolve('src/components'))
    config.module
      .rule("compile")
      .test(/\.(js|vue)(\?.*)?$/)
      .pre()
      .include.add(resolve("src"))
      .end()
      .use()
      .loader(resolve("src/loaders/global.js"))
      .options({
        langs: [{
            name: "en",
            path: resolve("src/assets/lang/en.json"),
        },
        {
            name: "zh",
            path: resolve("src/assets/lang/cn.json"),
        },
        {
          name: "yue",
          path: resolve("src/assets/lang/yue.json"),
        },
        {
          name: "jp",
          path: resolve("src/assets/lang/jp.json"),

        }
      ],
        translate: async (from,to,key) => {
          //百度翻译开发者提供的appid以及secretKey
          let appid = "xxx",
              secretKey = "xxx";
          let sign = md5(
            appid + key + "12345" + secretKey
          );
          console.log(from,to,key , "翻译中....");
          let res = await axios.get(
            `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${key}&from=${from}&to=${to}&appid${appid}=&salt=12345&sign=${sign}`
          );
          console.log(key + ">>>" + res.data.trans_result[0].dst);

          return res.data.trans_result[0].dst;
        }
      });
  }
};
// npm install -S -D md5-node axios