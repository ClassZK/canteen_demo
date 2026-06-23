import dayjs from 'dayjs';

export const dateTimeFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('YYYY-MM-DD HH:mm:ss');
  }
  return value;
};
export const dateTimeStartFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = `${dateFilter(data)} 00:00:00`;
  }
  return value;
};
export const dateTimeEndFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = `${dateFilter(data)} 23:59:59`;
  }
  return value;
};
export const dateFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('YYYY-MM-DD');
  }
  return value;
};
export const sToDateTimeFilter = (data: number) => {
  let value = '';
  if (data) {
    value = dateTimeFilter(data * 1000);
  }
  return value;
};
export const timeFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('HH:mm:ss');
  }
  return value;
};
export const yearMonthFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('YYYY-MM');
  }
  return value;
};
export const monthDayFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('MM-DD');
  }
  return value;
};
export const yearFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('YYYY');
  }
  return value;
};
export const monthFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('MM');
  }
  return value;
};
export const dayFilter = (data: Date|number|string) => {
  let value = '';
  if (data) {
    value = dayjs(data).format('DD');
  }
  return value;
};
export const timestampFilter = (data: Date|number|string) => {
  let value = 0;
  if (data) {
    value = dayjs(data).valueOf();
  }
  return value;
};