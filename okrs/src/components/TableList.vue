<template>
  <div
    v-if="team.displayTeam"
    class="table-okr-section"
    :class="classSection()"
  >
    <v-row
      class="table-okr-team"
      :id="'team-' + team.id"
      dense
      @click="toggleTeam(team)"
    >
      <v-col cols="12">
        {{ displayTitle(team) }}
        <span style="float: right">
          <v-icon
            v-if="team.displayOKRs == false"
            dense
            color="grey lighten-1"
            x-small
            >mdi-arrow-expand-down</v-icon
          >
        </span>
      </v-col>
    </v-row>
    <div v-if="team.displayOKRs" :id="'team-okrs' + team.id">
      <v-row
        v-for="okr in okrsByTeam(team.id).filter((okr) => okr.displayOKR)"
        :key="okr['id']"
        v-on:click="selectedOKR(okr['id'])"
        dense
        class="table-okr-row"
        :class="classRow(okr)"
      >
        <v-col cols="1"
          ><v-icon dense color="#135790">
            {{ relatedIcon(okr) }}
          </v-icon></v-col
        >
        <v-col cols="1" v-if="settings.includes('show-id')">{{
          okr["id"]
        }}</v-col>
        <v-col cols="1" :class="classCategory(okr)"
          >{{ okr["category"] }} {{ okr["okrNumber"] }}</v-col
        >
        <v-col cols="" :class="classTitle(okr)">{{ okr["title"] }}</v-col>
        <v-col
          cols="1"
          class="text-right"
          style="flex: 0 0 100px; max-width: 100px"
          ><span v-if="settings.includes('show-progress')" style="color:#7d7d7d;font-size: .9em;">{{ displayProgress(okr) }}</span>&nbsp;
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                dense
                v-bind="attrs"
                v-on="on"
                :color="displayRiskIconColor(okr)"
              >
                {{ displayRiskIcon(okr) }}
              </v-icon>
            </template>
            <span>Risk Score&nbsp;&nbsp;: {{ okr["risk"] }}<br />
                  Progress&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{ okr["progress"] ?  Math.round(okr["progress"] * 100) : 0 }}%<br />
                  Confidence&nbsp;: {{ okr["confidence"] ?  Math.round(okr["confidence"] * 100) : 0 }}% </span>
          </v-tooltip>&nbsp;
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                dense
                v-bind="attrs"
                v-on="on"
                :color="displayRollupRiskIconColor(okr)"
              >
                {{ displayRollupRiskIcon(okr) }}
              </v-icon>
            </template>
            <span
              >Rollup Risk Score&nbsp;&nbsp;&nbsp;: {{ okr["rollupRisk"] }}<br />Children Total/KRs :
              {{ okr["supOKRs"] ? okr["supOKRs"].length : "" }}&nbsp;/&nbsp;{{ okr["numChildKRs"] }}
            </span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <TableList
      v-for="t in team.children"
      :team="t"
      :okrs="okrs"
      :settings="settings"
      :key="t['id']"
      :depth="depth + 1"
    ></TableList>
  </div>
</template>

<script>
import TableList from "./TableList";
import { mapStores } from "pinia";
import { useAppStore } from "../store/app";

