<template>
  <view class="page">
    <rt-nav-bar title="村务通知" />
    <rt-skeleton v-if="loading" variant="cell" :count="4" />
    <empty-state
      v-else-if="loadError"
      icon-type="notice"
      icon-tone="green"
      title="加载失败"
      desc="请检查网络后重试"
      action-text="点击重试"
      @action="loadData()"
    />
    <empty-state
      v-else-if="!list.length"
      icon-type="notice"
      title="暂无通知公告"
    />
    <rt-card v-else compact flush elevated tone="green">
      <rt-cell
        v-for="(item, idx) in list"
        :key="item._id"
        :title="item.title"
        :desc="cellDesc(item)"
        icon="notice"
        :tag="isUnread(item) ? '未读' : ''"
        :tag-type="isUnread(item) ? 'warn' : 'default'"
        :last="idx === list.length - 1"
        @click="openDetail(item)"
      />
    </rt-card>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtCell from "@/components/rt-cell/rt-cell.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { goNavigate } from "@/utils/nav.js";
import { isNoticeRead, markNoticeRead } from "@/utils/notice-read.js";

export default {
  components: { EmptyState, RtCard, RtCell, RtSkeleton },
  data() {
    return { loading: true, loadError: false, list: [] };
  },
  onShow() {
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    async loadData(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listNotices();
        this.list = res.data.list || [];
      } catch (e) {
        this.loadError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    isUnread(item) {
      return !!(item && item._id && !isNoticeRead(item._id));
    },
    openDetail(item) {
      if (item && item._id) markNoticeRead(item._id);
      goNavigate(`/pages/village/noticeDetail?id=${item._id}`);
    },
    cellDesc(item) {
      if (item.publishTimeText || item.createTimeText) {
        return item.publishTimeText || item.createTimeText;
      }
      const text = (item.content || "").replace(/\s+/g, " ").trim();
      return text.length > 48 ? `${text.slice(0, 48)}…` : text;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  @include rt-page;
  padding: $rt-page-x;
}
</style>
