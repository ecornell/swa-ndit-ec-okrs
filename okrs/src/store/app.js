import {
    defineStore
} from 'pinia'
import {
    useDataStore
} from './data'

export const useAppStore = defineStore({
    id: 'app',
    state: () => ({
        selectedOKR: null,
        selectedTeam: null,
        selectedPeriod: "1",
        settings: ["filter-related"],
    }),
    getters: {},
    actions: {

        /**
         * @param {number} _id - Selected OKR ID
         * @param {boolean} refresh
         */
        setSelected(_id, refresh = false) {

            const dataStore = useDataStore();

            if (this.selectedOKR && this.selectedOKR.id == _id && !refresh) {
                this.resetSelected();
            } else {
                this.resetSelected();
                
                this.selectedOKR = dataStore.okrs.find(o => o.id == _id);
                this.selectedOKR.related = 0;

                dataStore.updateRelated(this.selectedOKR);
                
                //

                dataStore.updateOkrDisplayFlag(this.selectedOKR);
                

                dataStore.teams.forEach((team) => {
                    if (!dataStore.relatedTeams.includes(parseInt(team.id))) {
                        team.displayTeam = false;
                    }
                });

               // this.scrollToTeam(this.appStore.selectedOKR.teamId);
            }
        },
        
        resetSelected() {
            const dataStore = useDataStore();

            this.selectedOKR = null;
            this.refOKRsX = [];
            this.supOKRsX = [];

            dataStore.teams.forEach((team) => {
                team.displayTeam = true;
                team.displayOKRs = true;
            });
            dataStore.okrs.forEach((okr) => {
                okr.displayOKR = true;
                okr.related = null;
            });
        },

    }
})