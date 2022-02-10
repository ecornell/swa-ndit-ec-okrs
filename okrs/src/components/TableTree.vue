<template>
  <div class="table-okr-section">
    <div class="table-okr-team" v-bind:class="[team.displayClass]">{{ team.Title }}</div>
    <div class="table-okr-orks">
      <div
        v-for="okr in okrsByTeam(team.id)"
        v-bind:key="okr.id"
        v-on:click="selectedOKR(okr.id)"
        v-bind:class="[okr.highlightClass]"
      >
        <div v-if="okr.Category == 'Obj'" class="table-okr-obj">
          {{ okr.Category }} {{ okr._x0023_ }} - {{ okr.Title }}
        </div>
        <div v-else class="table-okr-kr" v-bind:key="okr.id">
          {{ okr.Category }} {{ okr._x0023_ }} - {{ okr.Title }}
        </div>
      </div>
    </div>
    <TableTree
      v-for="t in team.Children"
      v-bind:team="t"
      v-bind:okrs="okrs"
      v-bind:key="t.id"
    ></TableTree>
  </div>
</template>

<script>
import TableTree from "./TableTree";

export default {
  name: "TableTree",
  props: ["team", "okrs"],
  components: {
    TableTree,
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
  },
};
</script>

<style scoped>
.table-okr-section {
  margin: 5px 0 0 6px;
  border-left: rgb(184, 181, 181) 2px solid;
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

.table-okr-obj {
  font-weight: 500;
  padding: 0 0 0 5px;
}
.table-okr-kr {
  font-weight: 300;
  margin: 0 0 0 20px;
  padding: 0 0 0 5px;
}
</style>