<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import PlaceDisplay from "./PlaceDisplay.vue";
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
import { getBoard } from "../remote/backend/board";
import type PlaceBoard from "../types/PlaceBoard";
import { htmlColors } from "../types";
import { getBackgroundColorCSS } from "../utils/rgba";
const error = ref<Error | null>(null);
const criticalError = ref<Error | null>(null);

const activeColor = ref<PlaceColorName>("WHITE");
const isLoading = ref<boolean>(true);
const displayLogin = ref<boolean>(false);
// const canvas = ref<InstanceType<typeof HTMLCanvasElement> | null>(null);

const place = ref<PlaceBoard | null>(null);
const targetPos = ref<Point | null>(null);
const rgbaColor = ref<string>(
  getBackgroundColorCSS(htmlColors[activeColor.value])
);
watch(
  activeColor,
  () => (rgbaColor.value = getBackgroundColorCSS(htmlColors[activeColor.value]))
);

const setActiveColor = (color: PlaceColorName) => {
  console.log("setting color to", color);
  activeColor.value = color;
};

onMounted(async () => {
  try {
    isLoading.value = true;
    place.value = await getBoard();
    targetPos.value = {
      x: place.value.width() / 2,
      y: place.value.height() / 2,
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

const placePixel = async () => {
  // if (targetPos.value !== null) {
  //   await putTile({ point: targetPos.value, color: activeColor.value });
  // }
};

const setTargetPos = (point: Point) => {
  if (targetPos.value !== null && place.value !== null) {
    targetPos.value = {
      ...point,
    };
  }
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
      class="absolute h-screen w-screen bg-black/20"
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
      <div class="absolute inset-0">
        <PlaceDisplay
          :board-dimensions="{ x: place.width(), y: place.height() }"
          :rgba-color="rgbaColor"
          :target-pos="targetPos"
          :place="place"
          @set-pos="setTargetPos"
        />
      </div>
      <PlacePanel
        @setcolor="setActiveColor"
        @placepixel="placePixel"
        :activeColor="activeColor"
        :rgba-color="rgbaColor"
      />
      <!-- <div>{{ targetPos.x }} {{ targetPos.y }}</div> -->
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
