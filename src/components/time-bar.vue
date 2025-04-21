<template>
  <div class="time-bar-container">
    <input
      v-show="false"
      id="inputField"
      :value="inputValue"
      placeholder="请输入新的值"
      @input="handleInputChange"
    />

    <div ref="containerRef" class="canvas-container">
      <a-popover v-if="!props.readonly">
        <template #content>
          <span>鼠标右键点击色块可删除</span>
        </template>
        <ExclamationCircleOutlined
          style="position: absolute; top: 20px; left: 820px; font-size: 18px"
        />
      </a-popover>
      <canvas
        ref="canvasRef"
        class="canvas-ref"
        :width="canvasWidth"
        :height="canvasHeight"
        :style="{ left: canvasOffsetLeft + 'px' }"
        @mousemove="handleMouseMove"
        @mouseleave="clearTooltip"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @contextmenu="handleRightClick"
      />

      <div v-if="tooltip.visible" class="tooltip" :style="tooltip.style">
        {{ tooltip.time }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, ref, watch } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Form } from 'ant-design-vue';
  import type { TimeBarItem, TimeBarItems } from '../type';

  //  `readonly` 只读属性
  const props = defineProps({
    readonly: {
      type: Boolean,
      default: false,
    },
    // 加上defultValue字段
    defaultValue: {
      type: Array as () => TimeBarItems,
      default: () => [],
    },
    //不可用时间段
    unavailableTimes: {
      type: Array as () => TimeBarItems,
      default: () => [],
    },
    //已预约的时间段
    reservedTimes: {
      type: Array as () => TimeBarItems,
      default: () => [],
    },
  });

  // 使用Ant Design Vue提供的表单上下文
  defineOptions({ inheritAttrs: false });
  const formItemContext = Form.useInjectFormItemContext();

  //外部传入的值
  const modelValue = defineModel<TimeBarItems>('value', { type: Array });

  // 内部数据模型
  const inputValue = ref<string>('');

  // const internalData = ref<TimeBarItems>();
  const containerRef = ref<HTMLElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  // 画布宽高
  const canvasWidth = 1060;
  const canvasHeight = 40;
  const cellWidth = canvasWidth / 24; // 每小时的单元格宽度
  // 作为变量存储的 Canvas 左偏移量
  const canvasOffsetLeft = -260;
  let startTime = ref<number | null>(null);
  const isDragging = ref(false);

  // 清空画布
  const clearCanvas = () => {
    const canvas = canvasRef.value;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Tooltip 数据
  const tooltip = ref({
    visible: false,
    time: '',
    style: {
      left: '0px',
      top: '0px',
    },
  });

  // 绘制画布背景和时间块
  const drawCanvas = (
    items: TimeBarItem[],
    highlightX?: number,
    highlightStart?: number,
    highlightEnd?: number,
  ) => {
    const canvas = canvasRef.value;
    // console.log(canvas);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    clearCanvas();

    // 绘制背景网格 (24小时)
    ctx.fillStyle = '#f0f0f0';
    ctx.strokeStyle = '#ddd';
    for (let i = 0; i < 24; i++) {
      const x = i * cellWidth;
      ctx.fillRect(x, 0, cellWidth, canvasHeight);
      ctx.strokeRect(x, 0, cellWidth, canvasHeight);

      // 绘制时间标记
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(`${i}`, x + 5, canvasHeight - 5);
      ctx.fillStyle = '#f0f0f0';
    }

    // console.log('items', items);
    // 绘制 TimeBarItem 时间块
    ctx.fillStyle = 'rgba(0, 185, 107, 0.6)'; // 时间块颜色
    items.forEach((item) => {
      const startX = (item.start_time / 60) * cellWidth;
      const endX = (item.end_time / 60) * cellWidth;
      ctx.fillRect(startX, 0, endX - startX, canvasHeight);
    });

    // 绘制竖线表示当前时间位置
    if (highlightX !== undefined) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // 红色半透明
      ctx.beginPath();
      ctx.moveTo(highlightX, 0);
      ctx.lineTo(highlightX, canvasHeight);
      ctx.stroke();
    }

    if (highlightStart !== undefined && highlightEnd !== undefined) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.5)'; // 半透明橙色
      ctx.fillRect(highlightStart, 0, highlightEnd - highlightStart, canvasHeight);
    }
  };

  onMounted(async () => {
    await nextTick(); // 确保 DOM 挂载完成
    if (!canvasRef.value) {
      console.warn('Canvas 为空，等待重新绘制...');
      return;
    }
    drawCanvas(modelValue.value || []);
  });

  watch(
    () => props.readonly,
    (newVal, oldVal) => {
      console.log(`readonly 变化: ${oldVal} -> ${newVal}`);
    },
  );

  // 当外部值变化时更新内部状态
  watch(
    () => modelValue.value,
    (newValue) => {
      // console.log('外部值:', props.unavailableTimes);
      if (!newValue || newValue.length == 0) {
        modelValue.value = props.defaultValue; // 使用默认值
        // console.warn('modelValue 重置为:', props.defaultValue);
        inputValue.value = JSON.stringify(modelValue.value);
        drawCanvas([]);
        return;
      }
      if (newValue && newValue.length > 0) {
        inputValue.value = JSON.stringify(newValue);
        // console.log('外部值更新:', newValue);
        drawCanvas(newValue);
      }
      // else {
      //clearCanvas();
      // }
    },
    { immediate: true, deep: true },
  );

  // 当input中的值变化时，通知外部表单并更新modelValue
  const handleInputChange = (event: Event) => {
    if (props.readonly) return;
    const newValue = (event.target as HTMLInputElement).value;
    inputValue.value = newValue;
    try {
      // 解析输入的 JSON 字符串为对象数组
      const parsedValue = JSON.parse(newValue) as TimeBarItems;
      modelValue.value = parsedValue;
      // 通知表单值变化
      formItemContext?.onFieldChange?.();
      console.log('通知外部表单，值已更新:', parsedValue);
      drawCanvas(parsedValue);
    } catch (e) {
      console.error(e, '输入的值不是有效的 JSON 格式');
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (event: MouseEvent) => {
    if (props.readonly) return;
    // if (!isDragging.value || startTime.value === null) return;

    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const hour = Math.floor(mouseX / cellWidth);
    // 计算以30分钟为单位的时间
    const rawMinutes = ((mouseX % cellWidth) / cellWidth) * 60;
    const minutes = rawMinutes < 25 ? 0 : rawMinutes < 50 ? 30 : 0;
    const displayHour = rawMinutes >= 50 ? hour + 1 : hour;
    const endTime = displayHour * 60 + minutes; // 以30分钟为单位的 endTime

    tooltip.value.time = `${displayHour}:${minutes.toString().padStart(2, '0')}`;
    tooltip.value.style.left = `${mouseX + canvasOffsetLeft}px`;
    tooltip.value.style.top = `${rect.height + 10}px`;
    tooltip.value.visible = true;

    const highlightX = (displayHour + minutes / 60) * cellWidth;
    // console.log(highlightX);
    if (modelValue.value && startTime.value === null) {
      drawCanvas(modelValue.value, highlightX);
    } else if (modelValue.value && startTime.value !== null) {
      drawCanvas(
        modelValue.value,
        highlightX,
        (startTime.value / 60) * cellWidth,
        (endTime / 60) * cellWidth,
      );
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (props.readonly || event.button !== 0) return; // 仅处理左键点击 (0 = 左键, 1 = 中键, 2 = 右键)
    // if (event.button !== 0) return;
    // console.log('handleMouseDown');
    const rect = canvasRef.value?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const rawStartTime = (mouseX / cellWidth) * 60;
    const rawMinutes = rawStartTime % 60;
    const startHour = Math.floor(rawStartTime / 60);
    const alignedMinutes = rawMinutes < 15 ? 0 : rawMinutes < 45 ? 30 : 0;
    const alignedHour = rawMinutes >= 45 ? startHour + 1 : startHour;

    startTime.value = alignedHour * 60 + alignedMinutes;
    isDragging.value = true;
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (props.readonly || event.button !== 0) return; // 仅处理左键点击
    // if (event.button !== 0) return;
    // console.log('handleMouseUp');
    const rect = canvasRef.value?.getBoundingClientRect();
    if (!rect || startTime.value === null) return;

    const mouseX = event.clientX - rect.left;
    const rawMinutes = ((mouseX % cellWidth) / cellWidth) * 60;
    const minutes = rawMinutes < 25 ? 0 : rawMinutes < 50 ? 30 : 0;
    const hour = Math.floor(mouseX / cellWidth);
    const displayHour = rawMinutes >= 50 ? hour + 1 : hour;
    const endTime = displayHour * 60 + minutes;

    if (modelValue.value && startTime.value !== endTime) {
      const newRange =
        startTime.value < endTime
          ? { start_time: startTime.value, end_time: endTime }
          : { start_time: endTime, end_time: startTime.value };
      // 合并时间段
      const merged = mergeTimeRanges([...modelValue.value, newRange]);
      modelValue.value = merged.map(({ start_time, end_time }) => ({
        start_time,
        end_time,
        duration: end_time - start_time,
      }));

      // inputValue.value = JSON.stringify(modelValue.value);
      formItemContext?.onFieldChange?.();
      drawCanvas(modelValue.value);
    }
    startTime.value = null;
    isDragging.value = false;
  };

  // 处理鼠标右键点击事件
  const handleRightClick = (event: MouseEvent) => {
    if (props.readonly) return;
    event.preventDefault(); // 阻止默认的右键菜单

    const canvas = canvasRef.value;
    if (!canvas || !modelValue.value) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    const clickedTime = Math.floor((mouseX / cellWidth) * 60);

    const clickedItemIndex = modelValue.value.findIndex(
      (item) => clickedTime >= item.start_time && clickedTime <= item.end_time,
    );

    if (clickedItemIndex !== -1) {
      modelValue.value.splice(clickedItemIndex, 1);
      inputValue.value = JSON.stringify(modelValue.value);
      formItemContext?.onFieldChange?.();
      drawCanvas(modelValue.value);
    }
  };

  // 清除 tooltip
  const clearTooltip = () => {
    tooltip.value.visible = false;
    if (modelValue.value) {
      drawCanvas(modelValue.value); // 清除竖线
    }
  };

  function mergeTimeRanges(
    ranges: { start_time: number; end_time: number }[],
  ): { start_time: number; end_time: number }[] {
    if (!ranges.length) return [];

    // 按开始时间排序
    const sorted = [...ranges].sort((a, b) => a.start_time - b.start_time);
    const merged: { start_time: number; end_time: number }[] = [];

    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      if (next.start_time <= current.end_time) {
        // 重叠或首尾相接：合并
        current.end_time = Math.max(current.end_time, next.end_time);
      } else {
        // 无重叠：推入当前并移动指针
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);
    return merged;
  }
</script>

<style scoped>
  .time-bar-container {
    width: 900px;
  }

  input {
    width: 100%;
    margin-top: 8px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .canvas-ref {
    display: block;
    position: relative;

    /* left: -260px; */
  }

  .canvas-container {
    box-sizing: border-box; /* 包含内边距和边框在内 */
    width: 100%;
    height: 40px;
    margin: 0; /* 消除外边距 */
    margin-top: 10px;
    padding: 0; /* 消除内边距 */
    overflow: hidden; /* 防止内容溢出 */
    border: 0 solid #ddd;

    /* background-color: #fff; */
  }

  .tooltip {
    position: absolute;
    padding: 2px 5px;

    /* transform: translate(-800%, 40%); */
    border-radius: 4px;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
  }
</style>
