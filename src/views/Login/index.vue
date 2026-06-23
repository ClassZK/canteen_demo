<template>
  <div class="login-container">
    <Login></Login>
  </div>
</template>

<script lang="ts" setup>
import ICover from "./sub_modules/Cover.vue";
import ILogin from "./sub_modules/Login.vue";
import Login from "./login.vue";
</script>

<style lang="scss">
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: center;
}
</style>
