
# Vue Time Bar ⏱️

一个基于 Canvas 的时间段选择组件，适用于 Vue3 + Ant Design Vue，支持鼠标选择、拖拽、右键删除时间块。

![preview](./assets/demo.gif)

## ✨ 特性

- 支持以 30 分钟为单位的时间段选择
- 支持右键删除已选时间块
- 支持只读模式展示
- 支持已预约、不可用时间段展示（可扩展）

## 🚀 使用示例

```vue
<template>
  <TimeBar v-model:value="timeItems" :defaultValue="[]" />
</template>

<script setup lang="ts">
import TimeBar from 'vue-time-bar';
import { ref } from 'vue';

const timeItems = ref([]);
</script>
```

## 📘 Props

| Prop             | Type          | Description              |
|------------------|---------------|--------------------------|
| value / v-model  | TimeBarItems  | 当前选择时间段            |
| defaultValue     | TimeBarItems  | 初始时间段                |
| readonly         | boolean       | 是否只读                  |
| reservedTimes    | TimeBarItems  | 已预约时间段              |
| unavailableTimes | TimeBarItems  | 不可用时间段              |
```ts
[
  { start: "09:00", end: "10:00" },
  { start: "14:00", end: "15:30" }
]
```

```
vue-time-bar/
├── src/
│   └── components/TimeBar.vue         
├── examples/                         
│   └── App.vue                        
├── index.ts                           
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📜 License

[MIT](./LICENSE)
