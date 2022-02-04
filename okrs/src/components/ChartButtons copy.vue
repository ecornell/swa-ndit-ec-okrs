<!--
<template>
  <div class="action-buttons">
     <button onclick='chart.setExpanded("1").render()' class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-chevron-down"></i> Expand
    </button>
    <br />

    <button onclick='chart.setExpanded("1",false).render()' class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-chevron-up"></i> Collapse</button><br />

    <button
      onclick='chart.addNode({imageUrl:"https:\/\/raw.githubusercontent.com/bumbeishvili/Assets/master/Projects/D3/Organization%20Chart/cto.jpg",id:"root child",parentId:"O-6066",name:"test",progress:[25,20,15,10]})'
      class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-folder-plus"></i> Add Node
    </button>
    <br />

    <button onclick='chart.removeNode("O-6067")' class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-user-times"></i> remove</button><br />
-->
    <button
      onclick="App.chart.fit()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-sync"></i> fit
    </button>
    <br />

    <button
      onclick='App.chart.layout(["right","bottom","left","top"][App.chart_index++%4]).render().fit()'
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-retweet"></i> swap
    </button>
    <br />

    <button
      onclick="App.chart.compact(!!(App.chart_compact++%2)).render().fit()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-sitemap"></i> compact
    </button>
    <br />

    <!-- <button onclick="chart.setActiveNodeCentered(!!(actNdCent++%2)).render()"
      class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-border-none"></i> center Active
    </button>
    <br />

    <button onclick='chart.setCentered("2").render()' class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-compress-arrows-alt"></i> center
    </button>
    <br /> -->

    <!-- <button onclick='chart.setHighlighted("3").render()' class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-highlighter"></i> mark</button><br />
    <button onclick='chart.setUpToTheRootHighlighted("3").render().fit()'
      class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-route"></i> mark root
    </button>
    <br />
    <button onclick="chart.clearHighlighting()" class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-eraser"></i> clear mark
    </button>
    <br /> -->
    <button
      onclick="App.chart.fullscreen('body')"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-expand"></i> fullscreen</button
    ><br />

    <!-- <button onclick="chart.exportImg()" class="btn btn-action-button waves-effect waves-light">
      <i class="far fa-images"></i> export img
    </button>
    <br />

    <button onclick="chart.exportImg({full:true})" class="btn btn-action-button waves-effect waves-light">
      <i class="far fa-images"></i> export full img
    </button>
    <br /> -->
    <!-- 
    <button onclick="chart.exportSvg()" class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-file-download"></i> export svg
    </button> 

    <br /> -->
    <button
      onclick="App.chart.expandAll().fit()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-angle-double-down"></i> expand all</button
    ><br />

    <button
      onclick="App.chart.collapseAll().fit()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-angle-double-up"></i> collapse all</button
    ><br />

    <!--
    <button onclick="downloadPdf()" class="btn btn-action-button waves-effect waves-light">
      <i class="far fa-file-pdf"></i> export pdf
    </button>
    <br />

     <button onclick='chart.connections([{from:"O-6069",to:"O-6070",label:"Conflicts of interest"}]).render()'
      class="btn btn-action-button waves-effect waves-light">
      <i class="fas fa-project-diagram"></i> add link
    </button>
    <br /> -->

    <button
      onclick="App.chart.zoomOut()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-minus"></i> zoom out</button
    ><br />
    <button
      onclick="App.chart.zoomIn()"
      class="btn btn-action-button waves-effect waves-light"
    >
      <i class="fas fa-plus"></i> zoom in
    </button>
    <br />
  </div>
</template>
 

 <template>
  <v-card id="create">
    <v-container fluid>
      <v-row class="child-flex">
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <v-subheader>Options</v-subheader>
          <v-checkbox
            v-model="hover"
            label="Open on hover"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <v-subheader>FAB location</v-subheader>
          <v-checkbox
            v-model="top"
            label="Top"
            hide-details
          ></v-checkbox>
          <v-checkbox
            v-model="right"
            label="Right"
            hide-details
          ></v-checkbox>
          <v-checkbox
            v-model="bottom"
            label="Bottom"
            hide-details
          ></v-checkbox>
          <v-checkbox
            v-model="left"
            label="Left"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <v-subheader>Speed dial direction</v-subheader>
          <v-radio-group
            v-model="direction"
            hide-details
          >
            <v-radio
              value="top"
              label="Top"
            ></v-radio>
            <v-radio
              value="right"
              label="Right"
            ></v-radio>
            <v-radio
              value="bottom"
              label="Bottom"
            ></v-radio>
            <v-radio
              value="left"
              label="Left"
            ></v-radio>
          </v-radio-group>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <v-subheader>Transition</v-subheader>
          <v-radio-group
            v-model="transition"
            hide-details
          >
            <v-radio
              value="slide-y-transition"
              label="Slide y"
            ></v-radio>
            <v-radio
              value="slide-y-reverse-transition"
              label="Slide y reverse"
            ></v-radio>
            <v-radio
              value="slide-x-transition"
              label="Slide x"
            ></v-radio>
            <v-radio
              value="slide-x-reverse-transition"
              label="Slide x reverse"
            ></v-radio>
            <v-radio
              value="scale-transition"
              label="Scale"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-container>
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
        <v-btn
          v-model="fab"
          color="blue darken-2"
          dark
          fab
        >
          <v-icon v-if="fab">
            mdi-close
          </v-icon>
          <v-icon v-else>
            mdi-account-circle
          </v-icon>
        </v-btn>
      </template>
      <v-btn
        fab
        dark
        small
        color="green"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        fab
        dark
        small
        color="indigo"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        fab
        dark
        small
        color="red"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-card>
</template>