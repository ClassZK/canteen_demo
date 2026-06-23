<template>
  <div class="home-overview" v-loading="pageLoading" element-loading-text="数据加载中">
    <section class="top-layout">
      <article class="panel monitor-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><VideoCameraFilled /></ElIcon>
            <span>实时监控</span>
          </div>
          <div class="online-text">
            <span class="online-dot"></span>
            设备在线 {{ deviceOnlineText }}
          </div>
        </div>
        <div class="monitor-screen">No signal</div>
        <div class="monitor-tabs">
          <button
            v-for="item in monitorZones"
            :key="item.value"
            type="button"
            :class="{ active: item.value === activeMonitorZone }"
            @click="activeMonitorZone = item.value"
          >
            {{ item.label }}
          </button>
        </div>
      </article>

      <section class="stat-area">
        <div class="stat-grid">
          <article v-for="item in topStats" :key="item.label" class="stat-card">
            <div class="stat-head">
              <ElIcon :class="item.tone">
                <component :is="item.icon" />
              </ElIcon>
              <span>{{ item.label }}</span>
            </div>
            <div class="stat-value">
              <strong>{{ item.value }}</strong>
              <span>{{ item.unit }}</span>
            </div>
            <p>{{ item.caption }}</p>
          </article>
        </div>

        <article class="panel daily-manage-strip">
          <button v-for="item in dailyManageItems" :key="item.name" type="button" @click="onPath(item.name)">
            <span class="daily-manage-icon" :class="item.tone">
              <img :src="item.icon" alt="" />
            </span>
            <span>{{ item.label }}</span>
            <strong :class="item.statusTone">{{ item.statusText }}</strong>
          </button>
        </article>
      </section>

      <article class="panel inventory-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><Box /></ElIcon>
            <span>库存提醒</span>
          </div>
          <div class="refresh-text">
            更新：{{ updateTime || "-" }}
            <ElButton :icon="Refresh" link type="primary" @click="getOverview" />
          </div>
        </div>
        <div class="inventory-money">
          <div class="money-card warning">
            <span>即将过期（元）</span>
            <strong>{{ formatMoney(inventoryRemind.before_money) }}</strong>
            <small>30天内到期金额</small>
          </div>
          <div class="money-card danger">
            <span>已过期（元）</span>
            <strong>{{ formatMoney(inventoryRemind.expired_money) }}</strong>
            <small>过期金额</small>
          </div>
        </div>
        <div v-if="lackList.length" class="lack-list">
          <div v-for="item in lackList" :key="item.id" class="lack-item">
            <div>
              <strong>{{ item.pro_name || "-" }}</strong>
              <span>{{ item.created_at || "-" }}</span>
            </div>
            <p>当前 {{ item.count ?? 0 }}，预警 {{ item.warn_count ?? 0 }}</p>
          </div>
        </div>
        <ElEmpty v-else description="暂无库存不足数据" :image-size="68" />
      </article>
    </section>

    <section class="middle-layout">
      <article class="panel staff-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><UserFilled /></ElIcon>
            <span>从业人员</span>
          </div>
          <button class="panel-text-button" type="button" @click="onPath('canteenStaff')">
            查看全部
            <ElIcon><ArrowRight /></ElIcon>
          </button>
        </div>
        <div v-if="staffList.length" class="staff-grid">
          <div v-for="item in staffList" :key="item.id" class="staff-card">
            <div class="staff-photo">
              <ElImage v-if="item.user_avatar_uri" :src="item.user_avatar_uri" fit="cover">
                <template #error>
                  <div class="staff-fallback">
                    <ElIcon><UserFilled /></ElIcon>
                  </div>
                </template>
              </ElImage>
              <div v-else class="staff-fallback">
                <ElIcon><UserFilled /></ElIcon>
              </div>
              <ElTag class="staff-status-tag" type="success" effect="light" size="small">
                在职
              </ElTag>
            </div>
            <div class="staff-info">
              <strong>{{ item.user_name || "-" }}</strong>
              <span>{{ item.position || "-" }}</span>
              <p :class="{ off: !item.is_on_job }">
                <i></i>
                {{ item.is_on_job ? "正常" : "离岗" }}
              </p>
            </div>
          </div>
        </div>
        <ElEmpty v-else description="暂无从业人员" :image-size="72" />
      </article>

      <article class="panel self-check-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><DocumentChecked /></ElIcon>
            <span>今日自查</span>
          </div>
          <div class="self-check-counts">
            <span v-for="item in selfCheckItems" :key="item.label" :class="item.tone">
              {{ item.label }}：<strong>{{ item.value }}</strong> 项
            </span>
          </div>
        </div>
        <div class="self-check-list">
          <div v-for="item in selfCheckDetailItems" :key="item.key" class="self-check-item">
            <span class="check-item-icon">
              <ElIcon><DocumentChecked /></ElIcon>
            </span>
            <span class="check-item-name">{{ item.label }}</span>
            <span class="check-item-tag" :class="item.tone">{{ item.statusText }}</span>
          </div>
        </div>
        <div class="self-check-footer">
          <span>自查时间：{{ updateTime || "-" }}</span>
          <button type="button" @click="onPath('safetySelfInspection')">
            查看详情
            <ElIcon><ArrowRight /></ElIcon>
          </button>
        </div>
      </article>

      <article class="panel certificate-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><Tickets /></ElIcon>
            <span>证照与健康提醒</span>
          </div>
        </div>
        <div class="reminder-list">
          <div v-for="item in certificateReminderItems" :key="item.label" class="reminder-item">
            <span class="reminder-icon" :class="item.tone">
              <ElIcon>
                <component :is="item.icon" />
              </ElIcon>
            </span>
            <div class="reminder-content">
              <div>
                <strong>{{ item.label }}</strong>
                <em :class="item.tone">{{ item.status }}</em>
              </div>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </article>

    </section>

    <section class="bottom-layout">
      <article class="panel canteen-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><School /></ElIcon>
            <span>食堂基础信息</span>
          </div>
        </div>
        <div class="canteen-body">
          <div class="canteen-photo">
            <ElImage v-if="canteenInfo.photo" :src="canteenInfo.photo" fit="cover">
              <template #error>
                <div class="image-fallback">
                  <ElIcon><School /></ElIcon>
                </div>
              </template>
            </ElImage>
            <div v-else class="image-fallback">
              <ElIcon><School /></ElIcon>
            </div>
          </div>
          <div class="canteen-info-list">
            <div class="canteen-info-item">
              <ElIcon><School /></ElIcon>
              <span>食堂名称：</span>
              <strong>{{ canteenInfo.name || "-" }}</strong>
            </div>
            <div class="canteen-info-item">
              <ElIcon><LocationFilled /></ElIcon>
              <span>地址：</span>
              <strong>{{ canteenInfo.address || "-" }}</strong>
            </div>
            <div class="canteen-info-item">
              <ElIcon><ForkSpoon /></ElIcon>
              <span>供餐餐次：</span>
              <strong>{{ canteenMealTypesText }}</strong>
              <em>{{ canteenMealSupplyText }}</em>
            </div>
            <div class="canteen-info-item">
              <ElIcon><Tickets /></ElIcon>
              <span>经营许可证：</span>
              <strong>{{ licenseInfo.no || "-" }}</strong>
              <em :class="licenseStatusInfo.tone">{{ licenseStatusInfo.label }}</em>
            </div>
          </div>
          <div class="canteen-license-card">
            <div class="license-card-title">
              <ElIcon><Tickets /></ElIcon>
              <span>食品经营许可证</span>
              <em :class="licenseStatusInfo.tone">{{ licenseStatusInfo.label }}</em>
            </div>
            <div class="license-card-body">
              <ElImage
                v-if="licenseInfo.image"
                :src="getFirstImage(licenseInfo.image)"
                fit="cover"
                :preview-src-list="getImageList(licenseInfo.image)"
                preview-teleported
              />
              <div v-else class="mini-license-fallback">
                <ElIcon><Tickets /></ElIcon>
              </div>
              <div>
                <span>编号</span>
                <strong>{{ licenseInfo.no || "-" }}</strong>
                <span>有效期</span>
                <strong>{{ licenseInfo.expire_date || "-" }}</strong>
                <span>剩余天数</span>
                <strong>{{ licenseStatusInfo.daysText }}</strong>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="panel shortcut-panel">
        <div class="panel-header">
          <div class="header-title">
            <ElIcon><GoodsFilled /></ElIcon>
            <span>快捷入口</span>
          </div>
        </div>
        <div class="shortcut-grid">
          <button v-for="item in shortcuts" :key="item.name" type="button" @click="onPath(item.name)">
            <span class="shortcut-icon">
              <img :src="item.icon" alt="" />
            </span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  BellFilled,
  Box,
  DocumentChecked,
  ForkSpoon,
  GoodsFilled,
  LocationFilled,
  Refresh,
  School,
  ShoppingCartFull,
  Tickets,
  UserFilled,
  Van,
  VideoCameraFilled,
} from "@element-plus/icons-vue";
import { MealtimeList, Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiHomeOverview } from "@/api/warehouse";

