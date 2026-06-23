/**
 * meta 介绍：
 * title：路由名称。路由模块名称的展示和面包屑模块名称的展示。
 * icon：菜单前显示的图标。仅 LayoutChildrenRoutes 中的一级路由，图标参考 views -> Layout -> sub_modules -> SVG。
 * permission：路由权限标识。用于判断角色后是否有对应的页面访问权限，防止用户通过 URL 输入进入页面，需要和后端统一。
 * role：角色路由权限标识。与路由权限标识功能，用于控制页面访问权限。
 * hiddenMenu：是否显示菜单。true：不显示。
 * hiddenBreadcrumb：是否显示面包屑导航。true：不显示。
 * discardRouteName：页面刷新时是否保存当前菜单。true：不保存。
 */

import _ from "tddev/utils";
import _utils from "@/utils/index";
const hideStaffMenu = _.getEnv("hideStaffMenu");

/** 布局模块 Layout 下的子路由 */
export const LayoutChildrenRoutes = [
  {
    path: "/home",
    name: "home",
    meta: {
      title: "总览",
      icon: "icon-zonglan",
    },
    component: () => import("@/views/Home/index.vue"),
  },
  {
    path: "/notification",
    name: "notification",
    meta: {
      title: "系统公告",
      hiddenMenu: true,
    },
    component: () => import("@/views/SystemManagement/sub_views/Notification/index.vue"),
  },
  {
    path: "/canteenManagement",
    name: "canteenManagement",
    meta: {
      title: "食堂管理",
      icon: "icon-stgl",
      role: "canteen_manage",
    },
    component: () => import("@/views/CanteenManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/canteenDishes",
        name: "canteenDishes",
        meta: {
          title: "菜品库",
          role: "dish_pool",
        },
        component: () => import("@/views/CanteenManagement/sub_views/CanteenDishes/index.vue"),
      },
      {
        path: "/canteenDishesUpdate",
        name: "canteenDishesUpdate",
        meta: {
          title: "菜品信息",
          hiddenMenu: true,
        },
        component: () => import("@/views/CanteenManagement/sub_views/CanteenDishes/update.vue"),
      },
      {
        path: "/recipeUser",
        name: "recipeUser",
        meta: {
          title: "配餐对象",
          role: "catering_objects",
        },
        component: () => import("@/views/CanteenManagement/sub_views/RecipeUser/index.vue"),
      },
      {
        path: "/recipeWeek",
        name: "recipeWeek",
        meta: {
          title: "本周食谱",
          role: "weekly_recipe",
        },
        component: () => import("@/views/CanteenManagement/sub_views/RecipeWeek/index.vue"),
      },
      {
        path: "/recipeWeekUpdate",
        name: "recipeWeekUpdate",
        meta: {
          title: "食谱信息",
          hiddenMenu: true,
        },
        component: () => import("@/views/CanteenManagement/sub_views/RecipeWeek/update.vue"),
      },
      {
        path: "/recipeAnalysis",
        name: "recipeAnalysis",
        meta: {
          title: "食谱分析",
          hiddenMenu: true,
          role: "recipe_analysis",
        },
        component: () => import("@/views/CanteenManagement/sub_views/RecipeAnalysis/index.vue"),
      },
      {
        path: "/canteenRecipe",
        name: "canteenRecipe",
        meta: {
          title: "食谱库",
          role: "recipe_pool",
        },
        component: () => import("@/views/CanteenManagement/sub_views/CanteenRecipe/index.vue"),
      },
      {
        path: "/canteenStaff",
        name: "canteenStaff",
        meta: {
          title: "从业人员",
          // hiddenMenu: hideStaffMenu,
          role: "employee_manage",
        },
        component: () => import("@/views/CanteenManagement/sub_views/CanteenStaff/index.vue"),
      },
      {
        path: "/recommendation",
        name: "recommendation",
        meta: {
          title: "采购量推荐",
          role: "purchase_recommend",
        },
        component: () => import("@/views/CanteenManagement/sub_views/Recommendation/index.vue"),
      },
      {
        path: "/recommendationSubmit",
        name: "recommendationSubmit",
        meta: {
          title: "采购量推荐提交",
          hiddenMenu: true,
        },
        component: () => import("@/views/CanteenManagement/sub_views/Recommendation/sub_modules/Submit.vue"),
      },
      {
        path: "/recommendationDetail",
        name: "recommendationDetail",
        meta: {
          title: "采购量推荐详情",
          hiddenMenu: true,
        },
        component: () => import("@/views/CanteenManagement/sub_views/Recommendation/sub_modules/Detail.vue"),
      },
    ],
  },
  {
    path: "/storeManagement",
    name: "storeManagement",
    meta: {
      title: "食材库存",
      icon: "icon-sckc",
      role: "food_inventory",
    },
    component: () => import("@/views/StoreManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/ingredientStore",
        name: "ingredientStore",
        meta: {
          title: "库存管理",
          role: "inventory_manage",
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/index.vue"),
      },
      {
        path: "/orderReceipt",
        name: "orderReceipt",
        meta: {
          title: "订单签收",
          role: "received_confirm",
        },
        component: () => import("@/views/StoreManagement/sub_views/OrderReceipt/index.vue"),
      },
      {
        path: "/orderReceiptDetail",
        name: "orderReceiptDetail",
        meta: {
          title: "订单签收详情",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/OrderReceipt/Detail.vue"),
      },
      {
        path: "/orderReceiptSign",
        name: "orderReceiptSign",
        meta: {
          title: "订单签收",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/OrderReceipt/Sign.vue"),
      },
      {
        path: "/confirmList",
        name: "confirmList",
        meta: {
          title: "食材入库",
          role: "received_confirm",
        },
        component: () => import("@/views/StoreManagement/sub_views/ConfirmList/index.vue"),
      },
      {
        path: "/confirmListDetail",
        name: "confirmListDetail",
        meta: {
          title: "食材入库详情",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/ConfirmList/Detail.vue"),
      },
      {
        path: "/ingredientIn",
        name: "ingredientIn",
        meta: {
          title: "自采入库",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/ingredientIn.vue"),
      },
      {
        path: "/ingredientOut",
        name: "ingredientOut",
        meta: {
          title: "食材出库",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/ingredientOut.vue"),
      },
      {
        path: "/ingredientScanOut",
        name: "ingredientScanOut",
        meta: {
          title: "食材出库",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/ingredientScanOut.vue"),
      },
      {
        path: "/ingredientCheck",
        name: "ingredientCheck",
        meta: {
          title: "盘点",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/ingredientCheck.vue"),
      },
      {
        path: "/ingredientDetail",
        name: "ingredientDetail",
        meta: {
          title: "食材出库",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/IngredientStore/ingredientDetail.vue"),
      },
      {
        path: "/inStoreLedger",
        name: "inStoreLedger",
        meta: {
          title: "入库台账",
          role: "inventory_record",
        },
        component: () => import("@/views/StoreManagement/sub_views/InStoreLedger/index.vue"),
      },
      {
        path: "/outStoreLedger",
        name: "outStoreLedger",
        meta: {
          title: "出库台账",
          role: "outbound_record",
        },
        component: () => import("@/views/StoreManagement/sub_views/OutStoreLedger/index.vue"),
      },
      {
        path: "/inventoryCheckRecord",
        name: "inventoryCheckRecord",
        meta: {
          title: "盘点记录",
          role: "inventory_check",
        },
        component: () => import("@/views/StoreManagement/sub_views/InventoryCheckRecord/index.vue"),
      },
      {
        path: "/sourceMange",
        name: "sourceMange",
        meta: {
          title: "溯源管理",
          role: "",
        },
        component: () => import("@/views/StoreManagement/sub_views/SourceMange/index.vue"),
      },
      {
        path: "/shelveApplication",
        name: "shelveApplication",
        meta: {
          title: "上架申请",
          role: "",
        },
        component: () => import("@/views/StoreManagement/sub_views/ShelveApplication/index.vue"),
      },
      {
        path: "/sourceMangeDetail",
        name: "sourceMangeDetail",
        meta: {
          title: "溯源管理详情",
          role: "",
          hiddenMenu: true,
        },
        component: () => import("@/views/StoreManagement/sub_views/SourceMange/Detail.vue"),
      },
    ],
  },
  {
    path: "/reportStatisticsManagement",
    name: "reportStatisticsManagement",
    meta: {
      title: "统计报表",
      icon: "icon-tjbb",
      role: "statistical_report",
    },
    component: () => import("@/views/ReportStatisticsManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/inStoreReports",
        name: "inStoreReports",
        meta: {
          title: "入库统计报表",
          role: "inventory_report",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/InStoreReports/index.vue"),
      },
      {
        path: "/outStoreReports",
        name: "outStoreReports",
        meta: {
          title: "出库统计报表",
          role: "outbound_report",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/OutStoreReports/index.vue"),
      },
      {
        path: "/procurementPriceDeviation",
        name: "procurementPriceDeviation",
        meta: {
          title: "采购价格偏差",
          role: "price_deviation",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/ProcurementPriceDeviation/index.vue"),
      },
      {
        path: "/inventorySummaryReports",
        name: "inventorySummaryReports",
        meta: {
          title: "盘存汇总报表",
          role: "inventory_check_report",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/InventorySummaryReports/index.vue"),
      },
      {
        path: "/ingredientPurchaseCostStatistics",
        name: "ingredientPurchaseCostStatistics",
        meta: {
          title: "采购支出统计",
          role: "purchase_costs_statistics",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/Procurement/index.vue"),
      },
      {
        path: "/procurementDetail",
        name: "procurementDetail",
        meta: {
          title: "采购支出详情",
          role: "",
          hiddenMenu: true,
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/Procurement/sub_modules/Detail.vue"),
      },
      {
        path: "/reconciliationManage",
        name: "reconciliationManage",
        meta: {
          title: "对账管理",
          role: "",
        },
        component: () => import("@/views/ReportStatisticsManagement/sub_views/ReconciliationManage/index.vue"),
      },
    ],
  },
  {
    path: "/forewarningManagement",
    name: "forewarningManagement",
    meta: {
      title: "预警管理",
      icon: "icon-yjgl",
      role: "warn_manage",
    },
    component: () => import("@/views/ForewarningManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/ingredientExpired",
        name: "ingredientExpired",
        meta: {
          title: "食材过期预警",
          role: "food_expire_warn",
        },
        component: () => import("@/views/ForewarningManagement/sub_views/IngredientExpired/index.vue"),
      },
      {
        path: "/dailyPurchasePrice",
        name: "dailyPurchasePrice",
        meta: {
          title: "日采购价格预警",
          role: "day_purchase_price_warn",
        },
        component: () => import("@/views/ForewarningManagement/sub_views/DailyPurchasePrice/index.vue"),
      },
      {
        path: "/monthlyPurchasePrice",
        name: "monthlyPurchasePrice",
        meta: {
          title: "月采购价格预警",
          role: "month_purchase_price_warn",
        },
        component: () => import("@/views/ForewarningManagement/sub_views/MonthlyPurchasePrice/index.vue"),
      },
    ],
  },
  {
    path: "/foodSafetyManagement",
    name: "foodSafetyManagement",
    meta: {
      title: "食安管理",
      icon: "icon-sagl",
      role: "food_safety_manage",
    },
    component: () => import("@/views/FoodSafetyManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/sampleRetention",
        name: "sampleRetention",
        meta: {
          title: "食品留样",
          role: "food_sample",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/SampleRetention/index.vue"),
      },
      {
        path: "/quarantineInspection",
        name: "quarantineInspection",
        meta: {
          title: "检疫检测",
          role: "quarantine_detection",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/QuarantineInspection/index.vue"),
      },
      {
        path: "/morningHealthCheck",
        name: "morningHealthCheck",
        meta: {
          title: "晨检记录",
          role: "morning_check",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/MorningHealthCheck/index.vue"),
      },
      {
        path: "/cleaningRecord",
        name: "cleaningRecord",
        meta: {
          title: "清洁消毒记录",
          rolesAny: ["cleaning_record", "environment_sanitization_record"],
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/CleaningDisinfectionRecord/index.vue"),
      },
      {
        path: "/environmentalDisinfection",
        name: "environmentalDisinfection",
        meta: {
          title: "环境消毒记录",
          role: "environment_sanitization_record",
          hiddenMenu: true,
        },
        redirect: { name: "cleaningRecord", query: { tab: "environmental" } },
      },
      {
        path: "/tablewareDisinfection",
        name: "tablewareDisinfection",
        meta: {
          title: "餐具消毒记录",
          role: "tableware_sanitization_record",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/TablewareDisinfection/index.vue"),
      },
      {
        path: "/fourPestDisinfection",
        name: "fourPestDisinfection",
        meta: {
          title: "四害消杀记录",
          role: "four_pest_control_record",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/FourPestDisinfection/index.vue"),
      },
      {
        path: "/safetySelfInspection",
        name: "safetySelfInspection",
        meta: {
          title: "安全自查记录",
          role: "safety_self_check",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/SafetySelfInspection/index.vue"),
      },
      {
        path: "/wasteDisposal",
        name: "wasteDisposal",
        meta: {
          title: "废弃物处置报表",
          role: "disposal_report",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/WasteDisposal/index.vue"),
      },
      {
        path: "/foodDdditiveUsage",
        name: "foodDdditiveUsage",
        meta: {
          title: "食品添加剂使用记录",
          role: "additive_use_record",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/FoodDdditiveUsage/index.vue"),
      },
      {
        path: "/mealAccompaniment",
        name: "mealAccompaniment",
        meta: {
          title: "陪餐记录",
          role: "meal_record",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/MealAccompaniment/index.vue"),
      },
      {
        path: "/leadershipInspection",
        name: "leadershipInspection",
        meta: {
          title: "视察记录",
          role: "parity_record",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/LeadershipInspection/index.vue"),
      },
      {
        path: "/brightKitchen",
        name: "brightKitchen",
        meta: {
          title: "明厨亮灶",
          role: "light_cooking",
        },
        component: () => import("@/views/FoodSafetyManagement/sub_views/BrightKitchen/index.vue"),
      },
    ],
  },
  {
    path: "/supervisionManagement",
    name: "supervisionManagement",
    meta: {
      title: "共治监管",
      icon: "icon-gzjg",
      role: "co_governance",
    },
    component: () => import("@/views/SupervisionManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/dailyPatrol",
        name: "dailyPatrol",
        meta: {
          title: "日管控",
          role: "day_control",
        },
        component: () => import("@/views/SupervisionManagement/sub_views/DailyPatrol/index.vue"),
      },
      {
        path: "/dailyPatrolDetail",
        name: "dailyPatrolDetail",
        meta: {
          title: "日管控详情",
          hiddenMenu: true,
        },
        component: () => import("@/views/SupervisionManagement/sub_views/DailyPatrol/detail.vue"),
      },
      {
        path: "/selfCheckEvaluation",
        name: "selfCheckEvaluation",
        meta: {
          title: "周排查",
          role: "weekly_check",
        },
        component: () => import("@/views/SupervisionManagement/sub_views/SelfCheckEvaluation/index.vue"),
      },
      {
        path: "/selfCheckEvaluationDetail",
        name: "selfCheckEvaluationDetail",
        meta: {
          title: "周排查详情",
          hiddenMenu: true,
        },
        component: () => import("@/views/SupervisionManagement/sub_views/SelfCheckEvaluation/detail.vue"),
      },
      {
        path: "/supervisionInspection",
        name: "supervisionInspection",
        meta: {
          title: "月调度",
          role: "month_dispatch",
        },
        component: () => import("@/views/SupervisionManagement/sub_views/SupervisionInspection/index.vue"),
      },
      {
        path: "/warningManagement",
        name: "warningManagement",
        meta: {
          title: "预警处理",
          role: "warn_manage",
        },
        component: () => import("@/views/ForewarningManagement/sub_views/WarningManagement/index.vue"),
      },
      {
        path: "/inspectionTemplate",
        name: "inspectionTemplate",
        meta: {
          title: "管控排查模板",
          role: "inspection_template",
        },
        component: () => import("@/views/SupervisionManagement/sub_views/InspectionTemplate/index.vue"),
      },
    ],
  },
  {
    path: "/systemManagement",
    name: "systemManagement",
    meta: {
      title: "系统管理",
      icon: "setting",
      rolesAny: ["org_manage", "device_manage", "admin_manage", "canteen_role_manage", "canteen_user_manage"],
    },
    component: () => import("@/views/SystemManagement/sub_modules/Layout.vue"),
    children: [
      {
        path: "/organization",
        name: "organization",
        meta: {
          title: "组织管理",
          role: "org_manage",
          platformOnly: true,
        },
        component: () => import("@/views/SystemManagement/sub_views/Organization/index.vue"),
      },
      {
        path: "/equipment",
        name: "equipment",
        meta: {
          title: "设备管理",
          role: "device_manage",
        },
        component: () => import("@/views/SystemManagement/sub_views/Equipment/index.vue"),
      },
      {
        path: "/platformUser",
        name: "platformUser",
        meta: {
          title: "管理员管理",
          role: "admin_manage",
          roleGroup: "sys",
        },
        component: () => import("@/views/SystemManagement/sub_views/SystemUser/index.vue"),
      },
      {
        path: "/systemRole",
        name: "systemRole",
        meta: {
          title: "角色管理",
          role: "canteen_role_manage",
          roleGroup: "canteen",
        },
        component: () => import("@/views/SystemManagement/sub_views/Role/index.vue"),
      },
      {
        path: "/systemUser",
        name: "systemUser",
        meta: {
          title: "人员管理",
          role: "canteen_user_manage",
          roleGroup: "canteen",
        },
        component: () => import("@/views/SystemManagement/sub_views/SystemUser/index.vue"),
      },
    ],
  },
];

/** 布局模块路由 */
const LayoutRoutes = [
  {
    path: "/",
    name: "index",
    component: () => import("@/views/Layout/index.vue"),
    redirect: "/home",
    children: LayoutChildrenRoutes,
  },
];

/** 非布局模块路由 */
export const NotLayoutRoutes = [
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录",
      discardRouteName: true,
    },
    component: () => import("@/views/Login/index.vue"),
  },
  {
    path: "/systemUserinfo",
    name: "systemUserinfo",
    meta: {
      title: "个人中心",
    },
    component: () => import("@/views/SystemManagement/sub_views/SystemUser/information.vue"),
  },
  {
    path: "/passwordChange",
    name: "passwordChange",
    meta: {
      title: "修改密码",
    },
    component: () => import("@/views/SystemManagement/sub_views/SystemUser/passwordChange.vue"),
  },
  {
    path: "/passwordReset",
    name: "passwordReset",
    meta: {
      title: "重置密码",
    },
    component: () => import("@/views/SystemManagement/sub_views/SystemUser/passwordReset.vue"),
  },
  {
    path: "/userPrivacyAgreement",
    name: "userPrivacyAgreement",
    meta: {
      title: "用户协议",
    },
    component: () => import("@/views/SystemManagement/sub_views/UserAgreement/index.vue"),
  },
  {
    path: "/userPrivacyPolicy",
    name: "userPrivacyPolicy",
    meta: {
      title: "隐私政策",
    },
    component: () => import("@/views/SystemManagement/sub_views/UserPrivacy/index.vue"),
  },
  {
    path: "/open",
    name: "open",
    meta: {
      title: "open",
      discardRouteName: true,
    },
    component: () => import("@/views/Open/sub_views/index.vue"),
  },
  {
    path: "/error404",
    name: "error404",
    meta: {
      title: "Error404",
    },
    component: () => import("@/views/Error/sub_views/error404.vue"),
  },
  {
    path: "/:pathMatch(.*)",
    meta: {
      title: "Error404",
    },
    component: () => import("@/views/Error/sub_views/error404.vue"),
  },
];

/** 合并项目所有的路由 */
export const routes = [...LayoutRoutes, ...NotLayoutRoutes];
