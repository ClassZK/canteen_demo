export enum ActivityStatus {
  Pending = "0",
  Ongoing = "1",
  Evaluating = "2",
  Completed = "3",
}
export const statusMap = [
  {
    label: "未开始",
    value: ActivityStatus.Pending,
  },
  {
    label: "进行中",
    value: ActivityStatus.Ongoing,
  },
  {
    label: "待评价",
    value: ActivityStatus.Evaluating,
  },
  {
    label: "结束",
    value: ActivityStatus.Completed,
  },
];
