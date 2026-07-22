<template>
  <view class="page" :class="{ elder: elderOn }">
    <rt-nav-bar title="我的办件" />
    <rt-skeleton v-if="loading" variant="case" :count="3" />
    <empty-state
      v-else-if="loadError"
      icon-type="dispute"
      :icon-tone="emptyTone('progress')"
      title="加载失败"
      desc="请检查网络后重试"
      action-text="点击重试"
      @action="loadData()"
    />
    <empty-state
      v-else-if="!list.length"
      icon-type="dispute"
      :icon-tone="emptyTone('progress')"
      title="暂无调解记录"
      desc="有事可以说，AI 帮您整理成案"
      action-text="去说事"
      @action="goSubmit"
    />
    <view v-else class="list">
      <view
        v-for="item in list"
        :key="item._id"
        class="case-wrap"
        @click="goDetail(item._id)"
      >
        <rt-card compact elevated :tone="listTone(item)">
          <view class="case-top">
            <text class="case-title">{{ caseObj(item).title }}</text>
            <text class="case-tag" :class="caseObj(item).phaseTone">
              {{ caseObj(item).phaseLabel }}
            </text>
          </view>
          <text class="case-oral">{{ caseObj(item).oral }}</text>
        </rt-card>
      </view>
    </view>
    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { buildCaseObject } from "@/utils/case-object.js";
import { caseListTone, emptyTone } from "@/utils/color-semantic.js";
import { goNavigate } from "@/utils/nav.js";
import { isElderMode } from "@/utils/elder-mode.js";

export default {
  components: { TabBar, EmptyState, RtCard, RtSkeleton },
  data() {
    return {
      elderOn: false,
      loading: true,
      loadError: false,
      list: [],
    };
  },
  onShow() {
    this.elderOn = isElderMode();
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    emptyTone,
    caseObj(item) {
      return buildCaseObject(item);
    },
    listTone(item) {
      return caseListTone(buildCaseObject(item).semantic);
    },
    async loadData(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listDisputes();
        this.list = res.data.list || [];
      } catch (e) {
        this.loadError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goDetail(id) {
      goNavigate(`/pages/disputeDetail/disputeDetail?id=${id}`);
    },
    goSubmit() {
      goNavigate("/pages/village/submit");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: $rt-page-bottom;
}

.case-oral {
  display: block;
  margin: 8rpx 0 12rpx;
  font-size: $rt-type-caption;
  color: $rt-olive;
  font-weight: 600;
  line-height: 1.4;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.case-wrap {
  margin-bottom: 0;
}
.case-top {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: flex-start;
  margin-bottom: 8rpx;
}
.case-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.35;
}
.case-tag {
  @include rt-status-pending;
  flex-shrink: 0;
}
.case-tag.done {
  @include rt-status-done;
}
.case-tag.urgent {
  background: rgba(158, 52, 40, 0.12);
  color: $rt-primary;
}
.case-meta {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}
</style>