import iconSampleRetention from "@/assets/image/10812.png";
import iconQuarantineInspection from "@/assets/image/10814.png";
import iconMorningHealthCheck from "@/assets/image/10811.png";
import iconCleaningRecord from "@/assets/image/10815.png";
import iconTablewareDisinfection from "@/assets/image/10813.png";
import iconFourPestDisinfection from "@/assets/image/10818.png";
import iconSafetySelfInspection from "@/assets/image/10817.png";
import iconWasteDisposal from "@/assets/image/10819.png";
import iconFoodDdditiveUsage from "@/assets/image/10816.png";
import iconMealAccompaniment from "@/assets/image/10820.png";

const Router = useRouter();
const pageLoading = ref(false);
const updateTime = ref("");
const activeMonitorZone = ref("kitchen");

const overview = reactive<Obj>({
  canteen_info: {},
  license_info: {},
  inventory_remind: {},
  staff_list: [],
  self_check_summary: {},
});

const monitorZones = [
  { label: "后厨操作区", value: "kitchen" },
  { label: "备餐区", value: "meal" },
  { label: "切配区", value: "cutting" },
  { label: "仓储区", value: "store" },
];

const dailyManageBaseItems = [
  { label: "食品留样", name: "sampleRetention", icon: iconSampleRetention },
  { label: "检疫检测", name: "quarantineInspection", icon: iconQuarantineInspection },
  { label: "晨检记录", name: "morningHealthCheck", icon: iconMorningHealthCheck },
  { label: "清洁消毒", name: "cleaningRecord", icon: iconCleaningRecord, displayLabel: "清洁消毒" },
  { label: "餐具消毒", name: "tablewareDisinfection", icon: iconTablewareDisinfection, displayLabel: "餐具消毒" },
  { label: "四害消杀", name: "fourPestDisinfection", icon: iconFourPestDisinfection, displayLabel: "四害消杀" },
  { label: "安全自查", name: "safetySelfInspection", icon: iconSafetySelfInspection, displayLabel: "食安自查" },
  { label: "废弃物处置", name: "wasteDisposal", icon: iconWasteDisposal },
  { label: "添加剂使用", name: "foodDdditiveUsage", icon: iconFoodDdditiveUsage },
];

