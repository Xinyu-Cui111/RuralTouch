import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig(() => {
    const isMpWeixin = process.env.UNI_PLATFORM === 'mp-weixin'

    return {
        plugins: [uni()],
        build: {
            modulePreload: isMpWeixin ? false : undefined
        }
    }
})