export default {
  name: "TableList",
  props: ["team", "okrs", "settings", "depth"],
  components: {
    TableList,
  },
  computed: {
    ...mapStores(useAppStore),
  },

  data() {
    return {
      styleSection: {
        //marginLeft: this.depth * 10 + "px",
      },
      classCategory: (okr) => {
        return okr.category == "Obj" ? "table-okr-cat-obj" : "table-okr-cat-kr";
      },
      classTitle: (okr) => {
        return okr.category == "Obj"
          ? "table-okr-title-obj"
          : "table-okr-title-kr";
      },
      classSection: () => {
        let classSection = "table-okr-section-" + this.depth;
        if (this.depth > 1) {
          classSection += " table-okr-section-nth";
        }
        return classSection;
      },
      classRow: (okr) => {
        let classRow = null;
        if (okr.related == 0) {
          classRow += " table-okr-selected";
        }
        return classRow;
      },
    };
  },
  methods: {
    okrsByTeam: function (teamId) {
      let teamOKRs = this.okrs.filter((okr) => okr.teamId == teamId);
      teamOKRs.sort((a, b) => {
        return a.okrNumber - b.okrNumber;
      });
      return teamOKRs;
    },
    selectedOKR: function (event) {
      this.appStore.setSelected(event);
    },
    relatedIcon: function (okr) {
      let related = okr.related;
      if (related != null) {
        if (related == 0) {
          return "mdi-arrow-right";
        } else if (related == 1) {
          return "mdi-chevron-up";
        } else if (related == -1) {
          return "mdi-chevron-down";
        } else if (related == 2) {
          return "mdi-chevron-double-up";
        } else if (related == -2) {
          return "mdi-chevron-double-down";
        } else if (related > 2) {
          return "mdi-chevron-triple-up";
        } else {
          return "mdi-chevron-triple-down";
        }
      }
    },
    displayTitle: function (team) {
      if (this.depth == 1) {
        return team.title;
      } else {
        return ". ".repeat(this.depth - 1) + team.title;
      }
    },
    displayProgress: function (okr) {
      if (okr.progress == null) {
        return "";
      } else {
        if (okr.category == "KR") {
          let progress = okr.progress * 100;
          return progress.toFixed(0) + "%";
        }
      }
    },

    displayRiskIcon: function (okr) {
      let riskDisplayIcon = "";
      if (okr.risk == null) {
        return riskDisplayIcon;
      } else {
        let risk = okr.risk;
        if (risk < 33) {
          riskDisplayIcon = "mdi-check-circle-outline";
        } else if (risk < 66) {
          riskDisplayIcon = "mdi-alert-outline";
        } else {
          riskDisplayIcon = "mdi-alert-octagon-outline";
        }
        return riskDisplayIcon;
      }
    },
    displayRiskIconColor: function (okr) {
      let riskDisplayIconColor = "blue";
      if (okr.risk == null) {
        return riskDisplayIconColor;
      } else {
        let risk = okr.risk;
        if (risk < 33) {
          riskDisplayIconColor = "#6abe26";
        } else if (risk < 66) {
          riskDisplayIconColor = "#ffb017";
        } else {
          riskDisplayIconColor = "#ff1717";
        }
        return riskDisplayIconColor;
      }
    },
    displayRollupRiskIcon: function (okr) {
      let riskDisplayIcon = "mdi-chevron-down-box";
      if (okr.rollupRisk == null) {
        return riskDisplayIcon;
      } else {
        let risk = okr.rollupRisk;
        if (risk < 10) {
          riskDisplayIcon = "mdi-circle-outline";
        } else if (risk < 20) {
          riskDisplayIcon = "mdi-circle-slice-1";
        } else if (risk < 30) {
          riskDisplayIcon = "mdi-circle-slice-2";
        } else if (risk < 40) {
          riskDisplayIcon = "mdi-circle-slice-3";
        } else if (risk < 50) {
          riskDisplayIcon = "mdi-circle-slice-4";
        } else if (risk < 60) {
          riskDisplayIcon = "mdi-circle-slice-5";
        } else if (risk < 70) {
          riskDisplayIcon = "mdi-circle-slice-6";
        } else if (risk < 80) {
          riskDisplayIcon = "mdi-circle-slice-7";
        } else {
          riskDisplayIcon = "mdi-circle-slice-8";
        }
        return riskDisplayIcon;
      }
    },
    displayRollupRiskIconColor: function (okr) {
      let riskDisplayIconColor = "rgb(0 0 0 / 0%)";
      if (okr.rollupRisk == null) {
        return riskDisplayIconColor;
      } else {
        let risk = okr.rollupRisk;
        if (risk < 33) {
          riskDisplayIconColor = "#6abe26";
        } else if (risk < 66) {
          riskDisplayIconColor = "#ffb017";
        } else {
          riskDisplayIconColor = "#ff1717";
        }
        return riskDisplayIconColor;
      }
    },
    toggleTeam: function (team) {
      if (!global.App.selectedOKR) {
        team.displayOKRs = !team.displayOKRs;
        global.App.scrollToTeam(team["id"]);
      }
    },
  },
};
</script>

<style scoped>
.okr-hidden {
  display: none !important;
}
.table-okr-row {
  padding: 0 4px 0 0;
}
.table-okr-team {
  font-weight: 500;
  background-color: #f3f3f2;
  padding: 0 0 0 5px;
  margin: -4px -4px -4px -4px;
  color: #292928;
  /* line-height: 1.2; */
}
.table-okr-team:hover {
  background-color: #c1c1bf;
}
.table-ork-team-hidden {
  display: none;
}

.table-okr-selected {
  background-color: #e4ffe3;
}

.table-okr-cat-obj {
  font-weight: 500;
}
.table-okr-cat-kr {
  font-weight: 300;
  margin: 0 0 0 20px;
}

.table-okr-title-obj {
  font-weight: 500;
}
.table-okr-title-kr {
  font-weight: 300;
  margin: 0 0 0 20px;
}
.table-okr-row:hover {
  background-color: #fffec3;
}

.table-okr-section {
  border-top: #c0c0be 1px solid;
  /* border-bottom: #c0c0be 1px solid; */
  background-color: #fdfdff;
}
.table-okr-section-1 {
  margin: 4px 0 0 -4px;
  padding: 4px 4px 0 4px;
  border-left: #c6e1f7 3px solid;
}
.table-okr-section-nth {
  margin: 4px -3px 0 -3px;
  padding: 4px 3px 0 4px;
}
.table-okr-section-2 {
  border-left: #8cc2f0 3px solid;
}
.table-okr-section-3 {
  border-left: #53a4e8 3px solid;
}
.table-okr-section-4 {
  border-left: #1d85dd 3px solid;
}
.table-okr-section-5 {
  border-left: #1663a3 3px solid;
}
</style>