const shortcuts = dailyManageBaseItems.map(item => ({
  ...item,
  label: item.displayLabel || item.label,
}));

const canteenInfo = computed(() => overview.canteen_info || {});
const canteenMealTypes = computed(() => getMealTypes(canteenInfo.value.meal_types));
const canteenMealTypesText = computed(() => canteenMealTypes.value.map(item => item.name).join("、") || "-");
const canteenMealSupplyText = computed(() => `${numberTextMap[canteenMealTypes.value.length] || canteenMealTypes.value.length}餐供餐`);
const licenseInfo = computed(() => overview.license_info || {});
const inventoryRemind = computed(() => overview.inventory_remind || {});
const lackList = computed(() => _utils.getDefaultArray(inventoryRemind.value.lack_list));
const onJobStaffList = computed(() => _utils.getDefaultArray(overview.staff_list).filter(item => item.is_on_job));
const staffList = computed(() => onJobStaffList.value.slice(0, 5));
const selfCheckSummary = computed(() => overview.self_check_summary || {});
const dailyManageStatusMap = computed(() => {
  const map: Obj = {};
  _utils.getDefaultArray(overview.daily_manage_status).forEach((item: Obj) => {
    if (item.name) {
      map[item.name] = item;
    }
  });
  return map;
});
const deviceOnlineText = computed(() => `${overview.device_online_count || 0}/${overview.device_total_count || 0}`);
const healthValidCount = computed(() => onJobStaffList.value.length);

