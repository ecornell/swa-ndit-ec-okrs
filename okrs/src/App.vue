<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>NDIT OKRs</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-select
        v-model="selectedPeriod"
        :items="periods"
        dense
        auto-select-first
        label="Period"
        item-text="Title"
        item-value="id"
        outlined
        single-line
        hint="Select a period"
        hide-details="true"
        style="width: 60px; margin-right: 10px"
      ></v-select>

      <v-autocomplete
        v-model="selectedTeam"
        :items="teams"
        item-text="Title"
        item-value="id"
        dense
        auto-select-first
        label="Team"
        outlined
        single-line
        hint="Select a team"
        hide-details="true"
      ></v-autocomplete>

      <v-spacer></v-spacer>

      <v-checkbox
        v-model="cbRelated"
        :label="`Filter Related`"
        dense
        hide-details="true"
      ></v-checkbox>
      {{ message }}
      <v-spacer></v-spacer>
      <v-btn v-if="user" depressed @click="fullLogout">
        <span>Logout</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <div v-if="error">
        {{ error }}
      </div>

      <template v-if="!user && !error">
        <Login v-if="!user && !error" @loginComplete="updateUser" />
      </template>
      <template v-else>
        <Table v-if="modeTable" :okrs="okrs" :teams="teams" />
        <Chart v-if="!modeTable" />
        <ChartButtons v-if="!modeTable" />
        <ChartDetails v-if="!modeTable"/>
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
import ChartDetails from "./components/ChartDetails";
import Table from "./components/Table";

