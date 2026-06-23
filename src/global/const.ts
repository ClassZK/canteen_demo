/** MD5 加盐 */
export const TAG = "DAZHOUTEL";
import { ElMessage } from "element-plus";
/** 请求状态 */
export enum ResponseCodeEnum {
  success = 200, // 成功
  logout = 401, // 退出
  fail = 0, // 失败
}

/** 操作类型枚举 */
export enum OperationTypeEnum {
  default = "default",
  add = "add",
  update = "update",
  delete = "delete",
  multipleDelete = "multipleDelete",
  detail = "detail",
  handle = "handle",
  remove = "remove",
  import = "import",
  export = "export",
  upload = "upload",
  role = "role",
  auth = "auth",
  reset = "reset",
  approval = "approval",
  comment = "comment",
}
/** 操作类型名称 */
export const OperationTypeName: Obj = {
  [OperationTypeEnum.default]: "",
  [OperationTypeEnum.add]: "新增",
  [OperationTypeEnum.update]: "编辑",
  [OperationTypeEnum.delete]: "删除",
  [OperationTypeEnum.multipleDelete]: "批量删除",
  [OperationTypeEnum.detail]: "详情",
  [OperationTypeEnum.handle]: "处理",
  [OperationTypeEnum.remove]: "移除",
  [OperationTypeEnum.import]: "导入",
  [OperationTypeEnum.export]: "导出",
  [OperationTypeEnum.upload]: "上传",
  [OperationTypeEnum.role]: "角色",
  [OperationTypeEnum.auth]: "授权",
  [OperationTypeEnum.reset]: "重置",
  [OperationTypeEnum.approval]: "审批",
  [OperationTypeEnum.comment]: "评论",
};

/** 是否 */
export enum WhetherEnum {
  yes = "1",
  no = "0",
}
export const WhetherList = [
  {
    name: "是",
    value: WhetherEnum.yes,
  },
  {
    name: "否",
    value: WhetherEnum.no,
  },
];
export const WhetherList2 = [
  {
    name: "能",
    value: WhetherEnum.yes,
  },
  {
    name: "否",
    value: WhetherEnum.no,
  },
];
export const WhetherList3 = [
  {
    name: "正常",
    value: WhetherEnum.yes,
  },
  {
    name: "异常",
    value: WhetherEnum.no,
  },
];

/** 性别 */
export enum SexEnum {
  man = "0",
  woman = "1",
}
export const SexList = [
  {
    name: "男",
    value: SexEnum.man,
  },
  {
    name: "女",
    value: SexEnum.woman,
  },
];

/** 食品添加剂名称 */
export const FoodAdditiveNameList = [
  {
    name: "防腐剂",
    options: [
      { name: "山梨酸钾", value: "山梨酸钾" },
      { name: "苯甲酸钠", value: "苯甲酸钠" },
      { name: "脱氢乙酸钠", value: "脱氢乙酸钠" },
      { name: "丙酸钙", value: "丙酸钙" },
    ],
  },
  {
    name: "抗氧化剂",
    options: [
      { name: "D-异抗坏血酸钠", value: "D-异抗坏血酸钠" },
      { name: "抗坏血酸", value: "抗坏血酸" },
      { name: "维生素E", value: "维生素E" },
      { name: "茶多酚", value: "茶多酚" },
    ],
  },
  {
    name: "甜味剂",
    options: [
      { name: "安赛蜜", value: "安赛蜜" },
      { name: "阿斯巴甜", value: "阿斯巴甜" },
      { name: "三氯蔗糖", value: "三氯蔗糖" },
      { name: "甜菊糖苷", value: "甜菊糖苷" },
    ],
  },
  {
    name: "着色剂",
    options: [
      { name: "β-胡萝卜素", value: "β-胡萝卜素" },
      { name: "焦糖色", value: "焦糖色" },
      { name: "柠檬黄", value: "柠檬黄" },
      { name: "日落黄", value: "日落黄" },
    ],
  },
  {
    name: "增稠剂/稳定剂",
    options: [
      { name: "黄原胶", value: "黄原胶" },
      { name: "卡拉胶", value: "卡拉胶" },
      { name: "果胶", value: "果胶" },
      { name: "海藻酸钠", value: "海藻酸钠" },
      { name: "羧甲基纤维素钠", value: "羧甲基纤维素钠" },
    ],
  },
  {
    name: "乳化剂",
    options: [
      { name: "单双甘油脂肪酸酯", value: "单双甘油脂肪酸酯" },
      { name: "蔗糖脂肪酸酯", value: "蔗糖脂肪酸酯" },
      { name: "卵磷脂", value: "卵磷脂" },
    ],
  },
  {
    name: "膨松剂/酸度调节剂",
    options: [
      { name: "碳酸氢钠", value: "碳酸氢钠" },
      { name: "碳酸氢铵", value: "碳酸氢铵" },
      { name: "柠檬酸", value: "柠檬酸" },
      { name: "乳酸", value: "乳酸" },
    ],
  },
  {
    name: "增味剂/香精香料",
    options: [
      { name: "谷氨酸钠", value: "谷氨酸钠" },
      { name: "5'-呈味核苷酸二钠", value: "5'-呈味核苷酸二钠" },
      { name: "食用香精", value: "食用香精" },
    ],
  },
];

