 <template>
  <v-card id="create">
    <v-speed-dial
      v-model="fab"
      :top="top"
      :bottom="bottom"
      :right="right"
      :left="left"
      :direction="direction"
      :open-on-hover="hover"
      :transition="transition"
    >
      <template v-slot:activator>
        <v-btn v-model="fab" color="blue darken-2" dark fab small>
          <v-icon v-if="fab"> mdi-close </v-icon>
          <v-icon v-else> mdi-sitemap-outline </v-icon>
        </v-btn>
      </template>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="collapse"
          >
            <v-icon>mdi-chevron-double-down</v-icon>
          </v-btn>
        </template>
        <span>Collapse All</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="expand"
          >
            <v-icon>mdi-chevron-double-up</v-icon>
          </v-btn>
        </template>
        <span>Expand All</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="compact"
          >
            <v-icon>mdi-arrow-collapse-all</v-icon>
          </v-btn>
        </template>
        <span>Compact</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="swap"
          >
            <v-icon>mdi-repeat-variant</v-icon>
          </v-btn>
        </template>
        <span>Swap</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="fit"
          >
            <v-icon>mdi-fit-to-page-outline</v-icon>
          </v-btn>
        </template>
        <span>Fit</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            v-bind="attrs"
            v-on="on"
            v-on:click="fullscreen"
          >
            <v-icon>mdi-monitor-screenshot</v-icon>
          </v-btn>
        </template>
        <span>Fullscreen</span>
      </v-tooltip>
    </v-speed-dial>
  </v-card>
</template>

<script>
export default {
  name: "ChartButtons",

  data: () => ({
    direction: "top",
    fab: false,
    fling: false,
    hover: true,
    tabs: null,
    top: false,
    right: true,
    bottom: true,
    left: false,
    transition: "slide-y-reverse-transition",
  }),

  methods: {
    fit: function () {
      global.App.chart.fit();
    },
    swap: function () {
      global.App.chart
        .layout(["left", "top"][global.App.chart_index++ % 2])
        .render()
        .fit();
    },
    compact: function () {
      global.App.chart
        .compact(!!(global.App.chart_compact++ % 2))
        .render()
        .fit();
    },
    expand: function () {
      global.App.chart.expandAll().fit();
    },
    collapse: function () {
      global.App.chart.collapseAll().fit();
    },
    zoomIn: function () {
      global.App.chart.zoomIn();
    },
    zoomOut: function () {
      global.App.chart.zoomOut();
    },
    fullscreen: function () {
      global.App.chart.fullscreen("body");
    },
  },

  watch: {
    top(val) {
      this.bottom = !val;
    },
    right(val) {
      this.left = !val;
    },
    bottom(val) {
      this.top = !val;
    },
    left(val) {
      this.right = !val;
    },
  },
};
</script>

<style>
/* This is for documentation purposes and will not be needed in your application */
#create .v-speed-dial {
  position: absolute;
}

#create .v-btn--floating {
  position: relative;
}
</style>