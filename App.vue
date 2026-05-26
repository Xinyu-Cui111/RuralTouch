<script>
import { loadCloudAssets } from '@/utils/cloudAssetRuntime.js'

export default {
  onLaunch() {
    console.log('智慧村务小程序启动')
    loadCloudAssets()
  }
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #fcfcf0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 清除默认样式 */
view, text, image {
  box-sizing: border-box;
}

/* 通用颜色变量 */
:root {
  --primary-green: #5B8C3A;
  --primary-orange: #E67E22;
  --bg-cream: #fcfcf0;
  --text-dark: #2C3E50;
  --text-gray: #7F8C8D;
}
</style>