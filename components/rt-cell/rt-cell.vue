<template>
  <view
    class="cell"
    :class="{ last }"
    hover-class="cell-active"
    :hover-stay-time="80"
    @click="$emit('click')"
  >
    <view v-if="icon || iconType" class="cell-icon">
      <view class="icon-tile">
        <slot name="icon">
          <rt-icon
            v-if="iconType"
            :name="iconType"
            :tone="iconTone"
            size="sm"
          />
          <rt-icon v-else-if="icon" :name="icon" :tone="iconTone" size="sm" />
        </slot>
      </view>
    </view>
    <view class="cell-body">
      <text class="cell-title">{{ title }}</text>
      <text v-if="desc" class="cell-desc">{{ desc }}</text>
    </view>
    <view v-if="tag" class="cell-tag" :class="tagType">{{ tag }}</view>
    <view v-else-if="showArrow" class="chevron" />
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";

export default {
  components: { RtIcon },
  props: {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    icon: { type: String, default: "" },
    iconType: { type: String, default: "" },
    iconTone: { type: String, default: "green" },
    tag: { type: String, default: "" },
    tagType: { type: String, default: "default" },
    showArrow: { type: Boolean, default: true },
    last: { type: Boolean, default: false },
  },
  emits: ["click"],
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.cell {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $rt-border;
}

.cell-active {
  background: rgba(201, 162, 74, 0.06);
}

.cell.last {
  border-bottom: none;
  padding-bottom: 0;
}

.cell-icon {
  flex-shrink: 0;
}

.icon-tile {
  @include rt-icon-tile(72rpx);
}

.cell-body {
  flex: 1;
  min-width: 0;
}

.cell-title {
  display: block;
  font-size: $rt-type-body;
  font-weight: $rt-weight-bold;
  color: $rt-text;
  line-height: 1.35;
}

.cell-desc {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-caption;
  color: $rt-text-muted;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.cell-tag {
  @include rt-pill($rt-accent-soft, $rt-accent-dark);
}

.cell-tag.done {
  @include rt-status-done;
}

.cell-tag.pending {
  @include rt-status-pending;
}

.cell-tag.warn {
  background: rgba(198, 40, 40, 0.1);
  color: #c62828;
  font-weight: 700;
}

.chevron {
  @include rt-chevron;
  margin-right: 6rpx;
}
</style>