const topStats = computed(() => [
  {
    label: "今日下单",
    value: overview.today_order_count || 0,
    unit: "单",
    caption: "今日订单总数",
    icon: ShoppingCartFull,
    tone: "blue",
  },
  {
    label: "今日入库",
    value: formatMoney(overview.in_stock_today),
    unit: "元",
    caption: "今日入库金额",
    icon: Van,
    tone: "green",
  },
  {
    label: "今日出库",
    value: formatMoney(overview.out_stock_today),
    unit: "元",
    caption: "今日出库金额",
    icon: Box,
    tone: "orange",
  },
  {
    label: "今日预警",
    value: overview.today_warning_count || 0,
    unit: "条",
    caption: "今日预警数量",
    icon: BellFilled,
    tone: "red",
  },
]);

const dailyManageItems = computed(() =>
  dailyManageBaseItems.map((item, index) => {
    const status = getDailyManageStatus(item.name, dailyManageStatusMap.value[item.name]);
    const tones = ["blue", "green", "orange", "cyan"];
    return {
      ...item,
      label: item.displayLabel || item.label,
      tone: tones[index % tones.length],
      statusText: status.text,
      statusTone: status.tone,
    };
  }),
);

const getDailyManageStatus = (name: string, data?: Obj) => {
  if (data?.status) {
    return {
      text: dailyManageStatusTextMap[data.status] || "未填报",
      tone: dailyManageStatusToneMap[data.status] || "muted",
    };
  }
  return { text: "未填报", tone: "muted" };
};

const dailyManageStatusTextMap: Obj = {
  recorded: "已记录",
  unreported: "未填报",
};

const dailyManageStatusToneMap: Obj = {
  recorded: "success",
  unreported: "danger",
};

const selfCheckItems = computed(() => [
  { label: "需整改", value: selfCheckSummary.value.rectification || 0, tone: "danger" },
  { label: "正常", value: selfCheckSummary.value.normal || 0, tone: "success" },
  { label: "未检查", value: selfCheckSummary.value.unchecked || 0, tone: "muted" },
]);

const selfCheckDetailItems = computed(() => {
  const baseItems = [
    { key: "water", label: "水电安全" },
    { key: "gas", label: "燃气安全" },
    { key: "doors", label: "门窗安全" },
    { key: "kitchen", label: "厨房设备" },
    { key: "fire_fighting", label: "消防设备" },
  ];
  let rectification = selfCheckSummary.value.rectification || 0;
  let normal = selfCheckSummary.value.normal || 0;
  return baseItems.map(item => {
    let status = "unchecked";
    if (rectification > 0) {
      status = "rectification";
      rectification -= 1;
    } else if (normal > 0) {
      status = "normal";
      normal -= 1;
    }
    return {
      ...item,
      statusText: selfCheckStatusMap[status].text,
      tone: selfCheckStatusMap[status].tone,
    };
  });
});

const selfCheckStatusMap: Obj = {
  rectification: { text: "需整改", tone: "danger" },
  normal: { text: "正常", tone: "success" },
  unchecked: { text: "未检查", tone: "muted" },
};

