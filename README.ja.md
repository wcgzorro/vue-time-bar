
# Vue Time Bar ⏱️

Canvas ベースの時間ブロック選択コンポーネントで、Vue3 + Ant Design Vue に対応。マウス操作による選択、ドラッグ、右クリックでの削除をサポートします。

![preview](./assets/demo.gif)

## ✨ 特徴

- 30 分単位の時間ブロック選択
- 右クリックで時間ブロックを削除
- 読み取り専用モード対応
- 予約済み・使用不可時間ブロックの表示（拡張可能）

## 🚀 使用例

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

| プロップ名         | 型             | 説明                                  |
|------------------|----------------|--------------------------------------|
| value / v-model  | TimeBarItems   | 選択された時間ブロック                 |
| defaultValue     | TimeBarItems   | 初期表示する時間ブロック               |
| readonly         | boolean        | 読み取り専用モード                     |
| reservedTimes    | TimeBarItems   | 予約済みの時間ブロック                 |
| unavailableTimes | TimeBarItems   | 使用不可の時間ブロック                 |
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