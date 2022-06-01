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
         * percentComplete: number,
         * current: boolean,
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
         * notes: string,
         * risk: number,
         * rollupRisk: number,
         * numChildKRs: number,
         * supOKRs: [],
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
            // load cached data
            if (localStorage.getItem('teams')) {
                try {
                    console.log('loading teams from local storage');
                    this.teams = JSON.parse(localStorage.getItem('teams'));
                    console.log(`loaded teams from local storage - ${this.teams.length}`);
                } catch (e) {
                    localStorage.removeItem('teams');
                }
            }
            if (localStorage.getItem('periods')) {
                try {
                    console.log('loading teams from local storage');
                    this.periods = JSON.parse(localStorage.getItem('periods'));
                    console.log(`loaded periods from local storage - ${this.periods.length}`);
                } catch (e) {
                    localStorage.removeItem('periods');
                }
            }
            if (localStorage.getItem('okrs')) {
                try {
                    console.log('loading okrs from local storage');
                    this.okrs = JSON.parse(localStorage.getItem('okrs'));
                    console.log(`loaded okrs from local storage - ${this.okrs.length}`);
                } catch (e) {
                    localStorage.removeItem('okrs');
                }
            }

            //

            if (this.okrs.length === 0) {
                this.refreshData();
            } else {
                setTimeout(() => {
                    global.App.updateSnackar("Refreshing data...");
                    this.refreshData();
                }, 5000);
            }
        },

        async refreshData() {
            console.log('refreshing data');

            this.loaded = false;
            await this.loadTeams();
            await this.loadPeriods();

            const appStore = useAppStore();
            if (!appStore.selectedPeriod) {
                const appStore = useAppStore();
                let currentPeriod = this.periods.find(p => p.current === true);
                appStore.selectedPeriodID = currentPeriod.id;
                appStore.selectedPeriod = currentPeriod;
            }

            await this.loadOKRs();
            this.loaded = true;
        },

        async reloadOKRs() {


            this.loaded = false;
            this.okrs = [];
            await this.loadOKRs();
            this.loaded = true;
        },

        async loadTeams() {

            global.App.updateSnackar("Refreshing data ... Teams");

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

            localStorage.setItem('teams', JSON.stringify(this.teams));

        },

        async loadPeriods() {

            global.App.updateSnackar("Refreshing data ... Periods");

            //const appStore = useAppStore();

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

                let startDate = new Date(period.StartDate);
                let endDate = new Date(period.EndDate);
                let today = new Date();

                p.percentComplete = Math.round((today - startDate) / (endDate - startDate) * 100);
                if (p.percentComplete > 100) {
                    p.percentComplete = 100;
                    p.current = false;
                } else if (p.percentComplete < 0) {
                    p.percentComplete = 0;
                    p.current = false;
                } else {
                    p.current = true;
                    // appStore.selectedPeriodID = p.id;
                    // appStore.selectedPeriod = p;
                }
                return p;
            });

            localStorage.setItem('periods', JSON.stringify(this.periods));

        },

        async loadOKRs() {

            global.App.updateSnackar("Refreshing data ... OKRs ... Fetching from SharePoint");

            console.log(`loading okrs`);

            const appStore = useAppStore();

            const okrsListId = process.env.VUE_APP_SP_LIST_OKRS_ID;
            let resp = await graph.getList(
                okrsListId,
                "id,Title,Category,_x0023_,OKR_x002d_ID,ORKType,OwnerLookupId,CoOwnersLookupId,Period0LookupId,TeamLookupId,Team,Period0,Owner,Co_x002d_Owners,Tags,Reference,ReferenceLookupId,Progress_x0025_,Confidence_x0020__x0025_,Notes",
                `fields/Period0LookupId eq '${appStore.selectedPeriodID}'`
            );

            let tempOkrs = resp.map(okr => {
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
                o.notes = okr.Notes;
                //
                o.displayOKR = true;
                o.related = null;
                return o;
            });

            global.App.updateSnackar("Refreshing data ... OKRs ... Calculating Progress");

            tempOkrs = this.calculateRisk(tempOkrs);

            tempOkrs.sort((a, b) => {
                return a.okrId - b.okrId;
            });

            tempOkrs.forEach((okr) => {
                okr.related = null;
            });

            this.okrs = tempOkrs;

            console.log(`Saving orks to local storage - ${this.okrs.length}`);
            localStorage.setItem('okrs', JSON.stringify(this.okrs));

        },

        ///

        updateRelated(selectedOKR) {

            this.refOKRsX = this.findRefOKRsX(this.okrs, [selectedOKR]);
            this.supOKRsX = this.findSupOKRsX(this.okrs, [selectedOKR]);

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

        showAll() {
            this.teams.forEach((t) => {
                t.displayTeam = true;
            });
            this.okrs.forEach((okr) => {
                okr.displayOKR = true;
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
        /**
         * 
         * @param {*} tempOkrs 
         * @param {*} list 
         * @param {*} depth - Depth of recursion - Default is 1
         * @returns supOKRsX[] - List of suppoorting OKRs
         */
        findSupOKRsX(tempOkrs, list, depth = 1) {
            let supOKRsX = [];
            // If selected OKR is an Objective, find related child KRs
            if (depth == 1) {
                let okr = list[0];
                if (okr.category == "Obj") {
                    let childKRs = tempOkrs.filter(
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
                let x = tempOkrs.filter(
                    ({
                        referenceId
                    }) => referenceId == o.id
                );
                if (x && x.length > 0) {
                    x.forEach((io) => {
                        let exists = supOKRsX.some((s) => s.okr.id == io.id)
                        if (!exists) {
                            supOKRsX = supOKRsX.concat([{
                                okr: io,
                                depth: depth
                            }]);
                            io.related = depth;
                        }
                    });
                    if (depth < 10) {
                        let children = this.findSupOKRsX(tempOkrs, x, depth + 1);
                        if (children && children.length > 0) {
                            supOKRsX = supOKRsX.concat(children);
                        }
                    } else {
                        console.warn(`depth limit reached - possible loop - ${list[0].id} - ${depth} - ${x.id}`);
                    }
                }
            });
            return supOKRsX;
        },

        findRefOKRsX(tempOkrs, list, depth = 1) {
            let refOKRsX = [];
            list.forEach((o) => {
                let x = tempOkrs.filter(({
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
                    let parent = this.findRefOKRsX(tempOkrs, x, depth + 1);
                    if (parent && parent.length > 0) {
                        refOKRsX = refOKRsX.concat(parent);
                    }
                }
            });
            return refOKRsX;
        },

        calculateRisk(tempOkrs) {

            const appStore = useAppStore();
            let periodPercentComplete = appStore.selectedPeriod.percentComplete

            tempOkrs.forEach(okr => {
                if (okr.category == "KR") {
                    let progress = okr.progress ? okr.progress : 0;
                    let progressDiff = parseInt(periodPercentComplete - (progress * 100));
                    if (progressDiff < 0) {
                        progressDiff = 0;
                    }
                    okr.risk = progressDiff;
                }
            });

            tempOkrs.forEach(okr => {

                let supOKRs = this.findSupOKRsX(tempOkrs, [okr]);
                okr.supOKRs = supOKRs;

                let totalRisk = 0;
                if (supOKRs && supOKRs.length > 0) {
                    let numChildKRs = 0;
                    supOKRs.forEach(o => {
                        totalRisk += o.okr.risk ? o.okr.risk : 0;
                        if (o.okr.category == "KR") {
                            numChildKRs = numChildKRs + 1;
                        }
                    });
                    okr.numChildKRs = numChildKRs;
                    okr.rollupRisk = numChildKRs > 0 ? Math.round(totalRisk / (numChildKRs)) : 100;

                }
                okr.related = null; // reset related flag
            });

            return tempOkrs;

        }
    }
})