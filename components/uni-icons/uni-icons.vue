<template>
  <view class="uni-icons" :style="iconStyle">
    <view v-if="type === 'auth-filled'" class="icon icon-law">
      <view class="law-top"></view>
      <view class="law-stem"></view>
      <view class="law-base"></view>
      <view class="law-arm law-arm-left"></view>
      <view class="law-arm law-arm-right"></view>
      <view class="law-pan law-pan-left"></view>
      <view class="law-pan law-pan-right"></view>
    </view>

    <view v-else-if="type === 'chatboxes-filled'" class="icon icon-chat">
      <view class="chat-box"></view>
      <view class="chat-tail"></view>
      <view class="chat-dot chat-dot-1"></view>
      <view class="chat-dot chat-dot-2"></view>
      <view class="chat-dot chat-dot-3"></view>
    </view>

    <view v-else-if="type === 'calendar-filled'" class="icon icon-calendar">
      <view class="calendar-shell"></view>
      <view class="calendar-bar"></view>
      <view class="calendar-ring calendar-ring-left"></view>
      <view class="calendar-ring calendar-ring-right"></view>
      <view class="calendar-grid"></view>
    </view>

    <view v-else-if="type === 'cart-filled'" class="icon icon-cart">
      <view class="cart-handle"></view>
      <view class="cart-basket"></view>
      <view class="cart-wheel cart-wheel-left"></view>
      <view class="cart-wheel cart-wheel-right"></view>
    </view>

    <text v-else class="icon-fallback">{{ fallbackText }}</text>
  </view>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: '#333333'
    }
  },
  computed: {
    iconStyle() {
      const sizeValue = typeof this.size === 'number' ? `${this.size}px` : this.size
      return {
        width: sizeValue,
        height: sizeValue,
        color: this.color
      }
    },
    fallbackText() {
      return this.type ? this.type.slice(0, 1).toUpperCase() : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.uni-icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #333333;
  flex-shrink: 0;
}

.icon {
  position: relative;
  width: 100%;
  height: 100%;
}

.icon-fallback {
  font-size: 100%;
  line-height: 1;
  color: currentColor;
  font-weight: 600;
}

.icon-law .law-top,
.icon-law .law-base,
.icon-law .law-stem,
.icon-law .law-arm,
.icon-law .law-pan,
.icon-chat .chat-box,
.icon-chat .chat-tail,
.icon-chat .chat-dot,
.icon-calendar .calendar-shell,
.icon-calendar .calendar-bar,
.icon-calendar .calendar-ring,
.icon-calendar .calendar-grid,
.icon-cart .cart-handle,
.icon-cart .cart-basket,
.icon-cart .cart-wheel {
  position: absolute;
  background: currentColor;
}

.icon-law .law-top {
  left: 14%;
  top: 20%;
  width: 72%;
  height: 2px;
}

.icon-law .law-stem {
  left: 49%;
  top: 20%;
  width: 2px;
  height: 50%;
}

.icon-law .law-base {
  left: 22%;
  bottom: 14%;
  width: 56%;
  height: 2px;
}

.icon-law .law-arm {
  width: 2px;
  height: 28%;
  top: 36%;
}

.icon-law .law-arm-left {
  left: 28%;
  transform: rotate(25deg);
  transform-origin: top center;
}

.icon-law .law-arm-right {
  right: 28%;
  transform: rotate(-25deg);
  transform-origin: top center;
}

.icon-law .law-pan {
  width: 16%;
  height: 2px;
  top: 62%;
  border-radius: 2px;
}

.icon-law .law-pan-left {
  left: 18%;
}

.icon-law .law-pan-right {
  right: 18%;
}

.icon-chat .chat-box {
  left: 14%;
  top: 18%;
  width: 72%;
  height: 54%;
  border: 2px solid currentColor;
  border-radius: 18%;
  background: transparent;
}

.icon-chat .chat-tail {
  left: 26%;
  bottom: 12%;
  width: 16%;
  height: 16%;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: skew(-18deg) rotate(-45deg);
  background: transparent;
}

.icon-chat .chat-dot {
  width: 8%;
  height: 8%;
  border-radius: 50%;
  top: 43%;
}

.icon-chat .chat-dot-1 { left: 32%; }
.icon-chat .chat-dot-2 { left: 46%; }
.icon-chat .chat-dot-3 { left: 60%; }

.icon-calendar .calendar-shell {
  left: 16%;
  top: 22%;
  width: 68%;
  height: 54%;
  border: 2px solid currentColor;
  border-radius: 14%;
  background: transparent;
}

.icon-calendar .calendar-bar {
  left: 16%;
  top: 22%;
  width: 68%;
  height: 16%;
  border-top-left-radius: 14%;
  border-top-right-radius: 14%;
}

.icon-calendar .calendar-ring {
  top: 14%;
  width: 7%;
  height: 16%;
  border-radius: 999px;
}

.icon-calendar .calendar-ring-left { left: 30%; }
.icon-calendar .calendar-ring-right { right: 30%; }

.icon-calendar .calendar-grid {
  left: 29%;
  top: 46%;
  width: 42%;
  height: 2px;
  box-shadow: 0 9px 0 currentColor, 0 18px 0 currentColor;
  background: currentColor;
}

.icon-cart .cart-handle {
  left: 24%;
  top: 26%;
  width: 14%;
  height: 2px;
  transform: rotate(18deg);
  transform-origin: left center;
}

.icon-cart .cart-basket {
  left: 26%;
  top: 32%;
  width: 44%;
  height: 24%;
  border: 2px solid currentColor;
  border-top-left-radius: 10%;
  border-top-right-radius: 10%;
  border-bottom-left-radius: 8%;
  border-bottom-right-radius: 8%;
  background: transparent;
}

.icon-cart .cart-wheel {
  bottom: 18%;
  width: 11%;
  height: 11%;
  border-radius: 50%;
}

.icon-cart .cart-wheel-left { left: 30%; }
.icon-cart .cart-wheel-right { right: 30%; }
</style>
