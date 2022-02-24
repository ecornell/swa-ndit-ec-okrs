import {
    defineStore
} from 'pinia'
import graph from "../services/graph";

export const useDataStore = defineStore({
    id: 'data',
    state: () => ({
        /** @type {{ 
         * id: number, 
         * title: string,
         * shortName: string,
         * parendId: number,
         * displayTeam: boolean,
         * displayOKRs: boolean,
         * }[]} */
        teams: [],
        /** @type {{
         * id: number,
         * title: string,
         * startDate: string,
         * endtDate: string,
         *  }[]} */
        periods: [],
        okrs: [],
    }),
    getters: {},
    actions: {

        async loadTeams() {
            console.log('loadTeams')

            const teamsListId = process.env.VUE_APP_SP_LIST_TEAMS_ID;
            let resp = await graph.getList(
                teamsListId,
                "id,Title,ShortName,ParentLookupId"
            );

            this.teams = resp.map(team => {
                let t = {}
                t.id = parseInt(team.id);
                t.parentId = parseInt(team.ParentLookupId);
                t.title = team.Title;
                t.shortName = team.ShortName;
                t.displayTeam = true;
                t.displayOKRs = true;
                return t;
            });

            this.teams = this.teams.sort((a, b) => {
                if (a.id == 1) {
                    return -1;
                }
                if (b.id == 1) {
                    return 1;
                }
                if (a.title < b.title) {
                    return -1;
                }
                if (a.title > b.title) {
                    return 1;
                }
                return 0;
            });

        },

        async loadPeriods() {
            console.log('loadPeriods')

            // Load Periods
            const periodsListId = process.env.VUE_APP_SP_LIST_PERIODS_ID;
             let resp = await graph.getList(
                periodsListId,
                "id,Title,StartDate,EndDate"
            );

            this.periods = resp.map(period => {               
                let p = {}
                p.id = parseInt(period.id);
                p.title = period.Title;
                p.startDate = period.StartDate;
                p.endDate = period.EndDate;
                return p;
            });
        }


    }
})