export const FoodAdditiveCategoryPickerList = FoodAdditiveNameList.map(group => ({
  name: group.name,
  value: group.name,
}));

export const FoodAdditiveNamePickerList = FoodAdditiveNameList.reduce((list, group) => {
  group.options.forEach(option => {
    list.push({
      name: `${group.name} / ${option.name}`,
      value: option.value,
      category: group.name,
    });
  });
  return list;
}, [] as { name: string; value: string; category: string }[]);

/** 菜品分类 */
export enum DishesTypeEnum {
  ZhuShi = "0",
  GaoDian = "1",
  XiaoChi = "2",
  HunCai = "3",
  SuCai = "4",
  TangLei = "5",
}
export const DishesTypeList = [
  {
    name: "主食",
    value: DishesTypeEnum.ZhuShi,
  },
  {
    name: "糕点",
    value: DishesTypeEnum.GaoDian,
  },
  {
    name: "小吃",
    value: DishesTypeEnum.XiaoChi,
  },
  {
    name: "荤菜",
    value: DishesTypeEnum.HunCai,
  },
  {
    name: "素菜",
    value: DishesTypeEnum.SuCai,
  },
  {
    name: "汤类",
    value: DishesTypeEnum.TangLei,
  },
];

/** 用餐季节 */
export enum DiningSeasonEnum {
  Spring = "0",
  Summer = "1",
  Autumn = "2",
  Winter = "3",
}
export const DiningSeasonList = [
  {
    name: "春",
    value: DiningSeasonEnum.Spring,
  },
  {
    name: "夏",
    value: DiningSeasonEnum.Summer,
  },
  {
    name: "秋",
    value: DiningSeasonEnum.Autumn,
  },
  {
    name: "冬",
    value: DiningSeasonEnum.Winter,
  },
];

/** 用餐餐次 */
export enum MealtimeEnum {
  Breakfast = "0",
  MorningSnack = "1",
  Lunch = "2",
  AfternoonSnack = "3",
  Dinner = "4",
  NightSnack = "5",
}
export const MealtimeList = [
  {
    name: "早餐",
    value: MealtimeEnum.Breakfast,
  },
  {
    name: "上午加餐",
    value: MealtimeEnum.MorningSnack,
  },
  {
    name: "午餐",
    value: MealtimeEnum.Lunch,
  },
  {
    name: "下午加餐",
    value: MealtimeEnum.AfternoonSnack,
  },
  {
    name: "晚餐",
    value: MealtimeEnum.Dinner,
  },
  {
    name: "夜宵",
    value: MealtimeEnum.NightSnack,
  },
];

/** 菜品标签 */
export const DishesLabelList1 = [
  {
    name: "健康食品",
    value: "健康食品",
  },
  {
    name: "有助于减肥",
    value: "有助于减肥",
  },
  {
    name: "降低胆固醇",
    value: "降低胆固醇",
  },
  {
    name: "增强骨骼健康",
    value: "增强骨骼健康",
  },
  {
    name: "促进消化",
    value: "促进消化",
  },
  {
    name: "有抗氧化作用",
    value: "有抗氧化作用",
  },
  {
    name: "提供能量",
    value: "提供能量",
  },
  {
    name: "维生素丰富",
    value: "维生素丰富",
  },
  {
    name: "支持免疫系统",
    value: "支持免疫系统",
  },
  {
    name: "适合素食者",
    value: "适合素食者",
  },
  {
    name: "富含纤维",
    value: "富含纤维",
  },
  {
    name: "高蛋白质",
    value: "高蛋白质",
  },
  {
    name: "低卡路里",
    value: "低卡路里",
  },
  {
    name: "营养丰富",
    value: "营养丰富",
  },
  {
    name: "缓解压力和焦虑",
    value: "缓解压力和焦虑",
  },
];
export const DishesLabelList2 = [
  {
    name: "不适宜孕妇",
    value: "不适宜孕妇",
  },
  {
    name: "高脂肪含量",
    value: "高脂肪含量",
  },
  {
    name: "高咖啡因含量",
    value: "高咖啡因含量",
  },
  {
    name: "含有亚硝酸盐",
    value: "含有亚硝酸盐",
  },
  {
    name: "可能引起消化不良",
    value: "可能引起消化不良",
  },
  {
    name: "不适宜乳糖不耐受者",
    value: "不适宜乳糖不耐受者",
  },
  {
    name: "不适宜高血压患者",
    value: "不适宜高血压患者",
  },
  {
    name: "可能引起过敏反应",
    value: "可能引起过敏反应",
  },
  {
    name: "极易引起食物中毒",
    value: "极易引起食物中毒",
  },
  {
    name: "潜在食品交叉感染风险",
    value: "潜在食品交叉感染风险",
  },
  {
    name: "辛辣食物",
    value: "辛辣食物",
  },
  {
    name: "含有过敏原",
    value: "含有过敏原",
  },
  {
    name: "高糖分",
    value: "高糖分",
  },
  {
    name: "高胆固醇",
    value: "高胆固醇",
  },
  {
    name: "高钠含量",
    value: "高钠含量",
  },
  {
    name: "3-6岁",
    value: "3-6岁",
  },
  {
    name: "6-12岁",
    value: "6-12岁",
  },
  {
    name: "12-18岁",
    value: "12-18岁",
  },
];

