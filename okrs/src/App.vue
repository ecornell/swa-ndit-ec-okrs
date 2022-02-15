<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-subheader>Paremeters</v-subheader>

      <v-list subheader sinlge-line flat>
        <v-select
          v-model="selectedPeriod"
          :items="periods"
          dense
          auto-select-first
          label="OKR Period"
          item-text="Title"
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
          <v-btn block v-if="user" depressed @click="fullLogout">
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
        :items="teams"
        item-text="Title"
        item-value="id"
        dense
        auto-select-first
        label="Team"
        outlined
        hint="Select a team"
        hide-details="true"
      ></v-autocomplete>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <div v-if="error">
        {{ error }}
      </div>
      <template v-if="!user && !error">
        <Login v-if="!user && !error"/>
      </template>
      <template v-else>
        <template v-if="modeTable">
          <Table :okrs="okrs" :teams="teams" :settings="settings" />
        </template>
        <template v-else>
          <Chart v-if="!modeTable" />
          <ChartButtons v-if="!modeTable" />
        </template>
        <Details :selectedOKR="selectedOKR" :detailsVisible="detailsVisible" />
      </template>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import auth from "./services/auth";
import graph from "./services/graph";
import Login from "./components/Login";
import Chart from "./components/Chart";
import ChartButtons from "./components/ChartButtons";
import Details from "./components/Details";
import Table from "./components/Table";

