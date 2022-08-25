<script setup lang="ts">
import { ref, watch } from "vue";
import type { LoginFormRequestData, RegisterFormRequestData } from "../types";
const props = defineProps<{
  handleLogin: (login: LoginFormRequestData) => Promise<void>;
  handleRegister: (register: RegisterFormRequestData) => Promise<void>;
}>();

const username = ref<string>("");
const password = ref<string>("");
const err = ref<Error | null>(null);
const isRegister = ref<boolean>(false);

watch(err, (e) => {
  if (e) {
    setTimeout(() => (err.value = null), 5000);
  }
});

const handleClick = async (event: MouseEvent) => {
  event.stopPropagation();
  try {
    if (isRegister.value) {
      await props.handleLogin({
        username: username.value,
        password: password.value,
      });
    } else {
      await props.handleRegister({
        username: username.value,
        password: password.value,
      });
    }

    username.value = "";
    password.value = "";
  } catch (e) {
    if (e instanceof Error) {
      err.value = e;
    }
  }
};
</script>

<template>
  <div
    class="bg-white w-72 p-4 text-sm rounded-lg space-y-4 font-bold"
    @click="(e) => e.stopPropagation()"
  >
    <div class="space-y-2">
      <label class="" for="username">Username</label>
      <input
        class="border w-full border-slate-300 ring-1 rounded-md h-6"
        v-model="username"
        id="username"
        type="text"
      />
    </div>

    <div class="space-y-2">
      <label class="" for="password">Password</label>
      <input
        class="w-full border border-slate-300 ring-1 rounded-md h-6"
        v-model="password"
        id="password"
        type="password"
      />
    </div>
    <div class="space-x-2">
      <input
        @click="() => (isRegister = !isRegister)"
        type="checkbox"
        id="register"
        v-model="isRegister"
      />
      <label for="register">Register</label>
    </div>
    <div
      class="flex justify-center p-2 bg-rose-900 rounded-lg text-white w-full"
    >
      <button type="submit" @click="handleClick">
        {{ isRegister ? "Register" : "Login" }}
      </button>
      <div v-if="err">
        {{ err.message }}
      </div>
    </div>
  </div>
</template>
