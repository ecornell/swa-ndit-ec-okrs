import {
    defineStore
} from 'pinia'
import {
    useAppStore
} from './app'
import graph from "../services/graph";

export const useDataStore = defineStore({
    id: 'data',
    state: () => ({
        /** @type {{ 
         * id: number, 
         * title: string,
         * shortName: string,
         * parentId: number,
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
        //
        relatedTeams: [],
        refOKRsX: [],
        supOKRsX: [],
    }),
    getters: {},
    actions: {

        async loadData() {
            this.loaded = false;
            await this.loadTeams();
            await this.loadPeriods();
            await this.loadOKRs(1);
            this.loaded = true;
        },

        async loadTeams() {

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

        ///

        updateRelated(selectedOKR) {

            this.refOKRsX = this.findRefOKRsX([selectedOKR]);
            this.supOKRsX = this.findSupOKRsX([selectedOKR]);

            // Identify the teams that are related to this OKR
            this.relatedTeams = [];
            this.addRelatedTeam(selectedOKR.teamId);

            this.refOKRsX.forEach((x) => {
                this.addRelatedTeam(x.okr.teamId);
            });

            this.supOKRsX.forEach((x) => {
                this.addRelatedTeam(x.okr.teamId);
            });

            let tempList = [...this.relatedTeams];
            tempList.forEach((t) => {
                if (t) {
                    let parentTeams = this.getParentTeams(t);
                    parentTeams.forEach((p) => {
                        this.addRelatedTeam(p);
                    });
                }
            });
        },


        updateOkrDisplayFlag(selectedOKR) {

            const appStore = useAppStore();

            if (selectedOKR) {
                // loop thru all okr and set display state
                this.okrs.forEach((okr) => {

                    okr.displayOKR = true;
                    
                    if (okr.id == selectedOKR.id) {
                        //
                    } else if (
                        this.refOKRsX &&
                        this.refOKRsX.some((x) => x.okr.id == okr.id)
                    ) {
                        //
                    } else if (
                        this.supOKRsX &&
                        this.supOKRsX.some((x) => x.okr.id == okr.id)
                    ) {
                        //
                    } else {
                        if (appStore.isFilterRelated) {
                            okr.displayOKR = false;
                        }
                    }

                    // show parent Obj if KR is shown
                    if (
                        okr.displayOKR &&
                        okr.category == "KR" &&
                        appStore.isFilterRelated
                    ) {
                        let parentObj = this.okrs.find(
                            (o) =>
                            o.teamId == okr.teamId &&
                            o.okrNumber == okr.okrNumber.toString().split(".")[0]
                        );
                        if (parentObj) {
                            okr.displayOKR = true;
                            if (parentObj.displayOKR == false) {
                                parentObj.displayOKR = true;
                            }
                        }
                    }
                });
            }
        },

        /**
         * @param {number} tId
         * @param {number[]} parentTeams
         */
        getParentTeams(tId, parentTeams = []) {
            let t = this.teams.filter(({
                id
            }) => id == tId)[0];
            let pT = t.parentId;
            if (pT && pT != 0 && pT != "") {
                parentTeams.push(pT);
                this.getParentTeams(pT, parentTeams);
            }
            return parentTeams;
        },
        addRelatedTeam(teamId) {
            let tId = parseInt(teamId);
            if (!this.relatedTeams.includes(tId)) {
                this.relatedTeams.push(tId);
            }
        },
        findSupOKRsX(list, depth = 1) {
            let supOKRsX = [];
            // If selected OKR is an Objective, find related child KRs
            if (depth == 1) {
                let okr = list[0];
                if (okr.category == "Obj") {
                    let childKRs = this.okrs.filter(
                        (o) =>
                        o.teamId == okr.teamId &&
                        o.okrNumber.toString().startsWith(okr.okrNumber + ".")
                    );
                    childKRs.forEach((io) => {
                        supOKRsX = supOKRsX.concat([{
                            okr: io,
                            depth: depth
                        }]);
                        io.related = depth;
                    });
                    list = list.concat(childKRs);
                    depth = 2;
                }
            }
            list.forEach((o) => {
                let x = this.okrs.filter(
                    ({
                        referenceId
                    }) => referenceId == o.id
                );
                if (x && x.length > 0) {
                    x.forEach((io) => {
                        supOKRsX = supOKRsX.concat([{
                            okr: io,
                            depth: depth
                        }]);
                        io.related = depth;
                    });
                    let children = this.findSupOKRsX(x, depth + 1);
                    if (children && children.length > 0) {
                        supOKRsX = supOKRsX.concat(children);
                    }
                }
            });
            return supOKRsX;
        },
        findRefOKRsX(list, depth = 1) {
            let refOKRsX = [];
            list.forEach((o) => {
                let x = this.okrs.filter(({
                    id
                }) => id == o.referenceId);
                if (x && x.length > 0) {
                    x.forEach((io) => {
                        refOKRsX = refOKRsX.concat({
                            okr: io,
                            depth: depth
                        });
                        io.related = -depth;
                    });
                    let parent = this.findRefOKRsX(x, depth + 1);
                    if (parent && parent.length > 0) {
                        refOKRsX = refOKRsX.concat(parent);
                    }
                }
            });
            return refOKRsX;
        },



    }
})