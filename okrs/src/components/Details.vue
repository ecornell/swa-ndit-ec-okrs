 <template>
  <v-bottom-sheet
    v-model="detailsVisible"
    inset
    hide-overlay
    persistent
    no-click-animation
  >
    <template v-if="selectedOKR && selectedOKR != ''">
      <v-sheet v-if="!shown">
        <div class="text-center">
          <v-btn
            color="blue"
            dark
            class=""
            rounded
            small
            elevation="4"
            style="bottom: 0; position: absolute; margin: 0 0 10px -40px"
            @click="toggleDetails"
          >
            Details
          </v-btn>
        </div>
      </v-sheet>

      <v-sheet v-else class="" height="100%">
        <v-container>
          <v-row dense>
            <v-col cols="8">
              {{ selectedOKR["Category"] }} {{ selectedOKR["_x0023_"] }} -
              {{ selectedOKR["Title"] }}
            </v-col>

            <v-col cols="3"
              ><span class="grey--text float-right"
                >{{ selectedOKR["id"] }}-{{ selectedOKR["OKR_x002d_ID"] }}</span
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
                @click="toggleDetails"
              >
                <v-icon light> mdi-close </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-col cols="12"> </v-col>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Team</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Team"] }}
            </v-col>

            <v-col cols="2"><span class="grey--text">Confidence</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Confidence_x0020__x0025_"] }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Owner</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Owner"] }}
            </v-col>

            <v-col cols="2"><span class="grey--text">Progress</span></v-col>
            <v-col cols="4">
              {{ selectedOKR["Progress_x0025_"] }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Co-Owners</span></v-col>
            <v-col cols="4">
              {{ getCoOwners() }}
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Referenced</span></v-col>
            <v-col cols="10">
              {{ selectedOKR["Reference"] }}
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </template>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: "Details",

  props: ["selectedOKR"],

  data: () => ({
    shown: false,
    bottomSheet: false,
  }),

  methods: {
    getCoOwners: function () {
      if (this.selectedOKR["Co_x002d_Owners"]) {
        if (this.selectedOKR["Co_x002d_Owners"].length > 1) {
          let coOwners = "";
          this.selectedOKR["Co_x002d_Owners"].forEach((co) => {
            coOwners = coOwners + co["LookupValue"] + ",";
          });
          return coOwners;
        } else {
          return this.selectedOKR["Co_x002d_Owners"][0]["LookupValue"];
        }
      }
    },
    toggleDetails: function () {
      this.shown = !this.shown;
    },
    detailsVisible: function () {
      if (this.selectedOKR && this.selectedOKR["id"]) {
        return true;
      } else {
        return false;
      }
    },
  },

  watch: {},
};
</script>

<style>
</style>