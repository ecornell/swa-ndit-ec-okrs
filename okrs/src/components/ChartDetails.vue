 <template>
  <v-bottom-sheet
    v-model="sheet"
    inset
    hide-overlay
    persistent
    no-click-animation
  >
    <template v-slot:activator="{ on, attrs }">
      <v-row align="center" justify="space-around">
        <v-btn
          color="blue"
          dark
          v-bind="attrs"
          v-on="on"
          style="margin-top: -70px"
          v-if="btnDetailsVisible"
        >
          Details
        </v-btn>
      </v-row>
    </template>

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
</template>

<script>
export default {
  name: "ChartDetails",

  data: () => ({}),

  methods: {},

  watch: {},
};
</script>

<style>
</style>