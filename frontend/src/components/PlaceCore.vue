<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import PlaceCamera from "./PlaceCamera.vue";
import LoginModal from "./LoginModal.vue";
import PlacePanel from "./PlacePanel.vue";
import type {
  LoginFormRequestData,
  PlaceColorName,
  Point,
  RegisterFormRequestData,
} from "../types";
import user from "../remote/backend/user";
import token from "../remote/backend/token";
import { getBoard, putTile } from "../remote/backend/board";
import type PlaceBoard from "../types/PlaceBoard";
import { fromInt32 } from "../types/RGBA";
import { htmlColors } from "../types";
const error = ref<Error | null>(null);
const criticalError = ref<Error | null>(null);

const activeColor = ref<PlaceColorName>("WHITE");
const isLoading = ref<boolean>(true);
const displayLogin = ref<boolean>(false);
const canvas = ref<InstanceType<typeof HTMLCanvasElement> | null>(null);

const place = ref<PlaceBoard | null>(null);
const targetPos = ref<Point | null>(null);

const setActiveColor = (color: PlaceColorName) => {
  console.log("setting color to", color);
  activeColor.value = color;
};

// const canvasClick = (event: MouseEvent) => {
//   // TODO: handle scale changes
//   if (canvas.value && place.value) {
//     console.log("canvas click");
//   }
// };

watch([canvas, place], () => {
  if (canvas.value && place.value) {
    const context = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    context.putImageData(place.value.board, 0, 0);
  }
});

onMounted(async () => {
  try {
    isLoading.value = true;
    place.value = await getBoard();
    targetPos.value = {
      x: place.value.width() / 2 - 1,
      y: place.value.height() / 2 - 1,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.log(e, e.name);
      criticalError.value = e;
    }
  } finally {
    isLoading.value = false;
  }
});

const openLogin = (event: MouseEvent) => {
  event.stopPropagation();
  console.log("openLog");
  displayLogin.value = true;
};

const closeLogin = (event: MouseEvent) => {
  event.stopPropagation();
  console.log("closeLogin");
  displayLogin.value = false;
};

const handleLogin = async (login: LoginFormRequestData) => {
  const r = await user.userLogin(login);
  token.setToken(r.token);
  window.localStorage.setItem("place_token", r.token);
  displayLogin.value = false;
};

const handleRegister = async (register: RegisterFormRequestData) => {
  const r = await user.userRegister(register);
  token.setToken(r.token);
  window.localStorage.setItem("place_token", r.token);
  displayLogin.value = false;
};

const placePixel = async (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("Placing tile at ", targetPos.value);
  // if (targetPos.value !== null) {
  //   await putTile({ point: targetPos.value, color: activeColor.value });
  // }
};

const getBackgroundColorCSS = (color: number): string => {
  const { red, green, blue, alpha } = fromInt32(color);
  return `rgba(${red},${green},${blue},${alpha})`;
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="criticalError">{{ criticalError.message }}</div>
  <div v-else-if="place && targetPos">
    <div v-if="error !== null" class="absolute top-0">{{ error.message }}</div>
    <div
      @click="closeLogin"
      v-if="displayLogin"
      class="absolute h-screen w-screen bg-black/20 flex items-center justify-center place-items-center"
    >
      <LoginModal
        :handle-login="handleLogin"
        :handle-register="handleRegister"
      />
    </div>
    <div
      class="absolute top-8 right-8 bg-slate-100 p-2 px-4 shadow-md rounded-md"
      @click="openLogin"
    >
      Login
    </div>
    <div class="bg-slate-300 overflow-clip h-screen w-screen">
      <PlaceCamera
        :board-dimensions="{ x: place.width(), y: place.height() }"
        :pan="targetPos"
        @targetpos="(p: Point) => (targetPos = p)"
      >
        <div class="scale40x">
          <canvas
            class=""
            ref="canvas"
            id="canvas"
            height="1000"
            width="1000"
          ></canvas>
        </div>
      </PlaceCamera>
      <div
        class="absolute w-11/12 flex flex-col justify-center items-center bottom-4 inset-x-0 ml-auto mr-auto pointer-events-auto"
      >
        <div
          class="bg-slate-300 flex items-center mb-4 p-2 shadow-lg rounded-lg"
        >
          <div
            class="w-4 h-4 mr-2"
            :style="{
              backgroundColor: getBackgroundColorCSS(htmlColors[activeColor]),
            }"
          ></div>
          <button @click="placePixel" class="items-center">Place</button>
        </div>
        <div class="w-full bg-slate-300 px-2 rounded-lg shadow-lg">
          <PlacePanel @setcolor="setActiveColor" :active-color="activeColor" />
        </div>
      </div>
    </div>
  </div>
  <div v-else>Not loaded</div>
</template>

<style scoped>
@import "../assets/base.css";

#canvas {
  image-rendering: pixelated;
}

.scale40x {
  transform: scale(40);
}
</style>
