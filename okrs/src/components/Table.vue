<template>
  <div>
    <TableTree
      v-for="hItem in heirarchyItems"
      v-bind:item="hItem"
      v-bind:okrs="okrs"
      v-bind:key="hItem.id"
    ></TableTree>
  </div>
</template>

<script>
//import graph from "../services/graph";
// import Vue from "vue";
import TableTree from "./TableTree";

export default {
  props: ["okrs", "teams"],

  components: {
    TableTree,
  },

  data: () => ({
    error: "",
    data: [],
    heirarchyItems: [],
  }),

  watch: {
    //
    user: async function () {
      this.fetchGraphDetails();
    },
    teams (val, oldVal) {
      console.log("teams changed", val, oldVal);
      this.teams = val;
      this.heirarchyItems = this.listToTree(val);
    },
  },

  methods: {
    //
    async fetchGraphDetails() {
      if (!this.user) {
        return;
      }
      try {
        // this.graphPhoto = await graph.getPhoto();
        // const teamsListId ='a2968c6c-1a6a-4315-ae54-6197c6b6581a'
        // this.teams = await graph.getList(teamsListId, 'id,Title,ShortName,ParentLookupId');
        // console.log(this.teams);
      } catch (err) {
        this.error = err;
      }
    },
    okrsByTeam: function (teamId) {
      return this.okrs.filter((okr) => okr.TeamLookupId == teamId);
    },
    listToTree(list, options) {
      let data = [...list];

      console.log(data);
      options = options || {};
      var ID_KEY = options.idKey || "id";
      var PARENT_KEY = options.parentKey || "ParentLookupId";
      var CHILDREN_KEY = options.childrenKey || "Items";

      // var item, id, parentId;
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
    this.fetchGraphDetails();
    
  },
  created: function () {
    //this.heirarchyItems = this.listToTree(this.teams);
  },
};

// Vue.component("okr-tree", {
//   props: ["item", "okrs"],
//   template:`
//     <ul class="c-tree">
//       <li>{{item.Title}} {{item.id}} 
//       <div v-for="okr in okrsByTeam(item.id)" v-bind:key="okr.id">
//         {{ okr.Title }} {{ okr.id }}
//       </div>
//       <okr-tree v-for="y in item.Items" v-bind:item="y" v-bind:okrs="okrs"></okr-tree>
//       </li>
//     </ul>
//     `,
//     methods: {
//       okrsByTeam: function (teamId) {
//         return this.okrs.filter((okr) => okr.TeamLookupId == teamId);
//       },
//     },
// });
</script>

<style scoped>
</style>