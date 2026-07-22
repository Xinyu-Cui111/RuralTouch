<template>
  <view class="icon-btn" @click="$emit('click')">
    <rt-icon :name="iconName" tone="green" size="sm" />
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";

export default {
  components: { RtIcon },
  props: {
    name: { type: String, default: "user" },
  },
  computed: {
    iconName() {
      if (this.name === "bell") return "bell";
      return "user";
    },
  },
  emits: ["click"],
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.icon-btn {
  @include rt-icon-btn;
}
</style>
