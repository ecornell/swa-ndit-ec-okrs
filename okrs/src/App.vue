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
      <v-btn depressed @click="fullLogout">
        <span>Logout</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <div v-if="error" class="notification is-danger is-4 title">
        {{ error }}
      </div>

      <Login v-if="!user && !error" @loginComplete="updateUser" />

      <!-- <div v-if="user && !error" class="columns is-multiline">
        <p><b>Name:</b> {{ user }}</p>
      </div> -->

      <Table v-if="modeTable" :okrs="okrs" :teams="teams" />

      <Chart v-if="!modeTable" />
      <ChartButtons v-if="!modeTable" />
    </v-main>

    <v-bottom-sheet
      v-model="sheet"
      inset
      hide-overlay
      persistent
      no-click-animation
    >
      <template v-slot:activator="{ on, attrs }">
        <v-row align="center" justify="space-around">
          <v-btn
            color="blue"
            dark
            v-bind="attrs"
            v-on="on"
            style="margin-top: -70px"
            v-if="btnDetailsVisible"
          >
            Details
          </v-btn>
        </v-row>
      </template>

      <v-sheet class="" height="100%">
        <v-container>
          <v-row dense>
            <v-col cols="8">
              {{ selectedOKR["Category"] }} {{ selectedOKR["#"] }} -
              {{ selectedOKR["Title"] }}
            </v-col>

            <v-col cols="3"
              ><span class="grey--text float-right"
                >{{ selectedOKR["ID"] }}-{{ selectedOKR["OKR-ID"] }}</span
              ></v-col
            >

            <v-col cols="1">
              <v-btn
                class="float-right"
                style="margin: -8px -8px 0 0"
                fab
                x-small
                color="grey"
                icon
                @click="sheet = !sheet"
              >
                <v-icon light> mdi-close </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-col cols="12"> </v-col>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Team</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Team.lookupValue"] }}
            </v-col>

            <v-col cols="2"><span class="grey--text">Confidence</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Confidence %"] }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Owner</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Owner.title"] }}
            </v-col>

            <v-col cols="2"><span class="grey--text">Progress</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Progress %"] }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Co-Owners</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Co-Owners.title"] }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Referenced</span></v-col>
            <v-col cols="10">
              {{ selectedOKR["Reference.lookupValue"] }}
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>
  </v-app>
</template>

<script>
import Vue from "vue";
import auth from "./services/auth";
import graph from "./services/graph";
import Login from "./components/Login";
import Chart from "./components/Chart";
import ChartButtons from "./components/ChartButtons";
import Table from "./components/Table";

export default {
  name: "App",

  components: {
    Login,
    Chart,
    ChartButtons,
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

    this.loadData();
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

      this.teams.forEach((team) => {
        Vue.set(team, "displayClass", "");
      });

      this.okrs.forEach((okr) => {
        Vue.set(okr, "highlightClass", "");
        Vue.set(okr, "shown", true);
      });

      if (this.selectedOKR && this.selectedOKR["id"] == _id) {
        this.resetSelected();
      } else {
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

            // var teamOkrs = thisokrs.filter((okr) => okr["TeamLookupId"] == d.data.id);
            // teamOkrs.sort((a, b) => {
            //   return a["#"] - b["#"];
            // });

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
        //
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
      if (this.modeTable) {
        //
      } else {
        this.resetSelected();
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
  },
};
</script>
