import { request } from "@/utils/Http";

export const apiAttendanceScheduleMonth = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/schedule/month",
    method: "POST",
    data,
  });
};

export const apiAttendanceScheduleDay = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/schedule/day",
    method: "POST",
    data,
  });
};

export const apiAttendanceScheduleSave = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/schedule/save",
    method: "POST",
    data,
  });
};

export const apiAttendanceRecordList = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/records",
    method: "POST",
    data,
  });
};

export const apiAttendanceLeaveList = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/leave/list",
    method: "POST",
    data,
  });
};

export const apiAttendanceLeaveSubmit = (data: Obj): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/leave/submit",
    method: "POST",
    data,
  });
};

export const apiAttendanceHandoverUsers = (): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/handover-users",
    method: "POST",
  });
};

export const apiAttendanceApprovalUsers = (): Promise<HttpResult> => {
  return request({
    url: "/warehouse/sfs/attendance/approval-users",
    method: "POST",
  });
};
