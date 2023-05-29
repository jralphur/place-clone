<script setup lang="ts">
import type { Point } from "../types";

const props = defineProps<{
  scale: number;
  translate: Point;
  rgbaColor: string;
}>();
</script>
<template>
  <div
    id="targetPixel"
    class="absolute h-px w-px z-20"
    :style="{
      translate: `${props.translate.x}px ${props.translate.y}px`,
      backgroundColor: `${props.rgbaColor}`,
    }"
  ></div>
</template>
