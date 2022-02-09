<template>
  <div class="table-okr-section">
    <div class="table-okr-team">{{ item.Title }}</div>
    <div class="table-okr-orks">
      <template v-for="okr in okrsByTeam(item.id)">
        <div
          v-if="okr.Category == 'Obj'"
          class="table-okr-obj"
          v-bind:key="okr.id"
        >
          {{ okr.Category }} {{ okr._x0023_ }} - {{ okr.Title }}
        </div>
        <div v-else class="table-okr-kr" v-bind:key="okr.id">
          {{ okr.Category }} {{ okr._x0023_ }} - {{ okr.Title }}
        </div>
      </template>
      </div>
      <TableTree
        v-for="y in item.Items"
        v-bind:item="y"
        v-bind:okrs="okrs"
        v-bind:key="y.id"
      ></TableTree>
    
  </div>
</template>

<script>
import TableTree from "./TableTree";

export default {
  name: "TableTree",
  props: ["item", "okrs"],
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
  },
};
</script>

<style scoped>
.table-okr-section {
  margin: 5px 0 0 6px;
  /* padding: 0 0 0 5px; */
  border-left: rgb(184, 181, 181) 2px solid;
}
.table-okr-team {
  font-weight: bold;
  background-color: rgb(236, 236, 255);
  padding: 0 0 0 5px;
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