<script>
import { initCloud } from "@/utils/cloud.js";

export default {
  onLaunch() {
    // 只做云初始化；不要在启动时 callFunction。
    // 部分基础库/工具在云函数未部署或 env 未绑定时，会抛
    // TypeError: Cannot read property 'errMsg' of undefined
    try {
      initCloud();
    } catch (e) {
      console.warn("[App] initCloud", e);
    }
  },
};
</script>

<style lang="scss">
@import "@/styles/theme.scss";
@import "@/styles/elder.scss";

page {
  background-color: $rt-bg;
  font-family: $rt-font-body;
  color: $rt-text;
  font-size: $rt-type-body;
  line-height: $rt-leading-body;
}

.rt-title-font {
  font-family: $rt-font-title;
}

button {
  @include rt-btn-reset;
}

view,
text,
image {
  box-sizing: border-box;
}
</style>
