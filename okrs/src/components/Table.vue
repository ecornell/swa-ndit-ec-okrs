<template>
  <v-container>
    <TableTree
      v-for="team in heirarchyTeams"
      v-bind:team="team"
      v-bind:okrs="okrs"
      v-bind:key="team.id"
    ></TableTree>
  </v-container>
</template>

<script>
import TableTree from "./TableTree";

export default {
  props: ["okrs", "teams"],

  components: {
    TableTree,
  },

  data: () => ({
    // error: "",
    // data: [],
    heirarchyTeams: [],
  }),

  watch: {
    //
    user: async function () {
      this.fetchGraphDetails();
    },
    teams (val, oldVal) {
      console.log("teams changed", val, oldVal);
      this.teams = val;
      this.heirarchyTeams = this.listToTree(val);
    },
  },

  methods: {
    //
    // async fetchGraphDetails() {
    //   if (!this.user) {
    //     return;
    //   }
    //   try {
    //     // this.graphPhoto = await graph.getPhoto();
    //     // const teamsListId ='a2968c6c-1a6a-4315-ae54-6197c6b6581a'
    //     // this.teams = await graph.getList(teamsListId, 'id,Title,ShortName,ParentLookupId');
    //     // console.log(this.teams);
    //   } catch (err) {
    //     this.error = err;
    //   }
    // },
    okrsByTeam: function (teamId) {
      return this.okrs.filter((okr) => okr.TeamLookupId == teamId);
    },
    listToTree(list) {
      let data = [...list];
      // console.log(data);
      var ID_KEY = "id";
      var PARENT_KEY =  "ParentLookupId";
      var CHILDREN_KEY =  "Children";

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
    //this.fetchGraphDetails();
    
  },
  created: function () {
    //this.heirarchyItems = this.listToTree(this.teams);
  },
};

</script>

<style scoped>
</style>