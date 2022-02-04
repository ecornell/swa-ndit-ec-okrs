<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>NDIT ORKs</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-select
        v-model="selectedPeriod"
        :items="periods"
        dense
        auto-select-first
        label="Period"
        outlined
        single-line
        hint="Select a period"
        hide-details="true"
        style="width: 60px; margin-right: 10px"
      ></v-select>

      <v-autocomplete
        v-model="selectedTeam"
        :items="teams"
        item-text="Name"
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

      {{ message }}
    </v-app-bar>

    <v-main>
      <Chart />
      <ChartButtons />
    </v-main>

    <v-bottom-sheet
      v-model="sheet"
      inset
      hide-overlay
      persistent
      no-click-animation
    >
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
import Chart from "./components/Chart";
import ChartButtons from "./components/ChartButtons";

export default {
  name: "App",

  components: {
    Chart,
    ChartButtons,
  },

  created() {
    window.addEventListener("keydown", this.escapeListener);
  },

  destroyed() {
    window.removeEventListener("keydown", this.escapeListener);
  },

  data: () => ({
    message: "",
    teams: [],
    okrs: [],
    selected: "",
    selectedOKR: "",
    refOKRs: [],
    supOKRs: [],
    chart: null,
    chart_index: 0,
    chart_compact: 0,
    selectedTeam: [],
    periods: ["2022-Q1"],
    selectedPeriod: "2022-Q1",
    sheet: false,
  }),

  mounted() {
    global.App = document.getElementById("app").__vue__;
  },

  methods: {
    escapeListener(event) {
      if (event.key === "Escape") {
        this.message = "Escape has been pressed";
      }
    },
    setSelected: function (id) {
      this.selected = id;
      // console.log(this.okrs);
      // console.log(id);
      this.selectedOKR = this.okrs.find(({ ID }) => ID == id);
      console.log(this.selectedOKR);
      this.sheet = true; // Open detail sheet

      // Highlight the selected OKR in the chart
      const selectedElements = document.getElementsByClassName("okr-selected");
      while (selectedElements.length) {
        selectedElements[0].classList.remove("okr-selected");
      }
      var eSelectedOKR = document.getElementById("okr-" + id);
      eSelectedOKR.classList.add("okr-selected");
      console.log(eSelectedOKR);

      // Highlight reference OKRs in the chart
      const refElements = document.getElementsByClassName("okr-referenced");
      while (refElements.length) {
        refElements[0].classList.remove("okr-referenced");
      }
      if (this.selectedOKR.parentId) {
        var eRefOKR = document.getElementById(
          "okr-" + this.selectedOKR.parentId
        );
        eRefOKR.classList.add("okr-referenced");
        console.log(eRefOKR);
      }

      // Highlight supporting OKRs in the chart
      const supElements = document.getElementsByClassName("okr-supporting");
      console.log(supElements.length);
      while (supElements.length) {
        supElements[0].classList.remove("okr-supporting");
      }

      var supOKRs = this.okrs.filter(({ parentId }) => parentId == id);
      supOKRs.forEach((okr) => {
        var eSupOKR = document.getElementById("okr-" + okr.ID);
        eSupOKR.classList.add("okr-supporting");
      });


      //this.chart.render();
    },
  },

  watch: {
    selectedTeam: function (newValue) {
      console.log(newValue);
      this.chart.setExpanded(newValue).render();
      this.chart.setCentered(newValue).render();
      const attrs = this.chart.getChartState();
      const node = attrs.allNodes.filter(
        ({ data }) => attrs.nodeId(data) == newValue
      )[0];
      this.chart.fit({ animate: true, nodes: [node], scale: true });
      this.chart.render();
    },
  },
};
</script>
