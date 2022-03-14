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
              {{ selectedOKR.category }} {{ selectedOKR.okrNumber }} -
              {{ selectedOKR.title }}
            </v-col>

            <v-col cols="3"
              ><span class="grey--text float-right"
                >{{ selectedOKR.id }}-{{ selectedOKR.okrId }}</span
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
              {{ selectedOKR.team }}
            </v-col>

            <v-col cols="2"><span class="grey--text">Progress</span></v-col>
            <v-col cols="4">
              {{ (selectedOKR.progress ? selectedOKR.progress : 0) * 100 }}%
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2"><span class="grey--text">Owner</span></v-col>
            <v-col cols="4">
              {{ selectedOKR.owner }}
            </v-col>
            <v-col cols="2"><span class="grey--text">Confidence</span></v-col>
            <v-col cols="4">
              {{ (selectedOKR.confidence ? selectedOKR.confidence : 0) * 100 }}%
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
              {{ selectedOKR.reference }}
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
      if (this.selectedOKR.coOwners) {
        if (this.selectedOKR.coOwners.length > 1) {
          return this.selectedOKR.coOwners.map((co) => co["LookupValue"]).join(
            ", "
          );
        } else {
          return this.selectedOKR.coOwners[0]["LookupValue"];
        }
      }
    },
    toggleDetails: function () {
      this.shown = !this.shown;
    },
    detailsVisible: function () {
      if (this.selectedOKR && this.selectedOKR.id) {
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