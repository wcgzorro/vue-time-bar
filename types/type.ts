// components/core/time-bar/types.ts

// 定义 TimeBarItem 类型
export interface TimeBarItem {
  duration: number;
  end_time: number;
  start_time: number;
}

// 定义 TimeBarItems 类型为数组
export type TimeBarItems = TimeBarItem[];
