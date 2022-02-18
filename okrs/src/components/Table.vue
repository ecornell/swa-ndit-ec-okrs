<template>
  <v-container class="table-container">
    <v-row dense class="blue-grey--text table-okr-header-row">
      <v-col cols="1" sytle="max-width: 100%;"></v-col>
      <v-col cols="1" sytle="max-width: 100%;" v-if="settings.includes('show-id')">ID</v-col>
      <v-col cols="1" sytle="max-width: 100%;">OKR#</v-col>
      <v-col cols=""  sytle="max-width: 100%;" class="text-center">Title</v-col>
      <v-col cols="1" sytle="max-width: 100%;">Progress</v-col>
    </v-row>
    <TableList
      v-for="team in heirarchyTeams"
      v-bind:team="team"
      v-bind:okrs="okrs"
      v-bind:settings="settings"
      v-bind:key="team.id"
      :depth="1"
    ></TableList>
  </v-container>
</template>

<script>
import TableList from "./TableList";

export default {
  props: ["okrs", "teams", "settings"],

  components: {
    TableList,
  },

  data: () => ({
    heirarchyTeams: [],
  }),

  watch: {
    //
    user: async function () {
      this.fetchGraphDetails();
    },
    teams(val, oldVal) {
      console.log("teams changed", val, oldVal);
      this.teams = val;
      this.heirarchyTeams = this.listToTree(val);
    },
  },

  methods: {
    //
    okrsByTeam: function (teamId) {
      return this.okrs.filter((okr) => okr.TeamLookupId == teamId);
    },
    //
    listToTree(list) {
      let data = [...list];
      // console.log(data);
      var ID_KEY = "id";
      var PARENT_KEY = "ParentLookupId";
      var CHILDREN_KEY = "Children";

      var map = {}; // make cache
      for (let i = 0; i < data.length; i++) {
        if (data[i][ID_KEY]) {
          map[data[i][ID_KEY]] = data[i];
          data[i][CHILDREN_KEY] = [];
        }
      }
      for (let i = 0; i < data.length; i++) {
        // is a child
        if (data[i][PARENT_KEY]) {
          // for dirty data
          if (map[data[i][PARENT_KEY]]) {
            map[data[i][PARENT_KEY]][CHILDREN_KEY].push(data[i]); // add child to parent
            data.splice(i, 1); // remove from root
            i--; // iterator correction
          } else {
            data[i][PARENT_KEY] = 0; // clean dirty data
          }
        }
      }
      return data;
    },
  },
  mounted() {
    console.log("Table - mounted");
  },
  created: function () {},
};
</script>

<style scoped>
.table-okr-header-row {
  line-height: 0.8;
  font-weight: 300;
  font-size: 0.9em;
}
</style>