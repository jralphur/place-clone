<script setup lang="ts">
import { onMounted } from "vue";
import PlaceCore from "./components/PlaceCore.vue";
import token from "./remote/backend/token";

onMounted(() => {
  const t = window.localStorage.getItem("place_token");
  if (t !== null) {
    token.setToken(t);
  }
});
</script>

<template>
  <!-- <header>This is the header.</header> -->
  <PlaceCore />
  <!-- <footer>This is the footer.</footer> -->
</template>

<style></style>