const licenseStatusInfo = computed(() => {
  const expireDate = String(licenseInfo.value.expire_date || "");
  const expireTime = expireDate ? new Date(expireDate).getTime() : 0;
  if (!expireTime || Number.isNaN(expireTime)) {
    return { label: "待完善", tone: "warning", daysText: "-" };
  }
  const days = Math.ceil((expireTime - Date.now()) / 86400000);
  if (days < 0) {
    return { label: "已过期", tone: "danger", daysText: "已过期" };
  }
  return { label: "证照有效", tone: "success", daysText: `剩余 ${days} 天` };
});

const certificateReminderItems = computed(() => [
  {
    label: "经营许可证",
    status: licenseStatusInfo.value.label,
    description: `有效期至：${licenseInfo.value.expire_date || "-"}`,
    icon: Tickets,
    tone: licenseStatusInfo.value.tone,
  },
  {
    label: "健康证",
    status: `${healthValidCount.value} 人有效`,
    description: "本月即将过期：0 人",
    icon: UserFilled,
    tone: "blue",
  },
  {
    label: "留样状态",
    status: "今日待完成",
    description: "今日留样任务：0/3",
    icon: ForkSpoon,
    tone: "orange",
  },
]);

const getOverview = async () => {
  pageLoading.value = true;
  try {
    const { success, data, message } = await apiHomeOverview();
    if (success) {
      Object.assign(overview, data || {});
      updateTime.value = formatDateTime(new Date());
    } else {
      Message.warning(message || "首页总览数据获取失败");
    }
  } catch (error) {
    Message.warning("首页总览数据获取失败");
  } finally {
    pageLoading.value = false;
  }
};

const formatMoney = (value?: number | string) => Number(_utils.FtoY(value || 0)).toFixed(2);

const numberTextMap: Obj = {
  0: "暂无",
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
};

const getMealTypes = (value?: string | string[]) => {
  const selectedValues = Array.isArray(value)
    ? value.map(item => String(item).trim())
    : String(value || "")
      .split(/[,，、]/)
      .map(item => item.trim());
  const selectedSet = new Set(selectedValues.filter(Boolean));
  return MealtimeList.filter(item => selectedSet.has(item.value) || selectedSet.has(item.name));
};

const getImageList = (value = "") => String(value).split(",").map(item => item.trim()).filter(Boolean);
const getFirstImage = (value = "") => getImageList(value)[0] || "";

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const onPath = (name: string) => {
  Router.push({ name });
};

getOverview();
</script>

<style lang="scss" scoped>
.home-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: auto;
  min-height: 0;
  padding: 12px;
  overflow: auto;
  background:
    linear-gradient(180deg, #eef5ff 0, #f5f8fc 96px, #f5f8fc 100%);
  box-sizing: border-box;
}

.top-layout {
  display: grid;
  grid-template-columns: minmax(420px, 30%) minmax(0, 1fr) 344px;
  grid-auto-rows: 324px;
  gap: 12px;
}

.middle-layout {
  display: grid;
  grid-template-columns: minmax(520px, 1fr) minmax(420px, 0.72fr) 420px;
  gap: 12px;
}

.bottom-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 500px;
  gap: 12px;
}

.panel {
  position: relative;
  overflow: hidden;
  min-width: 0;
  background: #fff;
  border: 1px solid #e2eaf5;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(31, 56, 88, 0.055);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 0 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-bottom: 1px solid #edf2f8;
  box-sizing: border-box;
}

.panel-text-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  padding: 0;
  color: #1683f7;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  border: 0;
  cursor: pointer;

  .el-icon {
    font-size: 14px;
  }
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #1f2d3d;
  font-size: 15px;
  font-weight: 600;

  .el-icon {
    color: #0b73e8;
    font-size: 18px;
  }

  small {
    margin-left: 10px;
    color: #677489;
    font-size: 13px;
    font-weight: 400;
  }
}

.monitor-panel {
  display: flex;
  flex-direction: column;
  min-height: 324px;
}

.online-text,
.refresh-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5f6f84;
  font-size: 13px;
  white-space: nowrap;
}

