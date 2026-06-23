<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-mark">食</div>
        <div>
          <h1>智慧食堂运营管理</h1>
          <p>纯前端业务闭环 Demo</p>
        </div>
      </div>
      <div class="header-actions">
        <el-select v-model="store.currentUserId" class="top-select" @change="store.setCurrentUser">
          <el-option v-for="user in store.users" :key="user.id" :label="`${roleLabels[user.role]} - ${user.name}`" :value="user.id" />
        </el-select>
        <el-select v-model="store.currentPostId" class="top-select" @change="store.setCurrentPost">
          <el-option v-for="post in store.currentUser.posts" :key="post.id" :label="post.label" :value="post.id">
            <span>{{ post.label }}</span>
            <el-tag v-if="post.isTemporary" size="small" type="warning" class="option-tag">临时</el-tag>
          </el-option>
        </el-select>
        <el-tag :type="store.currentPost.isTemporary ? 'warning' : 'success'" size="large">
          {{ store.currentPost.label }}
        </el-tag>
      </div>
    </header>

    <div class="main">
      <aside class="sidebar">
        <button
          v-for="item in visibleMenus"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeMenu === item.key }"
          @click="activeMenu = item.key"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </button>
      </aside>

      <main class="content">
        
        <component :is="activeComponent" />
      </main>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { computed, defineComponent, h, ref } from "vue";
import {
  Bell,
  Calendar,
  Camera,
  Check,
  ClipboardList,
  DataAnalysis,
  Dish,
  DocumentChecked,
  Files,
  FullScreen,
  Grid,
  House,
  Management,
  Memo,
  Monitor,
  Notebook,
  OfficeBuilding,
  Operation,
  Picture,
  Plus,
  Refresh,
  Select,
  Setting,
  Switch,
  Tickets,
  TrendCharts,
  User,
  VideoCamera
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDemoStore } from "@/stores/demo";
import type { BrightMonitor, BrightWarning, MealType, PostType, ReceiptOrder, RecipeDish, Role, SafetyRecord, Task } from "@/types";
import { mealLabels, roleLabels, statusLabels, statusTagTypes } from "@/utils";

const store = useDemoStore();
const activeMenu = ref("workbench");

interface MenuItem {
  key: string;
  title: string;
  icon: unknown;
  roles: Role[];
  posts?: PostType[];
  component: unknown;
}

const canEditBusiness = computed(() => !["platformAdmin"].includes(store.currentRole));
const isReadonly = computed(() => store.currentRole === "platformAdmin" || store.currentRole === "frontline");

const statusType = (status: string) => statusTagTypes[status] || "info";

const quickAction = (message: string) => {
  ElMessage.success(message);
};

const PageHeader = defineComponent({
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" }
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: "page-header" }, [
        h("div", [h("h2", props.title), props.subtitle ? h("p", props.subtitle) : null]),
        h("div", { class: "page-tools" }, slots.default?.())
      ]);
  }
});

const EmptyHint = defineComponent({
  props: { text: { type: String, default: "暂无数据" } },
  setup(props) {
    return () => h("div", { class: "empty-hint" }, props.text);
  }
});

