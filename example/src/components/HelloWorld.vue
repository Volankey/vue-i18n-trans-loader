<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ $t("Language") }}</h1>
    <ul>
      <li>
        <a @click.prevent="() => changeLanguage('EN')">{{ $t("English") }}</a>
      </li>
      <li>
        <a @click.prevent="() => changeLanguage('CN')">{{ $t("Chinese") }}</a>
      </li>
      <li @click.prevent="() => changeLanguage('YUE')">
        <a>{{ $t("Cantonese") }}</a>
      </li>
      <li @click.prevent="() => changeLanguage('JP')">
        <a>{{ $t("Japanese") }}</a>
      </li>
    </ul>
    <p>
      {{
        $t(
          "For a guide and recipes on how to configure / customize this project,"
        )
      }}

      <br />
      {{ $t("check out the") }}
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener"
        >vue-cli {{ $t("documentation") }}</a
      >.
    </p>
    <h3>{{ $t("Installed CLI Plugins") }}</h3>
    <ul>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel"
          target="_blank"
          rel="noopener"
          >babel</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint"
          target="_blank"
          rel="noopener"
          >eslint</a
        >
      </li>
    </ul>
    <h3>{{ $t("Essential Links Test By XiaoBai") }}</h3>
    <ul>
      <li>
        <a href="https://vuejs.org" target="_blank" rel="noopener">{{
          $t("Core Docs")
        }}</a>
      </li>
      <li>
        <a href="https://forum.vuejs.org" target="_blank" rel="noopener">{{
          $t("Forum")
        }}</a>
      </li>
      <li>
        <a href="https://chat.vuejs.org" target="_blank" rel="noopener">{{
          $t("Community Chat")
        }}</a>
      </li>
      <li>
        <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">{{
          $t("Twitter")
        }}</a>
      </li>
      <li>
        <a href="https://news.vuejs.org" target="_blank" rel="noopener">{{
          $t("News")
        }}</a>
      </li>
    </ul>
    <h3>{{ $t("Ecosystem") }}</h3>
    <ul>
      <li>
        <a href="https://router.vuejs.org" target="_blank" rel="noopener"
          >vue-router</a
        >
      </li>
      <li>
        <a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a>
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-devtools#vue-devtools"
          target="_blank"
          rel="noopener"
          >vue-devtools</a
        >
      </li>
      <li>
        <a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"
          >vue-loader</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/awesome-vue"
          target="_blank"
          rel="noopener"
          >awesome-vue</a
        >
      </li>
    </ul>
  </div>
</template>

<script>
import Test from "./Test.vue";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  methods: {
    changeLanguage(v) {
      this.$i18n.locale = v;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
  cursor: pointer;
}
</style>