.online-dot {
  width: 8px;
  height: 8px;
  background: #20b26c;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(32, 178, 108, 0.12);
}

.monitor-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: auto;
  min-height: 202px;
  margin: 10px 12px;
  color: #fff;
  font-size: 16px;
  background:
    radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.08), transparent 34%),
    linear-gradient(135deg, #191f27 0%, #0d1117 100%);
  border-radius: 6px;
  box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.04);
}

.monitor-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 0 12px 12px;

  button {
    height: 32px;
    color: #324159;
    background: #f2f5fa;
    border: 0;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;

    &.active {
      color: #fff;
      background: #0b73e8;
    }
  }
}

.stat-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  min-height: 132px;
  padding: 16px 16px 14px;
  background:
    linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  border: 1px solid #e4ebf5;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(31, 56, 88, 0.055);
  box-sizing: border-box;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, rgba(11, 115, 232, 0.75), rgba(32, 178, 108, 0.28));
  }

  p {
    position: relative;
    z-index: 1;
    margin-top: 8px;
    color: #7a8798;
    font-size: 13px;
  }
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #425066;
  font-size: 15px;
  font-weight: 600;

  .el-icon {
    position: relative;
    z-index: 1;
    padding: 8px;
    font-size: 24px;
    background: currentColor;
    border-radius: 9px;

    :deep(svg) {
      color: #fff;
    }
  }
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  position: relative;
  z-index: 1;
  margin-top: 18px;

  strong {
    color: #172033;
    font-size: 27px;
    font-weight: 700;
  }

  span {
    color: #526174;
    font-size: 14px;
  }
}

.blue {
  color: #0b73e8;
}

.green {
  color: #059669;
}

.orange {
  color: #f08a00;
}

.red {
  color: #f04438;
}

.cyan {
  color: #0891b2;
}

.purple {
  color: #7c3aed;
}

.daily-manage-strip {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  flex: 1;
  min-height: 0;
  padding: 14px 8px;
  box-sizing: border-box;

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: 0;
    min-height: 0;
    color: #344258;
    background: transparent;
    border: 0;
    border-right: 1px solid #e7edf5;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.16s ease;

    &:last-child {
      border-right: 0;
    }

    &:hover {
      background: #f7fbff;
    }

    span {
      font-size: 13px;
      font-weight: 600;
    }

    strong {
      max-width: 100%;
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.success {
        color: #13a36f;
      }

      &.danger {
        color: #f04438;
      }

      &.muted {
        color: #8a98aa;
      }
    }
  }
}

.daily-manage-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #eef6ff;
  border-radius: 9px;

  img {
    width: 25px;
    height: 25px;
  }

  &.green {
    background: #ecf8f1;
  }

  &.orange {
    background: #fff6e8;
  }

  &.cyan {
    background: #ecfbff;
  }
}

.inventory-panel {
  min-height: 324px;
}

.inventory-money {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 14px;
}

.money-card {
  min-height: 94px;
  padding: 14px;
  border-radius: 7px;
  border: 1px solid transparent;
  box-sizing: border-box;

  span,
  small {
    display: block;
    color: #66758a;
    font-size: 13px;
  }

  strong {
    display: block;
    margin: 14px 0 6px;
    font-size: 26px;
    font-weight: 700;
  }

  &.warning {
    background: #fff5e8;
    border-color: #ffe1b8;

    strong {
      color: #f08a00;
    }
  }

  &.danger {
    background: #fff0f0;
    border-color: #ffd6d6;

    strong {
      color: #f04438;
    }
  }
}

.lack-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 0 14px 12px;
}

.lack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 10px 12px;
  background: #f8fbff;
  border: 1px solid #e6eef8;
  border-left: 3px solid #0b73e8;
  border-radius: 7px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #263246;
    font-size: 14px;
  }

  span,
  p {
    color: #7a8798;
    font-size: 12px;
  }

  p {
    flex: none;
  }
}

