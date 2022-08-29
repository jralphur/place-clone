<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { onMounted, onUnmounted, onUpdated, ref } from "vue";
import type { Point } from "../types";

const props = defineProps<{
  boardDimensions: Point;
  pan: Point;
}>();

const emit = defineEmits<{
  (e: "targetpos", point: Point): void;
}>();

const pan = ref<Point>({
  x: 0,
  y: 0,
});

const lossy = (v: number) => Math.floor(v / scale.value) * scale.value;

const zoom = ref(0.025);
const wrapper = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const scaleWrapper = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const scale = computed(() => 40 * zoom.value);

const clamp = (min: number, max: number, value: number): number => {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

const snapPixel = (pos: Point = pan.value) => {
  const cl = (v: number, d: number) =>
    clamp(-scale.value * d, scale.value * d - scale.value, v);
  const scaled = ({ x, y }: Point) => ({
    x: cl(lossy(x), props.boardDimensions.x),
    y: cl(lossy(y), props.boardDimensions.y),
  });

  pan.value = scaled(pos);
  // emit("targetpos", {
  //   x: props.boardDimensions.x / 2 - Math.floor(pan.value.x / scale.value),
  //   y: props.boardDimensions.y / 2 - Math.floor(pan.value.y / scale.value),
  // });
};

const magnitude = (vec: { x: number; y: number }) => {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
};

const scaleView = (event: WheelEvent) => {
  // TODO: https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
  // handle browser pinch and zoom`
  event.preventDefault();
  let z = zoom.value;
  if (event.deltaY < 0) {
    z += 0.01;
  } else {
    z -= 0.01;
  }

  z = Math.max(0.025, z);
  const delta = z - zoom.value;
  if (delta != 0) {
    const p = z / zoom.value;
    pan.value.y = pan.value.y * p;
    pan.value.x = pan.value.x * p;
    zoom.value = z;
  }

  snapPixel();
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
    const bound = scale.value * (props.boardDimensions.x / 2);

    let newx = clamp(-bound, bound, pan.value.x + screenX - lastPanPosition.x);

    let newy = clamp(-bound, bound, pan.value.y + screenY - lastPanPosition.y);

    const n = {
      x: newx,
      y: newy,
    };

    emit("targetpos", {
      x: props.boardDimensions.x / 2 - n.x / scale.value,
      y: props.boardDimensions.y / 2 - n.y / scale.value,
    });
    snapPixel(n);
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
  const step = 1 * scale.value;
  let t = { ...pan.value };
  const bound = (scale.value * props.boardDimensions.x) / 2;

  if (loggedKeys.has("ArrowUp") && pan.value.y < bound) {
    t.y = Math.min(bound, t.y + step);
    emit("targetpos", {
      ...props.pan,
      y: Math.min(props.boardDimensions.y / 2, props.pan.y + 1),
    });
  }

  if (loggedKeys.has("ArrowDown") && pan.value.y > -bound) {
    t.y = Math.max(-bound, t.y - step);
    emit("targetpos", {
      ...props.pan,
      y: Math.min(-(props.boardDimensions.y / 2), props.pan.y - 1),
    });
  }

  if (loggedKeys.has("ArrowRight") && pan.value.x > -bound) {
    t.x = Math.max(-bound, t.x - step);
    emit("targetpos", {
      ...props.pan,
      x: Math.min(-(props.boardDimensions.x / 2), props.pan.x - 1),
    });
  }

  if (loggedKeys.has("ArrowLeft") && pan.value.x < bound) {
    t.x = Math.max(bound, t.x + step);
    emit("targetpos", {
      ...props.pan,
      x: Math.min(props.boardDimensions.x / 2, props.pan.x + 1),
    });
  }

  pan.value = t;
  snapPixel();
};

const clickUp = () => {
  isMouseDown = false;
};

// center point is origin
const focusPixelOnClick = (event: MouseEvent) => {
  if (
    event.target &&
    (event.target as HTMLElement).id === "canvas" &&
    !isPanning
  ) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    pan.value = {
      x: -(
        event.clientX -
        rect.left -
        (props.boardDimensions.x * scale.value) / 2
      ),
      y: -(
        event.clientY -
        rect.top -
        (props.boardDimensions.y * scale.value) / 2
      ),
    };
    emit("targetpos", {
      x: Math.floor(props.boardDimensions.x / 2 - pan.value.x / scale.value),
      y: Math.floor(props.boardDimensions.y / 2 - pan.value.y / scale.value),
    });
  }
};

onMounted(() => {
  if (wrapper.value) {
    wrapper.value.focus();
  }

  // console.log("targetPos onMounted");
  // emit("targetpos", { x: props.boardDimensions.x, y: props.boardDimensions.y });
  document.addEventListener("resize", () => snapPixel(pan.value));
});

onUpdated(() => {
  if (wrapper.value) {
    wrapper.value.focus();
  }
});

onUnmounted(() => {
  document.removeEventListener("resize", () => snapPixel(pan.value));
});
</script>
<template>
  <div
    id="classwrapper"
    ref="wrapper"
    class="transform-center flex justify-center items-center"
    tabindex="0"
    @keydown="keyPan"
    @keyup="releaseKey"
    @mousedown="clickDown"
    @mouseup="clickUp"
    @mousemove="mousePan"
    @mouseleave="clickUp"
    @click="focusPixelOnClick"
    @wheel="scaleView"
  >
    <div
      class="relative"
      :style="{
        transform: `translate(${pan.x}px, ${pan.y}px)`,
      }"
      id="place-pan-wrapper"
      ref="scaleWrapper"
    >
      <div
        id="place-scale-wrapper"
        :style="{
          transform: `scale(${zoom})`,
        }"
      >
        <slot></slot>
      </div>
      <!-- <font-awesome-icon
        icon="fa-solid fa-compress"
        class="absolute top-0 left-0 w-px h-px origin-center text-black/30"
        :style="{
          transform: `translate(${props.boardDimensions.x / 2 - pan.x}px,
           ${props.boardDimensions.y / 2 - pan.y}px) 
           scale(${scale * 1.5})`,
        }"
      ></font-awesome-icon> -->
    </div>
  </div>
</template>

<style scoped></style>
