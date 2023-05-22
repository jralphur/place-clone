<script setup lang="ts">
import { htmlColors, type PlaceColorName, colors } from "../types";
import { getBackgroundColorCSS } from "../utils/rgba";
const props = defineProps<{
  rgbaColor: string;
  activeColor: PlaceColorName;
}>();

const emit = defineEmits<{
  (e: "setcolor", color: PlaceColorName): void;
  (e: "placepixel"): Promise<void>;
}>();

const changeColor = (e: MouseEvent, color: PlaceColorName) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("cc", color);
  emit("setcolor", color);
};

const placePixel = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  emit("placepixel");
};
</script>

<template>
  <div
    class="absolute w-11/12 flex flex-col justify-center items-center bottom-4 inset-x-0 m-auto pointer-events-auto"
  >
    <div class="bg-slate-300 flex items-center mb-4 p-2 shadow-lg rounded-lg">
      <div
        class="w-4 h-4 mr-2"
        :style="{
          backgroundColor: getBackgroundColorCSS(htmlColors[activeColor]),
        }"
      ></div>
      <button @click="placePixel" class="items-center">Place</button>
    </div>

    <div
      class="flex space-x-2 h-12 w-full bg-slate-300 px-2 rounded-lg shadow-lg"
    >
      <button
        v-for="color in colors"
        @click="(e) => changeColor(e, color)"
        :key="color"
        class="grow h-8 w-1/12 rounded-md border-black box-border"
        :style="{ backgroundColor: getBackgroundColorCSS(htmlColors[color]) }"
        :class="{ 'border-2': props.rgbaColor === color }"
      ></button>
    </div>
  </div>
</template>
