import { createSSRApp } from 'vue'
import App from './App.vue'
import './uni.scss'

// 全局兼容 shim：防止运行时代码调用未定义的 getActiveAppWindow/getInstanceWindow
if (typeof window !== 'undefined') {
    window.__global = window.__global || window
    window.__global.getActiveAppWindow = window.__global.getActiveAppWindow || (() => window)
    window.getInstanceWindow = window.getInstanceWindow || (() => window)
}

export function createApp() {
    const app = createSSRApp(App)
    return {
        app
    }
}
