<template>
  <view class="page">
    <view class="bg-orb orb-one"></view>
    <view class="bg-orb orb-two"></view>

    <view class="hero">
      <view class="brand-mark">
        <image class="brand-logo" :src="$cloudAssetUrl('static/banner/logo.svg')" mode="aspectFill" />
      </view>
      <text class="brand-desc">登录后查看村务公告、纠纷调解、积分商城等服务</text>
    </view>

    <view class="login-card">
      <view class="card-title">手机号登录</view>
      <view class="card-subtitle">输入手机号与验证码即可快速进入</view>

      <view class="form-item">
        <image class="field-icon" :src="$cloudAssetUrl('static/icons/user.svg')" mode="aspectFit" />
        <input
          class="field-input"
          type="number"
          maxlength="11"
          v-model="phone"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item code-item">
        <image class="field-icon" :src="$cloudAssetUrl('static/icons/bell.svg')" mode="aspectFit" />
        <input
          class="field-input"
          type="number"
          maxlength="6"
          v-model="code"
          placeholder="请输入验证码"
          placeholder-class="placeholder"
        />
        <button class="code-btn" :disabled="countdown > 0" @click="onGetCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>

      <view class="agreement-row" @click="checked = !checked">
        <view class="checkbox" :class="{ active: checked }">
          <text v-if="checked">✓</text>
        </view>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link">《隐私政策》</text>
      </view>

      <button class="login-btn" @click="onLogin">登录</button>
      <view class="test-login-btn" @click="onTestLogin">测试登录</view>
      <view class="wechat-btn" @click="onWechatLogin">微信一键登录</view>
    </view>

    <view class="footer-note">登录即代表您同意平台规范，建议使用村级常用手机号登录</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      code: '',
      checked: true,
      countdown: 0,
      timer: null
    }
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    onGetCode() {
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确手机号', icon: 'none' })
        return
      }
      if (this.countdown > 0) return
      uni.showToast({ title: '验证码已发送', icon: 'none' })
      this.countdown = 60
      this.timer = setInterval(() => {
        if (this.countdown <= 1) {
          clearInterval(this.timer)
          this.timer = null
          this.countdown = 0
          return
        }
        this.countdown -= 1
      }, 1000)
    },
    onLogin() {
      if (!this.checked) {
        uni.showToast({ title: '请先同意协议', icon: 'none' })
        return
      }
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确手机号', icon: 'none' })
        return
      }
      if (!this.code || this.code.length < 4) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      uni.showToast({ title: '登录成功', icon: 'success' })
    },
    onTestLogin() {
      uni.reLaunch({ url: '/pages/law/law' })
    },
    onWechatLogin() {
      if (!this.checked) {
        uni.showToast({ title: '请先同意协议', icon: 'none' })
        return
      }
      uni.showToast({ title: '微信登录待接入', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  padding: 48rpx 40rpx 72rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(93, 139, 58, 0.18), transparent 34%),
    radial-gradient(circle at right 18%, rgba(230, 126, 34, 0.16), transparent 28%),
    linear-gradient(180deg, #fdfcf6 0%, #f7f4eb 100%);
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(6rpx);
  opacity: 0.65;
}

.orb-one {
  top: -60rpx;
  left: -40rpx;
  width: 220rpx;
  height: 220rpx;
  background: rgba(93, 139, 58, 0.16);
}

.orb-two {
  right: -70rpx;
  top: 220rpx;
  width: 260rpx;
  height: 260rpx;
  background: rgba(230, 126, 34, 0.12);
}

.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36rpx;
  text-align: center;
}

.brand-mark {
  width: 192rpx;
  height: 192rpx;
  border-radius: 50rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18rpx 40rpx rgba(64, 84, 43, 0.12);
  margin-bottom: 24rpx;
}

.brand-logo {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 44rpx;
  font-weight: 800;
  color: #23411f;
  letter-spacing: 2rpx;
}

.brand-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #6a735f;
  max-width: 560rpx;
}

.login-card {
  position: relative;
  z-index: 1;
  padding: 38rpx 30rpx 34rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 24rpx 60rpx rgba(32, 45, 26, 0.1);
  backdrop-filter: blur(8rpx);
}

.card-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #23331d;
}

.card-subtitle {
  margin-top: 10rpx;
  margin-bottom: 28rpx;
  font-size: 24rpx;
  color: #7a846e;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 98rpx;
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  border-radius: 28rpx;
  background: #f9f7f0;
  border: 1rpx solid rgba(93, 139, 58, 0.12);
}

.field-icon {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.9;
}

.field-input {
  flex: 1;
  height: 98rpx;
  font-size: 30rpx;
  color: #25311f;
}

.placeholder {
  color: #a6b0a0;
}

.code-item {
  padding-right: 14rpx;
}

.code-btn {
  min-width: 168rpx;
  height: 66rpx;
  line-height: 66rpx;
  padding: 0 18rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #5b8c3a 0%, #4c7a2e 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.code-btn[disabled] {
  background: #c8d2bd;
  color: #f8fbf5;
}

.agreement-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  margin: 8rpx 0 26rpx;
  color: #6f7768;
  font-size: 24rpx;
}

.checkbox {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid #b6c2aa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  font-size: 20rpx;
  margin-right: 4rpx;
}

.checkbox.active {
  background: #5b8c3a;
  border-color: #5b8c3a;
  color: #fff;
}

.agreement-link {
  color: #2f5f28;
}

.login-btn {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #3f7a29 0%, #5b8c3a 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 800;
  box-shadow: 0 18rpx 32rpx rgba(91, 140, 58, 0.22);
}

.test-login-btn {
  margin-top: 16rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(91, 140, 58, 0.22);
  background: rgba(91, 140, 58, 0.06);
  color: #3f7a29;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
}

.wechat-btn {
  margin-top: 18rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(91, 140, 58, 0.2);
  background: rgba(255, 255, 255, 0.86);
  color: #3a5c2f;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
}

.footer-note {
  position: relative;
  z-index: 1;
  margin-top: 28rpx;
  padding: 0 20rpx;
  font-size: 22rpx;
  line-height: 1.7;
  text-align: center;
  color: #8b9181;
}
</style>
