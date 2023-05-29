<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from "vue";
import type { Point } from "../types";
import type PlaceBoard from "../types/PlaceBoard";
import TargetPixel from "./TargetPixel.vue";

const props = defineProps<{
  boardDimensions: Point;
  place: PlaceBoard;
  targetPos: Point;
  rgbaColor: string;
}>();

const emit = defineEmits<{
  (e: "setPos", point: Point): void;
}>();

const cssPan = ref<Point>({
  x: 0,
  y: 0,
});

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 40;
const scale = ref(MIN_ZOOM);
const wrapper = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const scaleWrapper = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const panWrapper = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const canvas = ref<InstanceType<typeof HTMLCanvasElement> | null>(null);

const clamp = (min: number, max: number, value: number): number => {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

const magnitude = (vec: { x: number; y: number }) => {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
};

const scaleView = (target: number) => {
  const zoom = clamp(MIN_ZOOM, MAX_ZOOM, target);
  const delta = zoom - scale.value;

  if (delta != 0) {
    // calculate the offset needed
    // const offsetX = -(x * delta);
    // const offsetY = -(y * delta);

    // cssPan.value.x += offsetX;
    // cssPan.value.y += offsetY;

    // scale the board
    scale.value = target;
    panView(props.targetPos.x, props.targetPos.y);
  }
};

const panView = (x: number, y: number) => {
  cssPan.value = {
    x: (props.boardDimensions.x * scale.value) / 2 - x * scale.value,
    y: (props.boardDimensions.y * scale.value) / 2 - y * scale.value,
  };
};

const zoomEvent = (event: WheelEvent) => {
  // TODO: https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
  // handle browser pinch and zoom`
  event.preventDefault();
  if (canvas.value == null || scaleWrapper.value == null) {
    return;
  }

  const rect = scaleWrapper.value?.getBoundingClientRect();

  if (!rect) {
    return;
  }

  // center of canvas is the origin point, so
  // we'll need to translate the origin math from the top left to center
  // const x = event.clientX - scaleWrapper.value.offsetLeft;
  // const y = event.clientY - scaleWrapper.value.offsetTop;
  const sign = event.deltaY < 0 ? 1 : -1;
  const step = 0.2;
  scaleView(scale.value + sign * step);
};

// because of the flex rules placing the canvas at the center, we'll call the origin
// the center
let lastPanPosition = { x: 0, y: 0 };
let startPanPos = { x: 0, y: 0 };
let isMouseDown = false;
let isPanning = false;
const loggedKeys = new Set<string>();

const clickDown = (event: MouseEvent) => {
  isMouseDown = true;
  lastPanPosition = { x: event.screenX, y: event.screenY };
  startPanPos = { x: event.screenX, y: event.screenY };
};

const mousePan = (event: MouseEvent) => {
  event.preventDefault();
  const { screenX, screenY } = event;
  isPanning =
    isMouseDown &&
    magnitude({
      x: screenX - startPanPos.x,
      y: screenY - startPanPos.y,
    }) > scale.value;
  if (isPanning) {
    const newx = cssPan.value.x + screenX - lastPanPosition.x;
    const newy = cssPan.value.y + screenY - lastPanPosition.y;

    cssPan.value = { x: newx, y: newy };
    lastPanPosition = { x: screenX, y: screenY };
  }
};

const releaseKey = (event: KeyboardEvent) => {
  event.preventDefault();
  loggedKeys.delete(event.code);
};

const keyPan = (event: KeyboardEvent) => {
  // todo: add zoom support
  event.stopPropagation();
  loggedKeys.add(event.code);
  const prevStep = { ...cssPan.value };

  if (loggedKeys.has("ArrowUp")) {
    prevStep.y = prevStep.y - scale.value;
  }

  if (loggedKeys.has("ArrowDown")) {
    prevStep.y = prevStep.y + scale.value;
  }

  if (loggedKeys.has("ArrowRight")) {
    prevStep.x = prevStep.x + scale.value;
  }

  if (loggedKeys.has("ArrowLeft")) {
    prevStep.x = prevStep.x - scale.value;
  }

  cssPan.value = prevStep;
};

const clickUp = () => {
  isMouseDown = false;
  scaleWrapper.value?.focus();
};

// center point is origin

const focusPixelOnClick = (event: MouseEvent) => {
  if (
    event.target &&
    (event.target as HTMLElement).id === "canvas" &&
    !isPanning
  ) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    /*
     * targetPos: ((width / 2) - x, (height / 2) - y))
     */
    // select pixel
    emit("setPos", {
      x: Math.floor(x / scale.value),
      y: Math.floor(y / scale.value),
    });

    if (scale.value < 2) {
      scaleView(2.0);
    }

    panView(x, y);
  }
};

const draw = () => {
  if (canvas.value !== null) {
    const context = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    context.putImageData(props.place.board, 0, 0);
  }
};

// maybe do not need this
watch([canvas, scale], () => {
  draw();
});

onMounted(() => {
  scaleWrapper?.value?.focus();
  draw();
});

// maybe do not need this
onUpdated(() => {
  draw();
});
</script>

<template>
  <div
    id="classwrapper"
    ref="wrapper"
    class="h-full w-full flex items-center justify-center"
    @mousedown="clickDown"
    @mouseup="clickUp"
    @mouseleave="clickUp"
    @mousemove="mousePan"
  >
    <div
      :style="{
        translate: `${cssPan.x}px ${cssPan.y}px`,
        height: `${props.boardDimensions.y}px`,
        width: `${props.boardDimensions.x}px`,
      }"
      ref="panWrapper"
      @click="focusPixelOnClick"
      @keydown="keyPan"
      @keyup="releaseKey"
    >
      <div
        class="h-full w-full"
        :style="{
          transform: `scale(${scale})`,
          // translate: `${transformOrigin.x}px ${transformOrigin.y}px`,
        }"
        ref="scaleWrapper"
        @wheel="zoomEvent"
      >
        <TargetPixel
          :scale="scale"
          :translate="targetPos"
          :rgba-color="rgbaColor"
        />
        <canvas
          tabindex="0"
          class=""
          ref="canvas"
          id="canvas"
          :height="props.boardDimensions.x"
          :width="props.boardDimensions.y"
        ></canvas>
      </div>
    </div>
  </div>
</template>
