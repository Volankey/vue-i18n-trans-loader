# vue-i18n-trans-loader
一个配合vue-i18n自动翻译并生成语言包的库
# 使用说明
1.安装vue-i18n，并按照vue-i18n的操作指引配置好
```
    npm install -S vue-i18n
```
2.将src目录下的loaders拷贝到vue的src目录下

3.配置好vue.config.js
>若您使用百度翻译api(建议)
```
npm install -S -D md5-node axios
```

```
var path = require("path");
var axios = require("axios");
var md5 = require("md5-node");

function resolve(dir) {
  console.log(__dirname);
  return path.join(__dirname, dir);
}
module.exports = {
  ...
  chainWebpack: config => {
    ...
    config.module
      .rule()
      .test(/\.(js|vue)(\?.*)?$/)
      .pre()
      .include.add(resolve("src"))
      .end()
      .use()
      //引入loader
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
            `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${key}&from=${from}&to=${to}&appid=${appid}&salt=12345&sign=${sign}`
          );
          console.log(key + ">>>" + res.data.trans_result[0].dst);

          return res.data.trans_result[0].dst;
        }
      });
  }
};
```

4.运行
```
npm run serve
```

5.用法

根据vue-i18n，但是我们不必要繁琐的配置
例如，您若是要翻译 src/components/HelloWrold.vue文件中的
```
<h1>Language</h1>
```
您只需要这么写
```
<h1>{{$t('Language')}}</h1>
```
产生的效果如下 可以看到langs数组中配置的每项的path路径产生的文件（这里只展示example的cn.json,当然jp.json也会产生，只不过对应的翻译不同）
```
{
	"components": {
		"HelloWorld.vue": {
			"Language": "语言"
		}
	}
}
```

若是您想要翻译
```
 <HelloWorld msg="Welcome to Your Vue.js App"/>
```
您需要这么写（注意外层双引号，内层单引号）
```
 <HelloWorld :msg="$t('Welcome to Your Vue.js App')"/>
```

# 配置项解读

langs为一个数组，每一项由{name,path}组成，name为本项语言的名称，path为对应的语言的语言包路径
#### langs的第一项是程序默认的源语言，开发时使用的语言。example中是英语故将en作为第一项传入，剩下的都是要翻译的语言

translate为翻译的接口，您可以选择网络翻译，如example中配置的一样，您也可以选择本地翻译，但是需要您自己来进对应语言库文件的修改了
他的参数
- from 是源语言，对应langs中的name
- to 是要翻译成的语言，对应langs中的name
- key 是要翻译的源语言的字符串

他的返回值
- return 是一个翻译后的字符串

```
{
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
          ...
          return res.data.trans_result[0].dst;
        }
      }
```



