<<<<<<< HEAD
# Vue Time Bar ⏱️

一个基于 Canvas 的时间段选择组件，适用于 Vue3 + Ant Design Vue，支持鼠标选择、拖拽、右键删除时间块。

![preview](./assets/demo.gif)

## ✨ 特性

- 支持 30分钟为单位的时间段选择
- 支持右键删除
- 支持只读模式
- 支持已预约、不可用时间段展示（可扩展）

## 🚀 使用示例

<template>
  <TimeBar v-model:value="timeItems" :defaultValue="[]" />
</template>

<script setup lang="ts">
import TimeBar from 'vue-time-bar';
import { ref } from 'vue';

const timeItems = ref([]);
</script>


## 📘 Props
Prop	Type	Description
value / v-model	TimeBarItems	当前选择时间段
defaultValue	TimeBarItems	初始时间段
readonly	boolean	是否只读
reservedTimes	TimeBarItems	已预约时间段
unavailableTimes	TimeBarItems	不可用时间段
=======
# vue-time-bar
A Vue3 time selection bar component for interactive time block scheduling.
>>>>>>> 8befdaa3b61dc48e2baa14fdbe164adfc028dd26