.staff-panel,
.self-check-panel,
.certificate-panel {
  min-height: 230px;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 14px;
}

.staff-card {
  min-width: 0;
  padding: 7px 7px 9px;
  border: 1px solid #e8eef6;
  border-radius: 7px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 4px 10px rgba(31, 52, 82, 0.035);
  box-sizing: border-box;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    border-color: #cfe0f6;
    box-shadow: 0 8px 18px rgba(31, 52, 82, 0.075);
  }

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1f2d3d;
    font-size: 14px;
    font-weight: 600;
  }

  span {
    margin-top: 2px;
    color: #6b778a;
    font-size: 12px;
  }
}

.staff-photo {
  position: relative;
  overflow: hidden;
  height: 96px;
  background: #eef3f8;
  border-radius: 6px;

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .staff-status-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 5px;
    right: 5px;
    height: 24px;
    padding: 0 7px;
    color: #13a36f;
    line-height: 1;
    background: #f0fbf5;
    border-color: #bfead2;
    border-radius: 4px;
    font-weight: 600;

    :deep(.el-tag__content) {
      display: flex;
      align-items: center;
      height: 100%;
      line-height: 1;
    }
  }
}

.staff-info {
  padding: 8px 2px 0;

  p {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    color: #13a36f;
    font-size: 12px;

    &.off {
      color: #8a98aa;
    }
  }

  i {
    width: 7px;
    height: 7px;
    background: currentColor;
    border-radius: 50%;
  }
}

.staff-fallback,
.image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8a98aa;
  background: #eef3f8;
}

.staff-fallback {
  font-size: 30px;
}

.self-check-counts {
  display: flex;
  align-items: center;
  gap: 22px;
  flex: none;
  color: #5f6f84;
  font-size: 13px;
  white-space: nowrap;

  span {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  strong {
    color: #172033;
    font-weight: 700;
  }
}

.self-check-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 10px;
  padding: 14px 18px 12px;
}

.self-check-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 8px;
  min-height: 30px;

  .check-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #1683f7;
    background: #eef6ff;
    border-radius: 6px;
  }

  .check-item-name {
    min-width: 0;
    color: #344258;
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.check-item-tag,
.reminder-content em,
.canteen-info-item em,
.license-card-title em {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  border-radius: 5px;
  box-sizing: border-box;

  &.danger {
    color: #f04438;
    background: #fff1f0;
    border-color: #ffd6d6;
  }

  &.success {
    color: #13a36f;
    background: #ecf8f1;
    border-color: #cceede;
  }

  &.muted {
    color: #64748b;
    background: #f2f5f9;
    border-color: #e1e7ef;
  }

  &.warning,
  &.orange {
    color: #f08a00;
    background: #fff6e8;
    border-color: #ffe1b8;
  }

  &.blue {
    color: #1683f7;
    background: #eef6ff;
    border-color: #d6e9ff;
  }
}

.self-check-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 18px;
  padding: 12px 0 0;
  color: #66758a;
  font-size: 13px;
  border-top: 1px solid #edf1f7;

  button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #1683f7;
    font-weight: 600;
    background: transparent;
    border: 0;
    cursor: pointer;
  }
}

.reminder-list {
  padding: 8px 16px;
}

.reminder-item {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 62px;
  border-bottom: 1px solid #edf2f8;

  &:last-child {
    border-bottom: 0;
  }
}

.reminder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;

  .el-icon {
    font-size: 23px;
  }

  &.success {
    color: #13a36f;
    background: #ecf8f1;
  }

  &.blue {
    color: #1683f7;
    background: #eef6ff;
  }

  &.orange,
  &.warning {
    color: #f08a00;
    background: #fff6e8;
  }

  &.danger {
    color: #f04438;
    background: #fff1f0;
  }
}

.reminder-content {
  min-width: 0;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  strong {
    color: #253247;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin-top: 7px;
    color: #68778b;
    font-size: 12px;
  }
}

.canteen-panel {
  min-height: 246px;
}

.canteen-body {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 360px;
  align-items: stretch;
  gap: 18px;
  padding: 16px 18px 18px;
}

