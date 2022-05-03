<template>
  <v-container style="margin: 30px 0 0 0">
    <v-card class="mx-auto" max-width="344" outlined elevation="2">
      <v-list-item three-line>
        <h1 class="title is-5">Please login to access the OKR information</h1>
      </v-list-item>
      <v-card-actions>
        <v-btn depressed color="primary" @click="doLogin"> Login </v-btn>
      </v-card-actions>
      <div v-if="error" class="notification is-warning mt-4">
        {{ error }}
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { mapStores } from "pinia";
import { useUserStore } from "../store/user";

export default {
  name: "OkrLogin",
  data: function () {
    return {
      error: "",
    };
  },

  computed: {
    ...mapStores(useUserStore),
  },

  methods: {
    doLogin() {
      try {
        this.userStore.login(true);
      } catch (err) {
        this.error = err.toString();
      }
    },
  },
};
</script>

<style scoped>
.centered {
  text-align: center;
}
</style>