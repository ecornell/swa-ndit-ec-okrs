<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
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

          <v-list-item value="show-progress" dense>
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" color="primary"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Progress</v-list-item-title>
                <v-list-item-subtitle>Show Progress %</v-list-item-subtitle>
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

          <div class="text-center" style="color: grey; font-size: 0.7em">
            build:
            <a
              :href="`https://github.com/ndgov/swa-ndit-ec-okrs/commits/master`"
              target="_blank"
              >{{ appStore.getBuildHash }}</a
            >&nbsp;&nbsp;|&nbsp;&nbsp;<a
              :href="`https://github.com/ndgov/swa-ndit-ec-okrs/issues`"
              target="_blank"
              >issues</a
            >
          </div>
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

      <v-select
        v-model="appStore.selectedPeriodID"
        :items="dataStore.periods"
        dense
        auto-select-first
        label="OKR Period"
        item-text="title"
        item-value="id"
        outlined
        hint="Select a period"
        hide-details="false"
        style="margin: 0 4px 0 16px; max-width: 200px"
        @change="updateSelectedPeriod"
      ></v-select>

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
        style="margin: 0 12px 0 0"
      ></v-autocomplete>

      <v-spacer></v-spacer>

      <v-speed-dial
        v-model="fabDisplayOptions"
        direction="bottom"
        open-on-hover
        transition="slide-y-reverse-transition"
      >
        <template v-slot:activator>
          <v-btn v-model="fabDisplayOptions" fab x-small color="secondary">
            <v-icon v-if="fabDisplayOptions"> mdi-close </v-icon>
            <v-icon v-else> mdi-filter-variant </v-icon>
          </v-btn>
        </template>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              x-small
              color="secondary"
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
              color="secondary"
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
        <Table :okrs="dataStore.okrs" :settings="appStore.settings" />
        <Details
          :selectedOKR="appStore.selectedOKR"
          :detailsVisible="detailsVisible"
        />
        <!-- <v-overlay :value="!dataStore.loaded">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay> -->
      </template>
      <v-snackbar v-model="snackbar">
        {{ snackbarText }}
      </v-snackbar>
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
    // eslint-disable-next-line
    Details,
    // eslint-disable-next-line
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
    //
    this.appStore.loadState();
    this.appStore.resetSelected();
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
    snackbar: false,
    snackbarText: "",
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
      global.appInsights.trackEvent({
        name: "updateSelectedTeam",
        properties: {
          team: this.dataStore.teams.find((t) => t.id === newValue).title,
        },
      });

      this.dataStore.showAll();
      this.scrollToTeam(newValue);
    },
    updateSelectedPeriod(newValue) {
      global.appInsights.trackEvent({
        name: "updateSelectedPeriod",
        properties: {
          period: this.dataStore.periods.find((p) => p.id === newValue).title,
        },
      });

      this.appStore.resetSelected();
      this.appStore.selectedPeriod = this.dataStore.periods.find(
        (p) => p.id === newValue
      );
      this.dataStore.reloadOKRs();
      this.dataStore.showAll();
      this.scrollToTeam(1);

      localStorage.setItem(
        "selectedPeriod",
        JSON.stringify(this.appStore.selectedPeriod)
      );
      localStorage.setItem(
        "selectedPeriodID",
        JSON.stringify(this.appStore.selectedPeriodID)
      );
    },
    updateSnackar(text) {
      this.snackbarText = text;
      this.snackbar = true;
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
    selectedOKR: function (newValue) {
      if (newValue) {
        global.appInsights.trackEvent({
          name: "selectedOKR",
          properties: {
            okrId: `${newValue.id}-${newValue.okrId}`,
          },
        });
        this.scrollToTeam(newValue.teamId);
      }
    },    
  },
};
</script>

<style scoped>
.v-main {
  background-color: #e7edf8;
}
</style>