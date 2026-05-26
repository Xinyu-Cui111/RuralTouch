<script>
import { loadCloudAssets } from "@/utils/cloudAssetRuntime.js";

export default {
  onLaunch() {
    console.log("智慧村务小程序启动");
    loadCloudAssets();
  },
};
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #fcfcf0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 清除默认样式 */
view,
text,
image {
  box-sizing: border-box;
}

/* 通用颜色变量 */
:root {
  --primary-green: #5b8c3a;
  --primary-orange: #e67e22;
  --bg-cream: #fcfcf0;
  --text-dark: #2c3e50;
  --text-gray: #7f8c8d;
}
</style>
