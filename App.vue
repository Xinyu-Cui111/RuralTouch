<script>
import { loadCloudAssets } from "@/utils/cloudAssetRuntime.js";

export default {
  onLaunch() {
    console.log("智慧村务小程序启动");
    loadCloudAssets();

    // 数据预拉取：注册回调并尝试读取已缓存的数据（如果微信客户端已预拉取）
    if (typeof wx !== "undefined" && wx.onBackgroundFetchData) {
      try {
        wx.onBackgroundFetchData(function (res) {
          // res: { fetchedData, timeStamp, path, query, scene }
          console.log("onBackgroundFetchData:", res);
          // 将数据缓存到全局，页面可通过 getApp().globalData 读取
          try {
            const app = getApp();
            app.globalData = app.globalData || {};
            app.globalData.backgroundFetch = res;
          } catch (e) {
            // ignore
          }
        });

        // 主动读取预拉取缓存（fetchType 可为 'pre' 或 'periodic'）
        wx.getBackgroundFetchData({
          fetchType: "pre",
          success(res) {
            console.log("getBackgroundFetchData success:", res);
            try {
              const app = getApp();
              app.globalData = app.globalData || {};
              app.globalData.backgroundFetch = res;
            } catch (e) {}
          },
          fail(err) {
            console.warn("getBackgroundFetchData fail:", err);
          },
        });
      } catch (e) {
        console.warn("background fetch APIs not available:", e);
      }
    }
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
