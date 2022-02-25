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
        /** @type {{
         * id: number,
         * title: string,
         * category: string,
         * okrId: number,
         * okrNumber: number,
         * okrType: string,
         * ownerId: number,
         * coOwnerId: number,
         * periodId: number,
         * teamId: number,
         * team: string,
         * period: string,
         * owner: string,
         * coOwner: string,
         * tags: string[],
         * reference: string,
         * referenceId: number,
         * progress: number,
         * confidence: number,
         * displayOKR: boolean,
         * related: number,
         * }[]} */
        okrs: [],
        loaded: false,
    }),
    getters: {},
    actions: {

        async loadData() {
            console.log('loadData')
            this.loaded = false;
            await this.loadTeams();
            await this.loadPeriods();
            await this.loadOKRs(1);
            this.loaded = true;
        },

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
        },

        async loadOKRs(selectedPeriod) {
            console.log('loadOKRs')

            // Load OKRs
            const okrsListId = process.env.VUE_APP_SP_LIST_OKRS_ID;
            let resp = await graph.getList(
                okrsListId,
                "id,Title,Category,_x0023_,OKR_x002d_ID,ORKType,OwnerLookupId,CoOwnersLookupId,Period0LookupId,TeamLookupId,Team,Period0,Owner,Co_x002d_Owners,Tags,Reference,ReferenceLookupId,Progress_x0025_,Confidence_x0020__x0025_",
                `fields/Period0LookupId eq '${selectedPeriod}'`
            );

            this.okrs = resp.map(okr => {   
                let o = {}
                o.id = parseInt(okr.id);
                o.title = okr.Title;
                o.category = okr.Category;
                o.okrId = okr.OKR_x002d_ID;
                o.okrNumber = okr._x0023_;
                o.okrType = okr.ORKType;
                o.ownerId = okr.OwnerLookupId;
                o.coOwnersId = okr.CoOwnersLookupId;
                o.periodId = okr.Period0LookupId;
                o.teamId = okr.TeamLookupId;
                o.team = okr.Team;
                o.period = okr.Period0;
                o.owner = okr.Owner;
                o.coOwners = okr.Co_x002d_Owners;
                o.tags = okr.Tags;
                o.reference = okr.Reference;
                o.referenceId = okr.ReferenceLookupId;
                o.progress = okr.Progress_x0025_;
                o.confidence = okr.Confidence_x0020__x0025_;
                //
                o.displayOKR = true;
                o.related = null;
                return o;
            });

            this.okrs.sort((a, b) => {
                return a.okrId - b.okrId;
            });

        },

    }
})