/** 厨房区域 */
export enum CanteenAreaEnum {
  DaTing = "1",
  XiXiaoJian = "2",
  CuJiaGongJian = "3",
  CangKu = "4",
  BeiCanJian = "5",
  BaiAnJian = "6",
}
export const CanteenAreaList = [
  {
    name: "大厅",
    value: CanteenAreaEnum.DaTing,
  },
  {
    name: "洗消间",
    value: CanteenAreaEnum.XiXiaoJian,
  },
  {
    name: "粗加工间",
    value: CanteenAreaEnum.CuJiaGongJian,
  },
  {
    name: "仓库",
    value: CanteenAreaEnum.CangKu,
  },
  {
    name: "备餐间",
    value: CanteenAreaEnum.BeiCanJian,
  },
  {
    name: "白案间",
    value: CanteenAreaEnum.BaiAnJian,
  },
];

/** 工作班次 */
export enum WorkShiftEnum {
  morning = "1",
  nooning = "2",
  evening = "3",
}
export const WorkShiftList = [
  {
    name: "早班",
    value: WorkShiftEnum.morning,
  },
  {
    name: "中班",
    value: WorkShiftEnum.nooning,
  },
  {
    name: "晚班",
    value: WorkShiftEnum.evening,
  },
];

/** 餐具类型 */
export const TablewareTypeList = [
  { name: "碗", value: "1" },
  { name: "盘", value: "2" },
  { name: "筷", value: "3" },
  { name: "勺", value: "4" },
  { name: "杯", value: "5" },
  { name: "餐盘", value: "6" },
];

/** 消毒方式 */
export const DisinfectMethodList = [
  { name: "热力消毒", value: "1" },
  { name: "蒸汽消毒", value: "2" },
  { name: "煮沸消毒", value: "3" },
  { name: "消毒柜消毒", value: "4" },
  { name: "化学消毒", value: "5" },
];

/** 垃圾类型 */
export enum GarbageTypeEnum {
  GanShui = "1",
  ChuYu = "2",
  KeHuiShou = "3",
  YouHai = "4",
  QiTa = "5",
}
export const GarbageTypeList = [
  {
    name: "泔水垃圾",
    value: GarbageTypeEnum.GanShui,
  },
  {
    name: "厨余垃圾",
    value: GarbageTypeEnum.ChuYu,
  },
  {
    name: "可回收垃圾",
    value: GarbageTypeEnum.KeHuiShou,
  },
  {
    name: "有害垃圾",
    value: GarbageTypeEnum.YouHai,
  },
  {
    name: "其他垃圾",
    value: GarbageTypeEnum.QiTa,
  },
];

/** 陪餐类型 */
export enum MealAccompanyEnum {
  JiaZhang = "1",
  LaoShi = "2",
  LingDao = "3",
}
export const MealAccompanyList = [
  {
    name: "家长陪餐",
    value: MealAccompanyEnum.JiaZhang,
  },
  {
    name: "老师陪餐",
    value: MealAccompanyEnum.LaoShi,
  },
  {
    name: "领导陪餐",
    value: MealAccompanyEnum.LingDao,
  },
];

/** 视察类型 */
export enum InspectTypeEnum {
  LingDao = "1",
  AnQuan = "2",
  JiaoLiu = "3",
}
export const InspectTypeList = [
  {
    name: "领导检查",
    value: InspectTypeEnum.LingDao,
  },
  {
    name: "安全检查",
    value: InspectTypeEnum.AnQuan,
  },
  {
    name: "交流学习",
    value: InspectTypeEnum.JiaoLiu,
  },
];

