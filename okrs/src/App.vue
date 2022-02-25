<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-subheader>Parameters</v-subheader>

      <v-list subheader sinlge-line flat>
        <v-select
          v-model="selectedPeriod"
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
        <v-list-item-group v-model="settings" multiple>
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
        v-model="selectedTeam"
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
        <Table :okrs="dataStore.okrs" :settings="settings" />
        <Details :selectedOKR="selectedOKR" :detailsVisible="detailsVisible" />
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
    ...mapStores(useUserStore, useDataStore),
    ...mapState(useUserStore, ["name"]),
  },

  created() {
    window.addEventListener("scroll", this.handleScroll);
    this.userStore.login();
    // this.dataStore.loadTeams();
    // this.dataStore.loadPeriods();
    // this.dataStore.loadOKRs(1);
  },

  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  data: () => ({
    // UI Data
    drawer: null,
    settings: ["filter-related"],
    selectedOKR: null,
    selectedTeam: null,
    selectedPeriod: "1",
    message: "",
    detailsVisible: false,
    windowPosition: 0,
    fabDisplayOptions: false,
    // Related OKRs
    relatedTeams: [],
    refOKRsX: [],
    supOKRsX: [],
    // Any errors
    error: "",
  }),

  mounted() {
    global.App = document.getElementById("app").__vue__;
    document.title = "NDIT - OKRs";
    // if (this.userStore.name) {
    //   this.dataStore.loadData();
    // }
  },

  methods: {
    fullLogout() {
      this.userStore.logout();
    },

    setSelected(_id, refresh = false) {
      // console.log(`setSelected ${_id}`);
      // console.log(id + " " + this.selectedOKR["ID"]);

      if (this.selectedOKR && this.selectedOKR["id"] == _id && !refresh) {
        this.resetSelected();
      } else {
        this.resetSelected();
        // console.log(this.dataStore.okrs);
        // console.log(id);

        this.selectedOKR = this.dataStore.okrs.find(({ id }) => id == _id);
        this.selectedOKR.related = 0;
        // console.log("selectedOKR: " + this.selectedOKR);

        this.refOKRsX = this.findRefOKRsX([this.selectedOKR]);
        // console.log("this.refOKRsX");
        // console.log(this.refOKRsX);

        this.supOKRsX = this.findSupOKRsX([this.selectedOKR]);

        // console.log("this.supOKRsX");
        // console.log(this.supOKRsX);

        // Identify the teams that are related to this OKR
        this.relatedTeams = [];
        this.addRelatedTeam(this.selectedOKR.teamId);

        this.refOKRsX.forEach((x) => {
            this.addRelatedTeam(x.okr.teamId);
        });

        this.supOKRsX.forEach((x) => {
            this.addRelatedTeam(x.okr.teamId);
        });

        let tempList = [...this.relatedTeams];
        tempList.forEach((t) => {
          if (t) {
            let parentTeams = this._getParentTeams(t);
            parentTeams.forEach((p) => {
              this.addRelatedTeam(p);
            });
          }
        });

        //

        if (this.selectedOKR) {
          // loop thru all okr and set display state
          this.dataStore.okrs.forEach((okr) => {
            if (okr.id == this.selectedOKR.id) {
              //
            } else if (
              this.refOKRsX &&
              this.refOKRsX.some((x) => x.okr.id == okr.id)
            ) {
              //
            } else if (
              this.supOKRsX &&
              this.supOKRsX.some((x) => x.okr.id == okr.id)
            ) {
              //
            } else {
              if (this.settings.includes("filter-related")) {
                okr.displayOKR = false;
              }
            }

            // show parent Obj if KR is shown
            if (
              okr.displayOKR &&
              okr.Category == "KR" &&
              this.settings.includes("filter-related")
            ) {
              let parentObj = this.dataStore.okrs.find(
                (o) =>
                  o.teamId == okr.teamId &&
                  o.okrNumber == okr.okrNumber.toString().split(".")[0]
              );
              // console.log("Show parent:" + parentObj.id);
              if (parentObj) {
                okr.displayOKR = true;
                if (parentObj.displayOKR == false) {
                  parentObj.displayOKR = true;
                }
              }
            }
          });
        }

        this.dataStore.teams.forEach((team) => {
          if (!this.relatedTeams.includes(parseInt(team.id))) {
            team.displayTeam = false;
          }
        });

        this.scrollToTeam(this.selectedOKR.teamId);
      }
    },
    _getParentTeams(tId, parentTeams = []) {
      //console.log("_getParentTeams " + tId + " : " + parentTeams);
      let t = this.dataStore.teams.filter(({ id }) => id == tId)[0];
      let pT = t.parentId;
      if (pT && pT != 0 && pT != "") {
        parentTeams.push(pT);
        this._getParentTeams(pT, parentTeams);
      }
      return parentTeams;
    },
    addRelatedTeam(teamId) {
      let tId = parseInt(teamId);
      if (!this.relatedTeams.includes(tId)) {
        this.relatedTeams.push(tId);
      }
    },
    resetSelected() {
      this.selectedOKR = "";
      this.refOKRsX = [];
      this.supOKRsX = [];

      this.dataStore.teams.forEach((team) => {
        team.displayTeam = true;
        team.displayOKRs = true;
      });
      this.dataStore.okrs.forEach((okr) => {
        okr.displayOKR = true;
        okr.related = null;


        // if (okr.displayOKR == false) {
        //   //okr.displayOKR = true;
        //   Vue.set(okr, "displayOKR", true);
        // }
        // if (okr.related) {
        //   // okr.related = null;
        //   Vue.set(okr, "related", null);
        // }
      });
    },
    findSupOKRsX(list, depth = 1) {
      let supOKRsX = [];

      // If selected OKR is an Objective, find related child KRs
      if (depth == 1) {
        let okr = list[0];
        if (okr.category == "Obj") {
          let childKRs = this.dataStore.okrs.filter(
            (o) =>
              o.teamId == okr.teamId &&
              o.okrNumber.toString().startsWith(okr.okrNumber + ".")
          );
          childKRs.forEach((io) => {
            supOKRsX = supOKRsX.concat([{ okr: io, depth: depth }]);
            io.related = depth;
          });
          list = list.concat(childKRs);
          depth = 2;
        }
      }

      list.forEach((o) => {
        let x = this.dataStore.okrs.filter(
          ({ referenceId }) => referenceId == o.id
        );
        if (x && x.length > 0) {
          x.forEach((io) => {
            supOKRsX = supOKRsX.concat([{ okr: io, depth: depth }]);
            io.related = depth;
          });
          let children = this.findSupOKRsX(x, depth + 1);
          if (children && children.length > 0) {
            supOKRsX = supOKRsX.concat(children);
          }
        }
      });
      return supOKRsX;
    },
    findRefOKRsX(list, depth = 1) {
      let refOKRsX = [];
      list.forEach((o) => {
        let x = this.dataStore.okrs.filter(({ id }) => id == o.referenceId);
        if (x && x.length > 0) {
          x.forEach((io) => {
            refOKRsX = refOKRsX.concat({ okr: io, depth: depth });
            io.related = -depth;
          });
          let parent = this.findRefOKRsX(x, depth + 1);
          if (parent && parent.length > 0) {
            refOKRsX = refOKRsX.concat(parent);
          }
        }
      });
      return refOKRsX;
    },
    async scrollToTeam(team) {
      // console.log("scrollToTeam " + team);
      if (team) {
        await this.$nextTick();
        let element = document.getElementById("team-" + team);
        if(element) {
          this.windowPosition = element.offsetTop - 10;
          window.scrollTo(0, this.windowPosition);
        }
      }
    },
    updateSelectedTeam(newValue) {
      // console.log("updateSelectedTeam ", newValue);
      this.resetSelected();
      this.scrollToTeam(newValue);
    },
    handleScroll() {
      if (this.windowPosition != window.pageYOffset) {
        this.selectedTeam = null;
      }
    },
    collapseAll() {
      this.resetSelected();
      this.dataStore.teams.forEach((team) => {
        team.displayTeam = true;
        team.displayOKRs = false;
      });

      this.scrollToTeam(1);
    },
    expandAll() {
      this.resetSelected();
      this.dataStore.teams.forEach((team) => {
        team.displayTeam = true;
        team.displayOKRs = true;
      });
      this.scrollToTeam(1);
    },
  },

  watch: {
    settings: function (newValue) {
      console.log("watch settings : " + newValue);
      if (newValue.includes("filter-related")) {
        if (this.selectedOKR) {
          this.setSelected(this.selectedOKR.id, true);
        }
      } else {
        if (this.selectedOKR) {
          this.setSelected(this.selectedOKR.id, true);
        }
      }
    },
    name: function (newValue) {
      console.log("user changed " + newValue);
      if (newValue && newValue.size != 0) {
        // this.loadData();
        this.dataStore.loadData();
      }
    },
  },
};
</script>