const WorkbenchPage = defineComponent({
  setup() {
    const cards = computed(() => [
      { label: "项目数", value: store.workbenchStats.projectCount, icon: OfficeBuilding },
      { label: "食堂数", value: store.workbenchStats.canteenCount, icon: House },
      { label: "待办任务", value: store.workbenchStats.todoCount, icon: Tickets },
      { label: "风险预警", value: store.workbenchStats.warningCount, icon: Bell }
    ]);
    return () => (
      <div>
        <PageHeader title="工作台" subtitle={`${roleLabels[store.currentRole]} / ${store.currentPost.label} 的今日视角`}>
          <el-button type="primary" icon={Refresh} onClick={() => quickAction("工作台数据已刷新")}>刷新</el-button>
        </PageHeader>
        <div class="stat-grid">
          {cards.value.map((card) => (
            <div class="stat-card" key={card.label}>
              <el-icon><card.icon /></el-icon>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            </div>
          ))}
        </div>
        <div class="two-col">
          <section class="panel">
            <div class="panel-title">今日待办</div>
            <el-table data={store.scopedTasks.slice(0, 6)} table-layout="fixed">
              <el-table-column prop="title" label="任务" min-width="220" show-overflow-tooltip />
              <el-table-column label="状态" width="140">
                {{
                  default: ({ row }: { row: Task }) => <el-tag type={statusType(row.status)}>{statusLabels[row.status]}</el-tag>
                }}
              </el-table-column>
              <el-table-column prop="deadline" label="截止时间" width="160" />
            </el-table>
          </section>
          <section class="panel">
            <div class="panel-title">运营提醒</div>
            <div class="timeline-list">
              <div>周排班已启用，今日库管任务由安全员临时承接。</div>
              <div>明厨亮灶存在 {store.brightWarnings.filter((item) => item.status !== "已关闭").length} 条待处理预警。</div>
              <div>采购量推荐已按库存余量扣减生成。</div>
              <div>安全员今日需填报 {store.safetyRecords.filter((item) => item.status === "待填报").length} 类食安记录。</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
});

const TaskPage = defineComponent({
  setup() {
    const detailTask = ref<Task | null>(null);
    const assignVisible = ref(false);
    const selectedPost = ref<PostType>("chef");
    const selectedUsers = ref<string[]>(["u4"]);
    const remark = ref("");

    const handleProcess = (task: Task) => {
      store.processTask(task.id, remark.value || "已完成处理并提交审核", "处理照片.jpg");
      remark.value = "";
      ElMessage.success("任务已提交，状态已流转");
    };
    const handleAudit = (task: Task, approved: boolean) => {
      store.auditTask(task.id, approved, approved ? "审核通过" : "资料不完整，退回上一步");
      ElMessage.success(approved ? "已审核通过" : "已退回上一步");
    };
    const openAssign = (task: Task) => {
      detailTask.value = task;
      assignVisible.value = true;
    };
    const confirmAssign = () => {
      if (!detailTask.value) return;
      store.assignTask(detailTask.value.id, selectedUsers.value, selectedPost.value, "按项目/食堂职责继续下发");
      assignVisible.value = false;
      ElMessage.success("任务已分配");
    };
    const canHandle = (task: Task) => task.assigneeIds.includes(store.currentUser.id) || store.currentRole === "canteenAdmin";
    const canAudit = (task: Task) =>
      (store.currentRole === "canteenAdmin" && task.status === "canteenAudit") ||
      (store.currentRole === "projectAdmin" && task.status === "projectAudit") ||
      (store.currentRole === "platformAdmin" && task.status === "platformAudit") ||
      (["chef", "safetyOfficer", "stockKeeper"].includes(store.currentRole) && task.status === "postAudit");
    return () => (
      <div>
        <PageHeader title="任务安排" subtitle="系统任务、指定任务、审核、驳回和状态真实流转">
          {["platformAdmin", "canteenAdmin"].includes(store.currentRole) ? (
            <el-button type="primary" icon={Plus} onClick={() => store.currentRole === "platformAdmin" ? store.createPlatformTask(["p1", "p2"], "平台专项检查任务") : store.createCanteenTask("食堂临时清洁任务", "chef")}>
              新建指定任务
            </el-button>
          ) : null}
        </PageHeader>
        <section class="panel">
          <el-table data={store.scopedTasks} table-layout="fixed">
            <el-table-column prop="title" label="任务名称" min-width="220" show-overflow-tooltip />
            <el-table-column label="来源" width="110">
              {{ default: ({ row }: { row: Task }) => <el-tag>{sourceLabel(row.source)}</el-tag> }}
            </el-table-column>
            <el-table-column label="处理人" width="150">
              {{ default: ({ row }: { row: Task }) => row.assigneeIds.map(store.userName).join("、") }}
            </el-table-column>
            <el-table-column label="状态" width="150">
              {{ default: ({ row }: { row: Task }) => <el-tag type={statusType(row.status)}>{statusLabels[row.status]}</el-tag> }}
            </el-table-column>
            <el-table-column prop="deadline" label="截止时间" width="160" />
            <el-table-column label="操作" width="330" fixed="right">
              {{
                default: ({ row }: { row: Task }) => (
                  <div class="table-actions">
                    <el-button link type="primary" onClick={() => (detailTask.value = row)}>详情</el-button>
                    {row.status === "pendingAssign" && ["projectAdmin", "canteenAdmin"].includes(store.currentRole) ? <el-button link type="primary" onClick={() => openAssign(row)}>分配</el-button> : null}
                    {canHandle(row) && ["pending", "processing", "rejected"].includes(row.status) ? <el-button link type="success" onClick={() => handleProcess(row)}>处理</el-button> : null}
                    {["chef", "safetyOfficer", "stockKeeper"].includes(store.currentRole) && row.postType !== "frontline" ? <el-button link type="primary" onClick={() => store.assignToFrontline(row.id)}>分派一级岗位</el-button> : null}
                    {canAudit(row) ? (
                      <>
                        <el-button link type="success" onClick={() => handleAudit(row, true)}>通过</el-button>
                        <el-button link type="danger" onClick={() => handleAudit(row, false)}>驳回</el-button>
                      </>
                    ) : null}
                  </div>
                )
              }}
            </el-table-column>
          </el-table>
        </section>
        <el-drawer v-model={computed({ get: () => !!detailTask.value, set: (val) => { if (!val) detailTask.value = null; } }).value} title="任务详情" size="520px">
          {detailTask.value ? <TaskDetail task={detailTask.value} /> : null}
        </el-drawer>
        <el-dialog v-model={assignVisible.value} title="分配任务" width="520px">
          <el-form label-width="100px">
            <el-form-item label="处理岗位">
              <el-select v-model={selectedPost.value}>
                <el-option label="厨师长" value="chef" />
                <el-option label="安全员" value="safety" />
                <el-option label="库管" value="stock" />
                <el-option label="一级岗位" value="frontline" />
                <el-option label="食堂管理员" value="canteen" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理人">
              <el-select v-model={selectedUsers.value} multiple>
                {store.users.map((user) => <el-option key={user.id} label={user.name} value={user.id} />)}
              </el-select>
            </el-form-item>
          </el-form>
          {{
            footer: () => (
              <>
                <el-button onClick={() => (assignVisible.value = false)}>取消</el-button>
                <el-button type="primary" onClick={confirmAssign}>确定分配</el-button>
              </>
            )
          }}
        </el-dialog>
      </div>
    );
  }
});

const TaskDetail = defineComponent({
  props: { task: { type: Object as () => Task, required: true } },
  setup(props) {
    return () => (
      <div>
        <el-descriptions column={1} border>
          <el-descriptions-item label="任务名称">{props.task.title}</el-descriptions-item>
          <el-descriptions-item label="当前状态"><el-tag type={statusType(props.task.status)}>{statusLabels[props.task.status]}</el-tag></el-descriptions-item>
          <el-descriptions-item label="所属食堂">{store.canteenName(props.task.canteenId)}</el-descriptions-item>
          <el-descriptions-item label="处理人">{props.task.assigneeIds.map(store.userName).join("、")}</el-descriptions-item>
          <el-descriptions-item label="备注">{props.task.remark || "-"}</el-descriptions-item>
        </el-descriptions>
        <div class="panel-title drawer-title">流转记录</div>
        <el-timeline>
          {props.task.records.map((item, index) => (
            <el-timeline-item key={index} timestamp={item.time}>
              <strong>{item.operator}</strong> {item.action}
              <p>{item.remark}</p>
            </el-timeline-item>
          ))}
        </el-timeline>
      </div>
    );
  }
});

const CanteenPage = defineComponent({
  setup() {
    const editRecipe = ref<RecipeDish | null>(null);
    const price = ref(0);
    const servings = ref(0);
    const openRecipe = (recipe: RecipeDish) => {
      editRecipe.value = recipe;
      price.value = recipe.price;
      servings.value = recipe.servings;
    };
    const saveRecipe = () => {
      if (!editRecipe.value) return;
      store.updateRecipe(editRecipe.value.id, price.value, servings.value);
      editRecipe.value = null;
      ElMessage.success("食谱已更新，采购量推荐已重新计算");
    };
    return () => (
      <div>
        <PageHeader title="食堂管理" subtitle="菜品库、本周食谱、采购量推荐" />
        <div class="two-col">
          <section class="panel">
            <div class="panel-title">本周食谱</div>
            <el-table data={store.recipeDishes} table-layout="fixed">
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column label="餐次" width="90">{{ default: ({ row }: { row: RecipeDish }) => mealLabels[row.mealType] }}</el-table-column>
              <el-table-column prop="dishName" label="菜品" />
              <el-table-column prop="price" label="菜品价格" width="110" />
              <el-table-column prop="servings" label="菜品份数" width="110" />
              <el-table-column label="操作" width="100">
                {{ default: ({ row }: { row: RecipeDish }) => <el-button link type="primary" onClick={() => openRecipe(row)}>编辑</el-button> }}
              </el-table-column>
            </el-table>
          </section>
          <section class="panel">
            <div class="panel-title">采购量推荐</div>
            <el-table data={store.purchaseRecommendations} table-layout="fixed">
              <el-table-column prop="ingredientName" label="食材" />
              <el-table-column prop="requiredWeight" label="需求重量" width="110" />
              <el-table-column prop="currentStockWeight" label="库存余量" width="110" />
              <el-table-column prop="suggestedPurchaseWeight" label="实际建议采购量" width="150" />
              <el-table-column prop="unit" label="单位" width="80" />
            </el-table>
          </section>
        </div>
        <section class="panel">
          <div class="panel-title">菜品库</div>
          <el-table data={store.dishes} table-layout="fixed">
            <el-table-column prop="name" label="菜品名称" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column label="每份食材使用量">
              {{
                default: ({ row }) => row.ingredients.map((item) => `${item.ingredientName}${item.usagePerServing}${item.unit}`).join("、")
              }}
            </el-table-column>
            <el-table-column label="状态" width="100">{{ default: ({ row }) => <el-tag type="success">{row.status}</el-tag> }}</el-table-column>
          </el-table>
        </section>
        <el-dialog v-model={computed({ get: () => !!editRecipe.value, set: (val) => { if (!val) editRecipe.value = null; } }).value} title="编辑本周食谱" width="480px">
          <el-form label-width="110px">
            <el-form-item label="菜品">{editRecipe.value?.dishName}</el-form-item>
            <el-form-item label="菜品价格">
              <el-input-number v-model={price.value} min={0} precision={2} />
            </el-form-item>
            <el-form-item label="菜品份数">
              <el-input-number v-model={servings.value} min={1} />
            </el-form-item>
          </el-form>
          {{
            footer: () => (
              <>
                <el-button onClick={() => (editRecipe.value = null)}>取消</el-button>
                <el-button type="primary" onClick={saveRecipe}>保存</el-button>
              </>
            )
          }}
        </el-dialog>
      </div>
    );
  }
});

const InventoryPage = defineComponent({
  setup() {
    const order = ref<ReceiptOrder | null>(store.receiptOrders[0]);
    const imageName = ref("签收现场.jpg");
    const sign = () => {
      if (!order.value) return;
      store.signOrder(order.value.id, imageName.value);
      ElMessage.success("订单签收完成，未签商品不生成异常记录");
    };
    return () => (
      <div>
        <PageHeader title="食材库存" subtitle="库存、订单签收、入库、出库、盘点" />
        <div class="two-col">
          <section class="panel">
            <div class="panel-title">库存管理</div>
            <el-table data={store.inventory} table-layout="fixed">
              <el-table-column prop="name" label="食材" />
              <el-table-column prop="category" label="分类" />
              <el-table-column label="库存">
                {{ default: ({ row }) => `${row.stockWeight}${row.unit}` }}
              </el-table-column>
              <el-table-column prop="expireDate" label="保质期至" />
              <el-table-column label="状态">{{ default: ({ row }) => <el-tag type={row.status === "正常" ? "success" : "warning"}>{row.status}</el-tag> }}</el-table-column>
            </el-table>
          </section>
          <section class="panel order-detail">
            <div class="section-title-line">
              <div class="panel-title">订单签收详情</div>
              <el-tag type={statusType(order.value?.status || "")}>{order.value?.status}</el-tag>
            </div>
            <div class="info-grid">
              <div><span>订单号</span><strong>{order.value?.orderNo}</strong></div>
              <div><span>供应商</span><strong>{order.value?.supplierName}</strong></div>
              <div><span>收货地址</span><strong>{order.value?.address}</strong></div>
            </div>
            <el-table data={order.value?.items || []} table-layout="fixed">
              <el-table-column prop="productName" label="商品" />
              <el-table-column prop="shippedQuantity" label="发货数量" width="110" />
              <el-table-column label="签收数量" width="150">
                {{
                  default: ({ row }) => <el-input-number v-model={row.receivedQuantity} min={0} max={row.shippedQuantity} size="small" />
                }}
              </el-table-column>
              <el-table-column prop="unit" label="单位" width="70" />
            </el-table>
            <div class="receipt-actions">
              <el-input v-model={imageName.value} placeholder="签收图片名称" />
              <el-button type="primary" icon={Check} onClick={sign}>提交签收</el-button>
            </div>
          </section>
        </div>
      </div>
    );
  }
});

const SafetyPage = defineComponent({
  setup() {
    return () => (
      <div>
        <PageHeader title="食安管理" subtitle="安全员需要填报每一类记录" />
        <section class="panel">
          <el-table data={store.safetyRecords} table-layout="fixed">
            <el-table-column prop="module" label="记录类型" />
            <el-table-column prop="date" label="日期" width="130" />
            <el-table-column prop="remark" label="说明" show-overflow-tooltip />
            <el-table-column label="状态" width="120">{{ default: ({ row }: { row: SafetyRecord }) => <el-tag type={statusType(row.status)}>{row.status}</el-tag> }}</el-table-column>
            <el-table-column label="操作" width="220">
              {{
                default: ({ row }: { row: SafetyRecord }) => (
                  <div class="table-actions">
                    <el-button link type="success" disabled={row.status !== "待填报"} onClick={() => store.fillSafetyRecord(row.id)}>填报</el-button>
                    <el-button link type="danger" disabled={row.status !== "待填报"} onClick={() => store.fillSafetyRecord(row.id, true)}>上报异常</el-button>
                  </div>
                )
              }}
            </el-table-column>
          </el-table>
        </section>
      </div>
    );
  }
});

const BrightKitchenPage = defineComponent({
  setup() {
    const location = ref("全部");
    const layout = ref<"4宫格" | "6宫格" | "9宫格">("4宫格");
    const fullscreen = ref<BrightMonitor | null>(null);
    const locations = computed(() => ["全部", ...Array.from(new Set(store.monitors.map((item) => item.location)))]);
    const visibleMonitors = computed(() => store.monitors.filter((item) => location.value === "全部" || item.location === location.value));
    const columns = computed(() => (layout.value === "4宫格" ? 2 : layout.value === "6宫格" ? 3 : 3));
    return () => (
      <div>
        <PageHeader title="明厨亮灶" subtitle="假视频、地点筛选、全屏播放、多画面轮巡和系统预警闭环">
          <el-button type="primary" icon={Bell} onClick={store.triggerBrightWarning}>模拟系统触发预警</el-button>
        </PageHeader>
        <div class="bright-layout">
          <aside class="location-side">
            <div class="panel-title">地点</div>
            {locations.value.map((item) => (
              <button class={{ "location-item": true, active: location.value === item }} onClick={() => (location.value = item)}>{item}</button>
            ))}
          </aside>
          <section class="panel monitor-panel">
            <div class="section-title-line">
              <div class="panel-title">监控列表</div>
              <el-segmented v-model={layout.value} options={["4宫格", "6宫格", "9宫格"]} />
            </div>
            <div class="video-grid" style={{ gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))` }}>
              {visibleMonitors.value.slice(0, layout.value === "4宫格" ? 4 : layout.value === "6宫格" ? 6 : 9).map((monitor) => (
                <div class="video-tile" key={monitor.id}>
                  <div class="fake-video">
                    <div class="scan-line" />
                    <VideoCamera />
                    <span>{monitor.cameraName}</span>
                  </div>
                  <div class="video-meta">
                    <span>{monitor.location}</span>
                    <div>
                      <el-tag size="small" type={monitor.onlineStatus === "在线" ? "success" : "info"}>{monitor.onlineStatus}</el-tag>
                      <el-button link type="primary" onClick={() => (fullscreen.value = monitor)}>全屏</el-button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section class="panel">
          <div class="panel-title">预警系统</div>
          <el-table data={store.brightWarnings} table-layout="fixed">
            <el-table-column prop="warningType" label="预警类型" />
            <el-table-column prop="triggeredAt" label="触发时间" width="160" />
            <el-table-column label="安全员" width="100">{{ default: ({ row }: { row: BrightWarning }) => store.userName(row.assigneeId) }}</el-table-column>
            <el-table-column label="状态" width="110">{{ default: ({ row }: { row: BrightWarning }) => <el-tag type={statusType(row.status)}>{row.status}</el-tag> }}</el-table-column>
            <el-table-column label="操作" width="260">
              {{
                default: ({ row }: { row: BrightWarning }) => (
                  <div class="table-actions">
                    <el-button link type="success" disabled={!["待处理", "已驳回"].includes(row.status)} onClick={() => store.handleBrightWarning(row.id, "已现场提醒并完成整改")}>安全员处理</el-button>
                    <el-button link type="primary" disabled={row.status !== "待审核"} onClick={() => store.auditBrightWarning(row.id, true, "审核关闭")}>审核关闭</el-button>
                    <el-button link type="danger" disabled={row.status !== "待审核"} onClick={() => store.auditBrightWarning(row.id, false, "退回重新处理")}>驳回</el-button>
                  </div>
                )
              }}
            </el-table-column>
          </el-table>
        </section>
        <el-dialog v-model={computed({ get: () => !!fullscreen.value, set: (val) => { if (!val) fullscreen.value = null; } }).value} title="全屏播放" width="86vw" class="video-dialog">
          {fullscreen.value ? (
            <div class="fullscreen-video">
              <div class="scan-line" />
              <VideoCamera />
              <strong>{fullscreen.value.cameraName}</strong>
              <span>{fullscreen.value.location} / Demo 假视频播放中</span>
            </div>
          ) : null}
        </el-dialog>
      </div>
    );
  }
});

const AttendancePage = defineComponent({
  setup() {
    const meal = ref<MealType | "all">("lunch");
    const suspend = () => {
      store.suspendMeal(meal.value, "食堂管理员指定停餐");
      ElMessage.success("停餐记录已生成，对应任务已标记为停餐");
    };
    return () => (
      <div>
        <PageHeader title="考勤管理" subtitle="周排班、班次模板、请假转交、停餐记录" />
        <div class="two-col">
          <section class="panel">
            <div class="panel-title">周排班</div>
            <el-table data={store.schedules} table-layout="fixed">
              <el-table-column prop="date" label="日期" />
              <el-table-column label="岗位">{{ default: ({ row }) => row.postType }}</el-table-column>
              <el-table-column prop="shift" label="班次" />
              <el-table-column label="人员">{{ default: ({ row }) => row.userIds.map(store.userName).join("、") }}</el-table-column>
              <el-table-column prop="effectiveMode" label="生效方式" />
              <el-table-column prop="status" label="状态" />
            </el-table>
          </section>
          <section class="panel">
            <div class="panel-title">停餐记录</div>
            <div class="inline-form">
              <el-select v-model={meal.value}>
                <el-option label="早餐" value="breakfast" />
                <el-option label="午餐" value="lunch" />
                <el-option label="晚餐" value="dinner" />
                <el-option label="全天" value="all" />
              </el-select>
              <el-button type="primary" onClick={suspend}>指定停餐</el-button>
            </div>
            <el-table data={store.suspensions} table-layout="fixed">
              <el-table-column prop="date" label="日期" />
              <el-table-column label="餐次">{{ default: ({ row }) => row.mealType === "all" ? "全天" : mealLabels[row.mealType] }}</el-table-column>
              <el-table-column prop="reason" label="原因" />
              <el-table-column label="影响任务">{{ default: ({ row }) => row.affectedTaskIds.length }}</el-table-column>
            </el-table>
          </section>
        </div>
      </div>
    );
  }
});

const ReportsPage = defineComponent({
  setup() {
    return () => (
      <div>
        <PageHeader title="统计报表" subtitle="入库、出库、库存、采购支出和价格偏差" />
        <div class="stat-grid">
          <div class="stat-card"><TrendCharts /><div><p>本月采购支出</p><strong>¥128,600</strong></div></div>
          <div class="stat-card"><DataAnalysis /><div><p>库存金额</p><strong>¥46,200</strong></div></div>
          <div class="stat-card"><Bell /><div><p>价格偏差</p><strong>6 条</strong></div></div>
          <div class="stat-card"><Tickets /><div><p>对账单</p><strong>12 份</strong></div></div>
        </div>
        <section class="panel">
          <div class="chart-bars">
            {["入库", "出库", "库存", "采购", "偏差"].map((item, index) => (
              <div class="bar-item"><span>{item}</span><i style={{ height: `${80 + index * 24}px` }} /></div>
            ))}
          </div>
        </section>
      </div>
    );
  }
});

const WarningPage = defineComponent({
  setup() {
    return () => (
      <div>
        <PageHeader title="预警管理" subtitle="食材过期、采购价格和预警转任务" />
        <section class="panel">
          <el-table data={store.warnings} table-layout="fixed">
            <el-table-column prop="type" label="预警类型" />
            <el-table-column label="食堂">{{ default: ({ row }) => store.canteenName(row.canteenId) }}</el-table-column>
            <el-table-column prop="level" label="等级" />
            <el-table-column label="状态">{{ default: ({ row }) => <el-tag type={statusType(row.status)}>{row.status}</el-tag> }}</el-table-column>
            <el-table-column prop="createdAt" label="触发时间" />
          </el-table>
        </section>
      </div>
    );
  }
});

const SupervisionPage = defineComponent({
  setup() {
    const rows = [
      { type: "日管控", canteen: "第一中学食堂", status: "已完成", owner: "安全员" },
      { type: "周排查", canteen: "第一中学食堂", status: "待整改", owner: "食堂管理员" },
      { type: "月调度", canteen: "实验小学食堂", status: "进行中", owner: "项目管理员" }
    ];
    return () => (
      <div>
        <PageHeader title="共治监督" subtitle="日管控、周排查、月调度和监管检查" />
        <section class="panel">
          <el-table data={rows} table-layout="fixed">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="canteen" label="食堂" />
            <el-table-column prop="owner" label="责任人" />
            <el-table-column label="状态">{{ default: ({ row }) => <el-tag type={row.status === "已完成" ? "success" : "warning"}>{row.status}</el-tag> }}</el-table-column>
          </el-table>
        </section>
      </div>
    );
  }
});

const SystemPage = defineComponent({
  setup() {
    return () => (
      <div>
        <PageHeader title="系统管理" subtitle="项目、食堂、人员和多岗位配置">
          <el-button type="primary" disabled={isReadonly.value}>新增</el-button>
        </PageHeader>
        <div class="two-col">
          <section class="panel">
            <div class="panel-title">项目管理</div>
            <el-table data={store.projects} table-layout="fixed">
              <el-table-column prop="name" label="项目名称" />
              <el-table-column label="项目管理员">{{ default: ({ row }) => row.managerIds.map(store.userName).join("、") }}</el-table-column>
            </el-table>
          </section>
          <section class="panel">
            <div class="panel-title">人员管理</div>
            <el-table data={store.users} table-layout="fixed">
              <el-table-column prop="name" label="姓名" />
              <el-table-column label="角色">{{ default: ({ row }) => roleLabels[row.role] }}</el-table-column>
              <el-table-column label="岗位">{{ default: ({ row }) => row.posts.map((post) => post.label).join("、") }}</el-table-column>
              <el-table-column prop="status" label="状态" />
            </el-table>
          </section>
        </div>
      </div>
    );
  }
});

const OpenPage = defineComponent({
  props: { title: { type: String, required: true }, desc: { type: String, required: true } },
  setup(props) {
    return () => (
      <div>
        <PageHeader title={props.title} subtitle={props.desc} />
        <section class="panel">
          <EmptyHint text="此模块已纳入 demo 菜单权限和页面框架，可继续按 PRD 扩展详细表单。" />
        </section>
      </div>
    );
  }
});

const sourceLabel = (source: string) => {
  const map: Record<string, string> = {
    system: "系统任务",
    platform: "平台下发",
    project: "项目下发",
    canteen: "食堂下发",
    warning: "预警转办",
    brightKitchen: "明厨亮灶"
  };
  return map[source] || source;
};

const menuItems: MenuItem[] = [
  { key: "workbench", title: "工作台", icon: House, roles: ["platformAdmin", "projectAdmin", "canteenAdmin", "chef", "safetyOfficer", "stockKeeper", "frontline"], component: WorkbenchPage },
  { key: "canteen", title: "食堂管理", icon: Dish, roles: ["projectAdmin", "canteenAdmin", "chef"], component: CanteenPage },
  { key: "inventory", title: "食材库存", icon: Files, roles: ["projectAdmin", "canteenAdmin", "stockKeeper"], component: InventoryPage },
  { key: "reports", title: "统计报表", icon: TrendCharts, roles: ["platformAdmin", "projectAdmin", "canteenAdmin"], component: ReportsPage },
  { key: "warnings", title: "预警管理", icon: Bell, roles: ["projectAdmin", "canteenAdmin", "safetyOfficer", "stockKeeper"], component: WarningPage },
  { key: "safety", title: "食安管理", icon: DocumentChecked, roles: ["canteenAdmin", "safetyOfficer", "chef"], component: SafetyPage },
  { key: "bright", title: "明厨亮灶", icon: VideoCamera, roles: ["projectAdmin", "canteenAdmin", "safetyOfficer"], component: BrightKitchenPage },
  { key: "supervision", title: "共治监督", icon: Monitor, roles: ["platformAdmin", "projectAdmin", "canteenAdmin", "safetyOfficer"], component: SupervisionPage },
  { key: "attendance", title: "考勤管理", icon: Calendar, roles: ["projectAdmin", "canteenAdmin", "chef", "safetyOfficer", "stockKeeper", "frontline"], component: AttendancePage },
  { key: "tasks", title: "任务安排", icon: ClipboardList, roles: ["platformAdmin", "projectAdmin", "canteenAdmin", "chef", "safetyOfficer", "stockKeeper", "frontline"], component: TaskPage },
  { key: "system", title: "系统管理", icon: Setting, roles: ["platformAdmin", "projectAdmin", "canteenAdmin"], component: SystemPage },
  { key: "records", title: "相关记录查看", icon: Notebook, roles: ["frontline"], component: h(OpenPage, { title: "相关记录查看", desc: "一级岗位可查看本人任务、考勤和执行记录。" }) }
];

const visibleMenus = computed(() => menuItems.filter((item) => item.roles.includes(store.currentRole)));
const activeComponent = computed(() => {
  if (!visibleMenus.value.some((item) => item.key === activeMenu.value)) activeMenu.value = visibleMenus.value[0]?.key || "workbench";
  return visibleMenus.value.find((item) => item.key === activeMenu.value)?.component || WorkbenchPage;
});
</script>
