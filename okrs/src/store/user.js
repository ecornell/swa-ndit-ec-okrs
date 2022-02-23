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
            console.log('login')
            if (process.env.VUE_APP_CLIENT_ID) {
                auth.configure(process.env.VUE_APP_CLIENT_ID, this);
                // Restore any cached or saved local user
                let user = auth.user();
                console.log('user', user)
                if (user) {
                    this.name = user.name;
                    this.username = user.username;
                }
                console.log(`configured ${auth.isConfigured()}`);
              } else {
                this.error = "VUE_APP_CLIENT_ID is not set";
              }
        },
        logout() {
            console.log('logout')
            auth.logout();
        },
    } 
})