/** 回复状态 */
export enum ReplyStatusEnum {
  Pending = "0",
  Replied = "1",
}
export const ReplyStatusList = [
  {
    name: "待回复",
    value: ReplyStatusEnum.Pending,
  },
  {
    name: "已回复",
    value: ReplyStatusEnum.Replied,
  },
];

/** 处理状态 */
export enum HandleStatusEnum {
  Pending = "0",
  Handled = "1",
}
export const HandleStatusList = [
  {
    name: "待处理",
    value: HandleStatusEnum.Pending,
  },
  {
    name: "已处理",
    value: HandleStatusEnum.Handled,
  },
];

/** 审查状态 */
export enum CheckStatusEnum {
  uncommitted = "0",
  Pending = "1",
  Finish = "2",
}
export const CheckStatusList = [
  {
    name: "待提交",
    value: CheckStatusEnum.uncommitted,
  },
  {
    name: "待审查",
    value: CheckStatusEnum.Pending,
  },
  {
    name: "已审查",
    value: CheckStatusEnum.Finish,
  },
];

/** 审查结果 */
export enum CheckResultEnum {
  Pending = "0",
  Yes = "1",
  No = "2",
}
export const CheckResultList = [
  {
    name: "是",
    value: CheckResultEnum.Yes,
  },
  {
    name: "否",
    value: CheckResultEnum.No,
  },
];

/** 审批评价 */
export const FourPestContentList = [
  { name: "蚊子", value: "1" },
  { name: "蟑螂", value: "2" },
  { name: "鼠", value: "3" },
  { name: "苍蝇", value: "4" },
];

export enum EvaluationTypeEnum {
  Good = "0",
  Average = "1",
  Improved = "2",
}
export const EvaluationTypeList = [
  {
    name: "很好",
    value: EvaluationTypeEnum.Good,
  },
  {
    name: "还可以",
    value: EvaluationTypeEnum.Average,
  },
  {
    name: "待改进",
    value: EvaluationTypeEnum.Improved,
  },
];

/** 设备状态 */
export enum EquipmentStatusEnum {
  Success = 1,
  Warning = 2,
}
export const EquipmentStatusList = [
  {
    name: "正常",
    value: EquipmentStatusEnum.Success,
  },
  {
    name: "异常",
    value: EquipmentStatusEnum.Warning,
  },
];

/** 评分 */
export enum ScoreEnum {
  WanMei = "0",
  YouXiu = "1",
  LiangHang = "2",
  YiBan = "3",
  JiaoCha = "4",
}
export const ScoreList = [
  {
    name: "完美",
    value: ScoreEnum.WanMei,
  },
  {
    name: "优秀",
    value: ScoreEnum.YouXiu,
  },
  {
    name: "良好",
    value: ScoreEnum.LiangHang,
  },
  {
    name: "一般",
    value: ScoreEnum.YiBan,
  },
  {
    name: "较差",
    value: ScoreEnum.JiaoCha,
  },
];

/** 食谱录入类型 */
export enum AddRecipeTypeEnum {
  AddRecipe = "0",
  NotRecipe = "1",
}
export const AddRecipeTypeList = [
  {
    name: "已录入食谱",
    value: AddRecipeTypeEnum.AddRecipe,
  },
  {
    name: "未录入食谱",
    value: AddRecipeTypeEnum.NotRecipe,
  },
];

/** 处理类型 */
export enum HandleTypeEnum {
  Pending = 1,
  Handled = 2,
}
export const HandleTypeList = [
  {
    name: "待处理",
    value: HandleTypeEnum.Pending,
  },
  {
    name: "已处理",
    value: HandleTypeEnum.Handled,
  },
];

/** ElementPlus Message */
export const Message = {
  success: (message: string) => {
    if (message.length > 0) {
      ElMessage({
        message,
        type: "success",
        showClose: true,
        grouping: true,
        plain: true,
      });
    }
  },
  warning: (message: string) => {
    if (message.length > 0) {
      ElMessage({
        message,
        type: "warning",
        showClose: true,
        grouping: true,
        plain: true,
      });
    }
  },
  error: (message: string) => {
    if (message.length > 0) {
      ElMessage({
        message,
        type: "error",
        showClose: true,
        grouping: true,
        plain: true,
      });
    }
  },
  info: (message: string) => {
    if (message.length > 0) {
      ElMessage({
        message,
        type: "info",
        showClose: true,
        grouping: true,
        plain: true,
      });
    }
  },
  close: () => {
    ElMessage.closeAll();
  },
};
