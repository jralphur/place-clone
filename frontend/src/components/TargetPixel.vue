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
    class="absolute top-0 left-0"
    :style="{
      height: `1px`,
      width: `1px`,
      transform: `scale(${props.scale})`,
      translate: `${props.translate.x}px ${props.translate.y}px`,
      backgroundColor: `${props.rgbaColor}`,
    }"
  ></div>
</template>
