<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-subheader>Parameters</v-subheader>

      <v-list subheader sinlge-line flat>
        <v-select
          v-model="appStore.selectedPeriod"
          :items="dataStore.periods"
          dense
          auto-select-first
          label="OKR Period"
          item-text="title"
          item-value="id"
          outlined
          hint="Select a period"
          hide-details="false"
          style="margin: 8px 4px 0 8px"
        ></v-select>
      </v-list>

      <v-subheader>Filters</v-subheader>

      <v-list subheader sinlge-line flat>
        <v-list-item-group v-model="appStore.settings" multiple>
          <v-list-item value="filter-related" dense>
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" color="primary"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>Filter Related</v-list-item-title>
                <v-list-item-subtitle
                  >Only show related OKRs</v-list-item-subtitle
                >
              </v-list-item-content>
            </template>
          </v-list-item>

          <v-subheader>Display Settings</v-subheader>

          <v-list-item value="show-id" dense>
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" color="primary"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>ID</v-list-item-title>
                <v-list-item-subtitle>Show OKR ID</v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block v-if="userStore.name" depressed @click="fullLogout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="primary"
      dark
      dense
      style="height: 52px; padding-top: 2px"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="d-none d-sm-block">NDIT OKRs</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-autocomplete
        v-model="appStore.selectedTeam"
        :items="dataStore.teams"
        item-text="title"
        item-value="id"
        dense
        auto-select-first
        label="Team"
        outlined
        hint="Select a team"
        hide-details="true"
        @change="updateSelectedTeam"
      ></v-autocomplete>

      <v-spacer></v-spacer>

      <v-speed-dial
        v-model="fabDisplayOptions"
        direction="bottom"
        open-on-hover
        transition="slide-y-reverse-transition"
      >
        <template v-slot:activator>
          <v-btn v-model="fabDisplayOptions" fab x-small color="blue">
            <v-icon v-if="fabDisplayOptions"> mdi-close </v-icon>
            <v-icon v-else> mdi-filter-variant </v-icon>
          </v-btn>
        </template>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              x-small
              color="indigo"
              v-bind="attrs"
              v-on="on"
              v-on:click="collapseAll()"
            >
              <v-icon>mdi-chevron-double-up</v-icon>
            </v-btn>
          </template>
          <span>Collapse All</span>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              x-small
              color="indigo"
              v-bind="attrs"
              v-on="on"
              v-on:click="expandAll()"
            >
              <v-icon>mdi-chevron-double-down</v-icon>
            </v-btn>
          </template>
          <span>Expand All</span>
        </v-tooltip>
      </v-speed-dial>
    </v-app-bar>

    <v-main>
      <div v-if="error">
        {{ error }}
      </div>
      <template v-if="!userStore.name && !error">
        <Login v-if="!userStore.name && !error" />
      </template>
      <template v-else>
        <v-overlay :value="!dataStore.loaded">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <Table :okrs="dataStore.okrs" :settings="appStore.settings" />
        <Details :selectedOKR="appStore.selectedOKR" :detailsVisible="detailsVisible" />
      </template>
    </v-main>
  </v-app>
</template>

<script>
// import Vue from "vue";
import Login from "./components/Login";
import Details from "./components/Details";
import Table from "./components/Table";
import { mapStores, mapState } from "pinia";
import { useAppStore } from "./store/app";
import { useUserStore } from "./store/user";
import { useDataStore } from "./store/data";

export default {
  name: "App",

  components: {
    Login,
    Details,
    Table,
  },

  computed: {
    ...mapStores(useAppStore, useUserStore, useDataStore),
    ...mapState(useUserStore, ["name"]),
    ...mapState(useAppStore, ["selectedOKR", "settings"]),
  },

  created() {
    window.addEventListener("scroll", this.handleScroll);
    this.userStore.login();
    this.dataStore.loadData();
  },

  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  data: () => ({
    drawer: null,
    message: "",
    detailsVisible: false,
    windowPosition: 0,
    fabDisplayOptions: false,
    error: "",
  }),

  mounted() {
    global.App = document.getElementById("app").__vue__;
    document.title = "NDIT - OKRs";
  },

  methods: {
    fullLogout() {
      this.userStore.logout();
    },
   
    async scrollToTeam(team) {
      if (team) {
        await this.$nextTick();
        let element = document.getElementById("team-" + team);
        if (element) {
          this.windowPosition = element.offsetTop - 10;
          window.scrollTo(0, this.windowPosition);
        }
      }
    },
    updateSelectedTeam(newValue) {
      this.appStore.resetSelected();
      this.scrollToTeam(newValue);
    },
    handleScroll() {
      if (this.windowPosition != window.pageYOffset) {
        this.appStore.selectedTeam = null;
      }
    },
    collapseAll() {
      this.appStore.resetSelected();
      this.dataStore.teams.forEach((team) => {
        team.displayTeam = true;
        team.displayOKRs = false;
      });
      this.scrollToTeam(1);
    },
    expandAll() {
      this.appStore.resetSelected();
      this.dataStore.teams.forEach((team) => {
        team.displayTeam = true;
        team.displayOKRs = true;
      });
      this.scrollToTeam(1);
    },
  },

  watch: {
    settings: function (newValue) {
      if (newValue.includes("filter-related")) {
        if (this.appStore.selectedOKR) {
          this.appStore.setSelected(this.appStore.selectedOKR.id, true);
        }
      } else {
        if (this.appStore.selectedOKR) {
          this.appStore.setSelected(this.appStore.selectedOKR.id, true);
        }
      }
    },
    name: function (newValue) {
      if (newValue && newValue.size != 0) {
        this.dataStore.loadData();
      }
    },
    selectedOKR: function(newValue) {
      if (newValue) {
        this.scrollToTeam(newValue.teamId);
      }
    },
  },
};
</script>
