<template>
  <view class="page">
    <rt-nav-bar title="通知详情" />
    <rt-skeleton v-if="loading" variant="lines" :rows="6" />
    <empty-state
      v-else-if="loadError || !notice"
      icon-type="notice"
      icon-tone="green"
      title="通知不存在或加载失败"
      action-text="点击重试"
      @action="loadDetail(noticeId)"
    />
    <template v-else>
      <rt-card elevated tone="green">
        <text class="title">{{ notice.title }}</text>
        <text class="meta"
          >{{ notice.publishTimeText || notice.createTimeText }} ·
          {{ notice.village || "示范村" }}</text
        >
        <view class="divider" />
        <text class="content">{{ notice.content }}</text>
      </rt-card>
      <button class="ghost-btn" @click="goFeedback">
        对此通知有意见？去意见箱
      </button>
    </template>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import { api } from "@/api/index.js";
import { goNavigate } from "@/utils/nav.js";
import { markNoticeRead, countUnreadNotices } from "@/utils/notice-read.js";
import { writeTabBadges, readTabBadges } from "@/utils/tab-badges.js";

export default {
  components: { RtCard, RtSkeleton, EmptyState },
  data() {
    return { loading: true, loadError: false, notice: null, noticeId: "" };
  },
  onLoad(query) {
    this.noticeId = query.id || "";
    this.loadDetail(this.noticeId);
  },
  methods: {
    async loadDetail(id) {
      this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listNotices();
        const list = res.data.list || [];
        this.notice = list.find((n) => n._id === id) || null;
        if (this.notice && this.notice._id) {
          markNoticeRead(this.notice._id);
          const unread = countUnreadNotices(list);
          writeTabBadges({ ...readTabBadges(), noticeUnread: unread });
        }
        if (!this.notice) this.loadError = true;
      } catch (e) {
        this.loadError = true;
        this.notice = null;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goFeedback() {
      goNavigate("/pages/village/feedback");
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
.title {
  display: block;
  font-size: 36rpx;
  font-weight: $rt-weight-heavy;
  color: $rt-text;
  line-height: 1.4;
}
.meta {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}
.divider {
  height: 1rpx;
  background: $rt-border;
  margin: 28rpx 0;
}
.content {
  display: block;
  font-size: 30rpx;
  color: $rt-text-secondary;
  line-height: 1.85;
}
.ghost-btn {
  @include rt-btn-ghost;
  margin-top: 32rpx;
  width: 100%;
}
</style>
