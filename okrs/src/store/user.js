import {
    defineStore
} from 'pinia'
import auth from "../services/auth";

export const useUserStore = defineStore({
    // id is required so that Pinia can connect the store to the devtools
    id: 'user',
    state: () => ({
        name: '',
        username: '',
        error: '',
    }),
    getters: {},
    actions: {
        login() {
            if (process.env.VUE_APP_CLIENT_ID) {
                auth.configure(process.env.VUE_APP_CLIENT_ID, this);
                // Restore any cached or saved local user
                let user = auth.user();
                if (user) {
                    this.name = user.name;
                    this.username = user.username;
                }
              } else {
                this.error = "VUE_APP_CLIENT_ID is not set";
              }
        },
        logout() {
            auth.logout();
        },
    } 
})