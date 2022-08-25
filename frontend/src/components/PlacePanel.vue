<script setup lang="ts">
import { htmlColors, type PlaceColorName, colors } from "../types";
import { fromInt32 } from "../types/RGBA";
const props = defineProps<{
  activeColor: PlaceColorName;
}>();

const emit = defineEmits<{
  (e: "setcolor", color: PlaceColorName): void;
}>();

const getBackgroundColorCSS = (color: number): string => {
  const { red, green, blue, alpha } = fromInt32(color);
  return `rgba(${red},${green},${blue},${alpha})`;
};

const changeColor = (e: MouseEvent, color: PlaceColorName) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("cc", color);
  emit("setcolor", color);
};
</script>

<template>
  <div class="flex space-x-2 w-full h-12 items-center">
    <button
      v-for="color in colors"
      @click="(e) => changeColor(e, color)"
      :key="color"
      class="grow h-8 w-1/12 rounded-md border-black box-border"
      :style="{ backgroundColor: getBackgroundColorCSS(htmlColors[color]) }"
      :class="{ 'border-2': props.activeColor === color }"
    ></button>
  </div>
</template>