export default {
  name: "App",

  components: {
    Login,
    Chart,
    ChartButtons,
    ChartDetails,
    Table,
  },

  created() {
    // Basic setup of MSAL helper with client id, or give up
    if (process.env.VUE_APP_CLIENT_ID) {
      auth.configure(process.env.VUE_APP_CLIENT_ID, false);
      // Restore any cached or saved local user
      this.user = auth.user();
      console.log(`configured ${auth.isConfigured()}`);
    } else {
      this.error =
        "VUE_APP_CLIENT_ID is not set, the app will not function! 😥";
    }

    //

    //this.loadData();
  },

  destroyed() {},

  data: () => ({
    modeTable: true,
    user: {},
    accessToken: "",
    message: "",
    cbRelated: true,
    teams: [],
    okrs: [],
    selected: "",
    selectedOKR: [],
    refOKRs: [],
    refOKRsX: [],
    supOKRs: [],
    supOKRsX: [],
    chart: null,
    chart_index: 0,
    chart_compact: 0,
    selectedTeam: [],
    periods: [],
    selectedPeriod: "1",
    sheet: false,
    btnDetailsVisible: false,
    highlightedTeams: [],
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
      auth.logout();
      this.user = null;
      this.teams = [];
      this.okrs = [];
      this.periods = [];
    
    },
    // OKRs
    async loadData() {
      const teamsListId = process.env.VUE_APP_SP_LIST_TEAMS_ID;
      this.teams = await graph.getList(
        teamsListId,
        "id,Title,ShortName,ParentLookupId"
      );

      const periodsListId = process.env.VUE_APP_SP_LIST_PERIODS_ID;
      this.periods = await graph.getList(
        periodsListId,
        "id,Title,StartDate,EndDate"
      );

      const okrsListId = process.env.VUE_APP_SP_LIST_OKRS_ID;
      this.okrs = await graph.getList(
        okrsListId,
        "id,Title,Category,_x0023_,OKR_x002d_ID,ORKType,OwnerLookupId,CoOwnerLookupId,Period0LookupId,TeamLookupId,Team,Period0,Owner,CoOwner,Tags,ReferenceLookupId",
        `fields/Period0LookupId eq '${this.selectedPeriod}'`
      );

      this.okrs.sort((a, b) => {
        return a["OKR_x002d_ID"] - b["OKR_x002d_ID"];
      });
    },

    setSelected: function (_id) {
      // console.log(`setSelected ${_id}`);
      // console.log(id + " " + this.selectedOKR["ID"]);
      if (this.selectedOKR && this.selectedOKR["id"] == _id) {
        this.resetSelected();
      } else {
        this.resetSelected();
        // console.log(this.okrs);
        // console.log(id);
        // this.sheet = true; // Open detail sheet

        this.selectedOKR = this.okrs.find(({ id }) => id == _id);
        // console.log("selectedOKR: " + this.selectedOKR);

        this.refOKRs = this.okrs.filter(
          ({ id }) => id == this.selectedOKR.ReferenceLookupId
        );
        this.supOKRs = this.okrs.filter(
          ({ ReferenceLookupId }) => ReferenceLookupId == _id
        );

        // Identify the teams that are related to this OKR
        this.highlightedTeams = [];
        this.highlightedTeams.push(this.selectedOKR["TeamLookupId"]);
        this.refOKRs.forEach((o) => {
          if (!this.highlightedTeams.includes(o["TeamLookupId"])) {
            this.highlightedTeams.push(o["TeamLookupId"]);
          }
        });
        this.supOKRs.forEach((o) => {
          if (!this.highlightedTeams.includes(o["TeamLookupId"])) {
            this.highlightedTeams.push(o["TeamLookupId"]);
          }
        });
        let tempList = [...this.highlightedTeams];
        tempList.forEach((t) => {
          let parentTeams = this._getParentTeams(t);
          parentTeams.forEach((p) => {
            if (!this.highlightedTeams.includes(p)) {
              this.highlightedTeams.push(p);
            }
          });
        });

        //

        if (this.selectedOKR) {
          this.okrs.forEach((okr) => {
            if (okr["id"] == this.selectedOKR["id"]) {
              Vue.set(okr, "highlightClass", "okr-selected");
            } else if (
              this.refOKRs &&
              this.refOKRs.some((o) => o.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-referenced");
            } else if (
              this.supOKRs &&
              this.supOKRs.some((o) => o.id == okr["id"])
            ) {
              Vue.set(okr, "highlightClass", "okr-supporting");
            } else {
              if (this.cbRelated) {
                Vue.set(okr, "highlightClass", "okr-hidden");
                Vue.set(okr, "shown", false);
              }
            }

            // show parent Obj if KR is shown
            if (okr.shown && okr.Category == "KR" && this.cbRelated) {
              var parentObj = this.okrs.find(
                (o) =>
                  o["TeamLookupId"] == okr["TeamLookupId"] &&
                  o["_x0023_"] == okr["_x0023_"].toString().split(".")[0]
              );
              console.log("Show parent:" + parentObj.id);
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
  },

  watch: {
    selectedTeam: function (newValue) {
      this.resetSelected();

      if (this.modeTable) {
        console.log("watch selectedTeam : " + newValue);
        var element = document.getElementById("team-" + newValue);
        var top = element.offsetTop;
        window.scrollTo(0, top);
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
    cbRelated: function (newValue) {
      if (this.modeTable) {
        //
      } else {
        console.log(newValue);

        const { allNodes } = this.chart.getChartState();

        if (newValue) {
          allNodes.forEach((d) => {
            if (this.highlightedTeams.includes(d.data.id)) {
              d.data._expanded = true;
              d.data._related = true;
            } else {
              d.data._expanded = false;
              d.data._related = false;
            }
          });
        } else {
          allNodes.forEach((d) => {
            d.data._related = true;
          });
        }

        this.chart.render();
      }
    },
    selectedOKR: function (newValue) {
      // console.log("watch:selectedOKR - selected changed " + newValue);
      if (this.modeTable) {
        //
      } else {
        if (newValue != "") {
          this.btnDetailsVisible = true;
        } else {
          this.btnDetailsVisible = false;
        }
      }
    },
    user: function (newValue) {
      console.log("user changed " + newValue);
      if (newValue && newValue.size != 0) {
        this.loadData();
      }
    },
  },
};
</script>