.canteen-photo {
  overflow: hidden;
  height: 164px;
  background: #eef3f8;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(31, 52, 82, 0.08);

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .image-fallback {
    font-size: 44px;
  }
}

.canteen-info-list {
  display: grid;
  grid-template-columns: 1fr;
  align-content: center;
  gap: 12px;
  min-width: 0;
}

.canteen-info-item {
  display: grid;
  grid-template-columns: 24px 96px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 44px;
  padding: 0 12px;
  background: #f8fbff;
  border: 1px solid #e7eef8;
  border-radius: 7px;
  box-sizing: border-box;

  .el-icon {
    color: #0b73e8;
    font-size: 21px;
  }

  span {
    color: #344258;
    font-size: 14px;
  }

  strong {
    color: #172033;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
  }
}

.canteen-license-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  min-width: 0;
  padding: 16px;
  background:
    linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(59, 130, 246, 0.06)),
    #fbfefd;
  border: 1px solid #cfe6df;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

.license-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #1f3f3b;
  font-size: 15px;
  font-weight: 700;

  .el-icon {
    color: #0f9f7a;
    font-size: 22px;
  }

  em {
    margin-left: auto;
  }
}

.license-card-body {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 14px;
  align-items: center;

  :deep(.el-image),
  .mini-license-fallback {
    width: 96px;
    height: 96px;
    border-radius: 8px;
  }

  :deep(.el-image) {
    overflow: hidden;
    border: 1px solid #cfe6df;
  }

  span,
  strong {
    display: block;
  }

  span {
    margin-bottom: 5px;
    color: #6a7a78;
    font-size: 12px;
  }

  strong {
    margin-bottom: 8px;
    color: #1f3f3b;
    font-size: 14px;
    line-height: 1.35;
    word-break: break-word;
  }
}

.mini-license-fallback {
  color: #5f8b85;
  background: rgba(255, 255, 255, 0.75);
  border: 1px dashed #b8d8d1;
  box-sizing: border-box;
}

.shortcut-panel {
  min-height: 246px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  padding: 14px 16px 16px;

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    min-height: 72px;
    color: #344258;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid #edf2f8;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.16s ease;

    &:hover {
      color: #0b73e8;
      background: #f4f8ff;
      border-color: #cfe1ff;
      box-shadow: 0 8px 18px rgba(30, 103, 210, 0.08);
      transform: translateY(-1px);
    }

    > span:last-child {
      max-width: 100%;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.shortcut-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #eef6ff;
  border-radius: 9px;

  img {
    width: 25px;
    height: 25px;
  }
}

:deep(.el-empty) {
  padding: 26px 0 10px;
}

@media (max-width: 1500px) {
  .top-layout {
    grid-template-columns: minmax(340px, 30%) minmax(0, 1fr) 340px;
  }

  .middle-layout {
    grid-template-columns: minmax(0, 1fr) 420px;
  }

  .certificate-panel {
    grid-column: span 2;
  }

  .reminder-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
  }

  .reminder-item {
    border-right: 1px solid #edf2f8;
    border-bottom: 0;

    &:last-child {
      border-right: 0;
    }
  }
}

@media (max-width: 1280px) {
  .top-layout,
  .bottom-layout {
    grid-template-columns: 1fr;
  }

  .top-layout {
    grid-auto-rows: auto;
  }

  .stat-grid,
  .daily-manage-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .daily-manage-strip button {
    min-height: 96px;
  }

  .staff-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .certificate-panel {
    grid-column: auto;
  }

  .reminder-list {
    display: block;
  }

  .reminder-item {
    border-right: 0;
    border-bottom: 1px solid #edf2f8;
  }
}

@media (max-width: 820px) {
  .middle-layout,
  .canteen-body,
  .inventory-money,
  .self-check-list {
    grid-template-columns: 1fr;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    button:nth-child(2n) {
      border-right: 0;
    }
  }

  .monitor-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .canteen-photo {
    height: 160px;
  }
}
</style>
