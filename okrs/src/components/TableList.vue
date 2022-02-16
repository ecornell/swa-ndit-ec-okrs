<template>
  <span>
    <v-row
      class="table-okr-team"
      v-bind:class="[team.displayClass]"
      ref="team-1"
      :id="'team-' + team.id"
      dense
    >
      <v-col cols="12">
        {{ displayTitle(team) }}
      </v-col>
    </v-row>
    <v-row
      v-for="okr in okrsByTeam(team.id)"
      :key="okr['id']"
      v-on:click="selectedOKR(okr['id'])"
      v-bind:class="[okr['classOkrRow']]"
      dense
      class="table-okr-row"
    >
      <v-col cols="1"
        ><v-icon dense color="blue darken-2">
          {{ relatedIcon(okr) }}
        </v-icon></v-col
      >
      <v-col cols="1" v-if="settings.includes('show-id')">{{
        okr["id"]
      }}</v-col>
      <v-col cols="1" :class="classCategory(okr)"
        >{{ okr["Category"] }} {{ okr["_x0023_"] }}</v-col
      >
      <v-col cols="" :class="classTitle(okr)">{{ okr["Title"] }}</v-col>
      <v-col cols="1" class="text-right">{{ displayProgress(okr) }}</v-col>
    </v-row>
    <TableTree
      v-for="t in team.Children"
      :team="t"
      :okrs="okrs"
      :settings="settings"
      :key="t['id']"
      :depth="depth + 1"
    ></TableTree>
  </span>
</template>

<script>
import TableTree from "./TableTree";

export default {
  name: "TableTree",
  props: ["team", "okrs", "settings", "depth"],
  components: {
    TableTree,
  },
  data() {
    return {
      styleSection: {
        //marginLeft: this.depth * 10 + "px",
      },
      classCategory: (okr) => {
        if (okr["Category"] == "Obj") {
          return "table-okr-cat-obj";
        } else {
          return "table-okr-cat-kr";
        }
      },
      classTitle: (okr) => {
        if (okr["Category"] == "Obj") {
          return "table-okr-title-obj";
        } else {
          return "table-okr-title-kr";
        }
      },
    };
  },
  methods: {
    okrsByTeam: function (teamId) {
      let teamOKRs = this.okrs.filter((okr) => okr.TeamLookupId == teamId);
      teamOKRs.sort((a, b) => {
        return a["_x0023_"] - b["_x0023_"];
      });
      return teamOKRs;
    },
    selectedOKR: function (event) {
      global.App.setSelected(event);
    },
    relatedIcon: function (okr) {
      let related = okr["related"];
      if (related != null) {
        if (related == 0) {
          return 'mdi-arrow-right';
        } else if (related == 1) {
          return 'mdi-chevron-up';
        } else if (related == -1){
          return 'mdi-chevron-down';
        } else if (related == 2) {
          return 'mdi-chevron-double-up';
        } else if (related == -2){
          return 'mdi-chevron-double-down';
        } else if (related > 2) {
          return 'mdi-chevron-triple-up';
        } else {
          return 'mdi-chevron-triple-down';
        }
      }
    },
    displayTitle: function (team) {
      if (this.depth == 1) {
        return team["Title"];
      } else {
        return (". ".repeat(this.depth - 1)) +  team["Title"];
      }
    },
    displayProgress: function (okr) {
      if (okr["Progress_x0025_"] == null) {
        return "";
      } else {
        let progress = okr["Progress_x0025_"] * 100;
        return progress.toFixed(0) + "%";
      }
    },    
  }
  };
</script>

<style scoped>
.table-okr-section {
  margin: 5px 0 0 6px;
  border-left: rgb(184, 181, 181) 2px solid;
}
.table-okr-container {
  /* margin: 5px 0 0 6px; */
  /* border-left: rgb(184, 181, 181) 2px solid; */
}
.table-okr-orks {
  margin: 0 0 0 10px;
}
.table-okr-team {
  font-weight: bold;
  background-color: #ebebeb;
  padding: 0 0 0 5px;
  color: #3e42bd;
}
.table-ork-team-hidden {
  display: none;
}

.table-okr-cat-obj {
  font-weight: 500;
  /* white-space: nowrap; */
  /* padding: 0 0 0 5px; */
}
.table-okr-cat-kr {
  font-weight: 300;
  margin: 0 0 0 20px;
  /* padding: 0 0 0 5px; */
}

.table-okr-title-obj {
  font-weight: 500;
  /* padding: 0 0 0 5px; */
}
.table-okr-title-kr {
  font-weight: 300;
  margin: 0 0 0 20px;
  /* padding: 0 0 0 5px; */
}
.table-okr-row:hover {
  background-color: #fffec3;
}
</style>