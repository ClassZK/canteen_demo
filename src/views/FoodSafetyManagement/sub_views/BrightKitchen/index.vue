<template>
  <div class="bright-kitchen-container">
    <div class="toolbar">
      <ElSegmented v-model="layout" :options="layoutOptions" />
      <ElSelect v-model="location" style="width: 180px">
        <ElOption label="全部区域" value="全部区域" />
        <ElOption v-for="item in locations" :key="item" :label="item" :value="item" />
      </ElSelect>
    </div>

    <div class="video-grid" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
      <div v-for="item in visibleMonitors" :key="item.id" class="video-card" @click="fullscreen = item">
        <div class="fake-video">
          <div class="scan-line"></div>
          <div class="canteen-name">{{ currentOrgName }}</div>
          <div class="camera-name">{{ item.name }}</div>
          <div class="live-dot">LIVE</div>
        </div>
        <div class="video-info">
          <span>{{ item.location }}</span>
          <ElTag size="small" :type="item.online ? 'success' : 'info'">{{ item.online ? "在线" : "离线" }}</ElTag>
        </div>
      </div>
    </div>

    <ElDialog v-model="dialogVisible" :title="fullscreen?.name || '监控画面'" width="82vw">
      <div class="dialog-video">
        <div class="scan-line"></div>
        <strong>{{ fullscreen?.name }}</strong>
        <span>{{ fullscreen?.location }} / 本地模拟视频播放中</span>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Storage from "tddev/storage";

type Monitor = {
  id: string;
  name: string;
  location: string;
  online: boolean;
};

const layoutOptions = ["4宫格", "6宫格", "9宫格"];
const layout = ref("4宫格");
const location = ref("全部区域");
const fullscreen = ref<Monitor | null>(null);
const orgs: Obj[] = Storage.get("Orgs") ?? [];
const currentOrgName =
  orgs.find(item => item.org_id === Storage.get("orgID"))?.org_name || (Storage.get("SystemUserinfo") ?? {})?.org_name || "食堂";

const monitors: Monitor[] = [
  { id: "m1", name: "粗加工间-01", location: "粗加工间", online: true },
  { id: "m2", name: "烹饪间-02", location: "烹饪间", online: true },
  { id: "m3", name: "备餐间-03", location: "备餐间", online: true },
  { id: "m4", name: "洗消间-04", location: "洗消间", online: false },
  { id: "m5", name: "仓库-05", location: "仓库", online: true },
  { id: "m6", name: "大厅-06", location: "大厅", online: true },
];

const locations = computed(() => Array.from(new Set(monitors.map(item => item.location))));
const columns = computed(() => (layout.value === "4宫格" ? 2 : 3));
const maxCount = computed(() => (layout.value === "4宫格" ? 4 : layout.value === "6宫格" ? 6 : 9));
const visibleMonitors = computed(() =>
  monitors.filter(item => location.value === "全部区域" || item.location === location.value).slice(0, maxCount.value)
);
const dialogVisible = computed({
  get: () => !!fullscreen.value,
  set: value => {
    if (!value) fullscreen.value = null;
  },
});
</script>

<style scoped>
.bright-kitchen-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  padding: 14px;
  border-radius: 8px;
  background: #fff;
}

.video-grid {
  display: grid;
  flex: 1;
  min-height: 0;
  gap: 14px;
}

.video-card {
  overflow: hidden;
  min-height: 220px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5edf7;
  cursor: pointer;
}

.fake-video,
.dialog-video {
  position: relative;
  display: grid;
  place-items: center;
  height: calc(100% - 44px);
  min-height: 180px;
  overflow: hidden;
  color: #dbeafe;
  background:
    radial-gradient(circle at 30% 20%, rgb(38 132 255 / 26%), transparent 34%),
    linear-gradient(135deg, #0f172a, #1e293b 52%, #111827);
}

.fake-video {
  align-content: center;
  gap: 8px;
}

.dialog-video {
  height: 64vh;
  gap: 10px;
}

.scan-line {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(to bottom, rgb(255 255 255 / 5%) 0 1px, transparent 1px 8px);
}

.canteen-name,
.camera-name,
.dialog-video strong,
.dialog-video span {
  position: relative;
  z-index: 1;
}

.canteen-name {
  color: #93c5fd;
  font-size: 14px;
}

.camera-name {
  font-size: 20px;
  font-weight: 700;
}

.live-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  padding: 4px 8px;
  border-radius: 4px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 12px;
}
</style>