export default {
  name: "App",

  components: {
    Login,
    Chart,
    ChartButtons,
    Details,
    Table,
  },

  created() {
    // Basic setup of MSAL helper with client id, or give up

    if (process.env.VUE_APP_CLIENT_ID) {
      auth.configure(process.env.VUE_APP_CLIENT_ID, this);
      // Restore any cached or saved local user
       this.user = auth.user();
       console.log(`configured ${auth.isConfigured()}`);
    } else {
      this.error = "VUE_APP_CLIENT_ID is not set";
    }
  },

  destroyed() {},

  data: () => ({
    // SP Data
    periods: [],
    teams: [],
    okrs: [],
    // Auth Data
    user: null,
    // UI Data
    drawer: null,
    settings: ["filter-related"],
    modeTable: true,
    selectedOKR: null,
    selectedTeam: [],
    selectedPeriod: "1",
    message: "",
    detailsVisible: false,
    // Highlighing
    highlightedTeams: [],
    refOKRs: [],
    refOKRsX: [],
    supOKRs: [],
    supOKRsX: [],
    // Chart Data
    chart: null,
    chart_index: 0,
    chart_compact: 0,
    // Any errors
    error: "",
  }),

  mounted() {
    global.App = document.getElementById("app").__vue__;
  },

  methods: {
    // Auth / Graph
    updateUser() {
      this.user = auth.user();
    },
    fullLogout() {
      this.user = null;
      this.teams = [];
      this.okrs = [];
      this.periods = [];
      auth.logout();
    },
    // OKRs
    async loadData() {
      const teamsListId = process.env.VUE_APP_SP_LIST_TEAMS_ID;
      this.teams = await graph.getList(
        teamsListId,
        "id,Title,ShortName,ParentLookupId"
      );

      this.teams = this.teams.sort((a, b) => {
        if (a.id == 1) {
          return -1;
        }
        if (b.id == 1) {
          return 1;
        }
        if (a.Title < b.Title) {
          return -1;
        }
        if (a.Title > b.Title) {
          return 1;
        }
        return 0;
      });

      const periodsListId = process.env.VUE_APP_SP_LIST_PERIODS_ID;
      this.periods = await graph.getList(
        periodsListId,
        "id,Title,StartDate,EndDate"
      );

      const okrsListId = process.env.VUE_APP_SP_LIST_OKRS_ID;
      this.okrs = await graph.getList(
        okrsListId,
        "id,Title,Category,_x0023_,OKR_x002d_ID,ORKType,OwnerLookupId,CoOwnersLookupId,Period0LookupId,TeamLookupId,Team,Period0,Owner,Co_x002d_Owners,Tags,Reference,ReferenceLookupId,Progress_x0025_,Confidence_x0020__x0025_",
        `fields/Period0LookupId eq '${this.selectedPeriod}'`
      );

      this.okrs.sort((a, b) => {
        return a["OKR_x002d_ID"] - b["OKR_x002d_ID"];
      });
    },

    setSelected: function (_id, refresh = false) {
      // console.log(`setSelected ${_id}`);
      // console.log(id + " " + this.selectedOKR["ID"]);

      // this.detailsVisible = true; // Open detail sheet

      if (this.selectedOKR && this.selectedOKR["id"] == _id && !refresh) {
        this.resetSelected();
      } else {
        this.resetSelected();
        // console.log(this.okrs);
        // console.log(id);

        this.selectedOKR = this.okrs.find(({ id }) => id == _id);
        // console.log("selectedOKR: " + this.selectedOKR);

        this.refOKRs = this.okrs.filter(
          ({ id }) => id == this.selectedOKR.ReferenceLookupId
        );
        this.refOKRsX = this.findRefOKRsX(this.refOKRs);
        // console.log("this.refOKRsX");
        // console.log(this.refOKRsX);

        //

        this.supOKRs = this.okrs.filter(
          ({ ReferenceLookupId }) => ReferenceLookupId == _id
        );
        this.supOKRsX = this.findSupOKRsX(this.supOKRs);
        // console.log("this.supOKRsX");
        // console.log(this.supOKRsX);

        // Identify the teams that are related to this OKR
        this.highlightedTeams = [];
        this.highlightedTeams.push(this.selectedOKR["TeamLookupId"]);
        this.refOKRs.forEach((o) => {
          if (!this.highlightedTeams.includes(o["TeamLookupId"])) {
            this.highlightedTeams.push(o["TeamLookupId"]);
          }
        });
        this.refOKRsX.forEach((x) => {
          if (!this.highlightedTeams.includes(x.okr["TeamLookupId"])) {
            this.highlightedTeams.push(x.okr["TeamLookupId"]);
          }
        });
        this.supOKRs.forEach((o) => {
          if (!this.highlightedTeams.includes(o["TeamLookupId"])) {
            this.highlightedTeams.push(o["TeamLookupId"]);
          }
        });
        this.supOKRsX.forEach((x) => {
          if (!this.highlightedTeams.includes(x.okr["TeamLookupId"])) {
            this.highlightedTeams.push(x.okr["TeamLookupId"]);
          }
        });
        let tempList = [...this.highlightedTeams];
        tempList.forEach((t) => {
          if (t) {
            let parentTeams = this._getParentTeams(t);
            parentTeams.forEach((p) => {
              if (!this.highlightedTeams.includes(p)) {
                this.highlightedTeams.push(p);
              }
            });
          }
        });

        //

        if (this.selectedOKR) {
          // loop thru all okr and set display state
          this.okrs.forEach((okr) => {
            if (okr["id"] == this.selectedOKR["id"]) {
              Vue.set(okr, "highlightClass", "okr-selected");
            } else if (
              this.refOKRs &&
              this.refOKRs.some((o) => o.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-referenced");
            } else if (
              this.refOKRsX &&
              this.refOKRsX.some((x) => x.okr.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-referenced-x");
            } else if (
              this.supOKRs &&
              this.supOKRs.some((o) => o.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-supporting");
            } else if (
              this.supOKRsX &&
              this.supOKRsX.some((x) => x.okr.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-supporting-x");
            } else {
              if (this.settings.includes("filter-related")) {
                Vue.set(okr, "highlightClass", "okr-hidden");
                Vue.set(okr, "shown", false);
              }
            }

            // show parent Obj if KR is shown
            if (
              okr.shown &&
              okr.Category == "KR" &&
              this.settings.includes("filter-related")
            ) {
              var parentObj = this.okrs.find(
                (o) =>
                  o["TeamLookupId"] == okr["TeamLookupId"] &&
                  o["_x0023_"] == okr["_x0023_"].toString().split(".")[0]
              );
              // console.log("Show parent:" + parentObj.id);
              if (parentObj) {
                Vue.set(okr, "shown", true);
                if (parentObj.highlightClass == "okr-hidden") {
                  Vue.set(parentObj, "highlightClass", "");
                }
              }
            }
          });
        }

        if (this.modeTable) {
          this.teams.forEach((team) => {
            if (!this.highlightedTeams.includes(team["id"])) {
              Vue.set(team, "displayClass", "table-ork-team-hidden");
            }
          });
          this.scrollToTeam(this.selectedOKR["TeamLookupId"]);
        } else {
          const { allNodes } = this.chart.getChartState();
          allNodes.forEach((d) => {
            if (this.highlightedTeams.includes(d.data.id)) {
              d.data._expanded = true;
              d.data._related = true;
            } else {
              d.data._expanded = false;
              d.data._related = false;
            }
          });
          this.chart.setCentered(this.selectedOKR["TeamLookupId"]);
          this.chart.render();
        }
      }
    },
    _getParentTeams: function (tId, parentTeams = []) {
      //console.log("_getParentTeams " + tId + " : " + parentTeams);
      let t = this.teams.filter(({ id }) => id == tId)[0];
      let pT = t["ParentLookupId"];
      if (pT && pT != 0 && pT != "") {
        parentTeams.push(pT);
        this._getParentTeams(pT, parentTeams);
      }
      return parentTeams;
    },
    resetSelected: function () {
      this.selectedOKR = "";
      this.refOKRs = [];
      this.supOKRs = [];

      if (this.modeTable) {
        this.teams.forEach((team) => {
          Vue.set(team, "displayClass", "");
        });
        this.okrs.forEach((okr) => {
          Vue.set(okr, "highlightClass", "");
          Vue.set(okr, "shown", true);
        });
      } else {
        const { allNodes } = this.chart.getChartState();
        allNodes.forEach((d) => {
          d.data._related = true;
        });
        this.chart.render();
      }
    },
    findSupOKRsX: function (list, depth = 0) {
      let supOKRsX = [];
      list.forEach((o) => {
        let x = this.okrs.filter(
          ({ ReferenceLookupId }) => ReferenceLookupId == o.id
        );
        if (x && x.length > 0) {
          x.forEach((io) => {
            supOKRsX = supOKRsX.concat([{ okr: io, depth: depth }]);
          });
          let children = this.findSupOKRsX(x, depth + 1);
          if (children && children.length > 0) {
            supOKRsX = supOKRsX.concat(children);
          }
        }
      });
      return supOKRsX;
    },
    findRefOKRsX: function (list, depth = 0) {
      let refOKRsX = [];
      list.forEach((o) => {
        let x = this.okrs.filter(({ id }) => id == o.ReferenceLookupId);
        if (x && x.length > 0) {
          x.forEach((io) => {
            refOKRsX = refOKRsX.concat({ okr: io, depth: depth });
          });
          let parent = this.findRefOKRsX(x, depth + 1);
          if (parent && parent.length > 0) {
            refOKRsX = refOKRsX.concat(parent);
          }
        }
      });
      return refOKRsX;
    },
    scrollToTeam: async function (team) {
      console.log("scrollToTeam " + team);
      await this.$nextTick();
      var element = document.getElementById("team-" + team);
      var top = element.offsetTop - 10;
      window.scrollTo(0, top);
    },
  },

  watch: {
    selectedTeam: function (newValue) {
      this.resetSelected();

      if (this.modeTable) {
        console.log("watch selectedTeam : " + newValue);
        this.scrollToTeam(newValue);
      } else {
        this.chart.setExpanded(newValue).render();
        this.chart.setCentered(newValue).render();
        const attrs = this.chart.getChartState();
        const node = attrs.allNodes.filter(
          ({ data }) => attrs.nodeId(data) == newValue
        )[0];
        this.chart.fit({ animate: true, nodes: [node], scale: true });
        this.chart.render();
      }
    },

    settings: function (newValue) {
      console.log("watch settings : " + newValue);

      if (newValue.includes("filter-related")) {
        if (this.modeTable) {
          if (this.selectedOKR) {
            this.setSelected(this.selectedOKR.id, true);
          }
        } else {
          const { allNodes } = this.chart.getChartState();
          allNodes.forEach((d) => {
            if (this.highlightedTeams.includes(d.data.id)) {
              d.data._expanded = true;
              d.data._related = true;
            } else {
              d.data._expanded = false;
              d.data._related = false;
            }
          });
        }
      } else {
        if (this.modeTable) {
          if (this.selectedOKR) {
            this.setSelected(this.selectedOKR.id, true);
          }
        } else {
          const { allNodes } = this.chart.getChartState();
          allNodes.forEach((d) => {
            d.data._related = true;
          });
          this.chart.render();
        }
      }
    },
    // selectedOKR: function (newValue) {
    //   // console.log("watch:selectedOKR - selected changed " + newValue);
    //   if (this.modeTable) {
    //     //
    //   } else {
    //     // if (newValue != "") {
    //     //   this.btnDetailsVisible = true;
    //     // } else {
    //     //   this.btnDetailsVisible = false;
    //     // }
    //   }
    // },
    user: function (newValue) {
      console.log("user changed " + newValue);
      if (newValue && newValue.size != 0) {
        this.loadData();
      }
    },
  },
};
</script>


