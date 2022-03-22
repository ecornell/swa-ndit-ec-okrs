<template>
  <v-container class="table-container">
    <div class="table-main">
      <v-row dense class="blue-grey--text table-okr-header-row">
        <v-col cols="1" style="max-width: 100%"></v-col>
        <v-col
          cols="1"
          style="max-width: 100%"
          v-if="settings.includes('show-id')"
          >ID</v-col
        >
        <v-col cols="1" style="max-width: 100%">OKR#</v-col>
        <v-col cols="" style="max-width: 100%" class="text-center">Title</v-col>
        <v-col cols="1" style="max-width: 100%"
          ><span v-if="settings.includes('show-progress')">Progress/</span
          >Risk</v-col
        >
      </v-row>
      <TableList
        v-for="team in heirarchyTeams"
        v-bind:team="team"
        v-bind:okrs="okrs"
        v-bind:settings="settings"
        v-bind:key="team.id"
        :depth="1"
      ></TableList>
    </div>
  </v-container>
</template>

<script>
import TableList from "./TableList";
import { mapStores, mapState } from "pinia";
import { useDataStore } from "../store/data";

export default {
  props: ["okrs", "settings"],

  components: {
    TableList,
  },

  computed: {
    ...mapStores(useDataStore),
    ...mapState(useDataStore, ["teams"]),
  },

  data: () => ({
    heirarchyTeams: [],
  }),

  watch: {
    teams(val) {
      this.heirarchyTeams = this.listToTree(val);
    },
  },

  methods: {
    //
    okrsByTeam: function (teamId) {
      return this.okrs.filter((okr) => okr.teamId == teamId);
    },
    //
    listToTree(list) {
      let data = [...list];
      let ID_KEY = "id";
      let PARENT_KEY = "parentId";
      let CHILDREN_KEY = "children";

      let map = {}; // make cache
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
  mounted() {},
  created: function () {},
};
</script>

<style scoped>
.table-container {
  margin: 8px auto 500px auto;
}
.table-main {
  -webkit-box-shadow: 2px 5px 13px -5px #4c799f,
    -2px 47px 15px -5px rgba(0, 0, 0, 0);
  box-shadow: 2px 5px 13px -5px #4c799f, -2px 47px 15px -5px rgba(0, 0, 0, 0);
}
.table-okr-header-row {
  line-height: 0.8;
  font-weight: 300;
  font-size: 0.9em;
  background-color: #ffffff;
  padding: 4px 0px 4px 0;
  margin: 5px 0px -4px -3px;
}
</style>