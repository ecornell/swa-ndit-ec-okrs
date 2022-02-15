// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2021
// Licensed under the MIT License.
//
// Drop in MSAL.js 2.x service wrapper & helper for SPAs
//   v2.1.0 - Ben Coleman 2019
//   Updated 2021 - Switched to @azure/msal-browser
// ----------------------------------------------------------------------------

import * as msal from '@azure/msal-browser'

// MSAL object used for signing in users with MS identity platform
let msalApp

export default {
    //
    // Configure with clientId or empty string/null to set in "demo" mode
    //
    async configure(clientId, app = null) {
        // Can only call configure once
        if (msalApp) {
            return
        }

        // Can't configure if clientId blank/null/undefined
        if (!clientId) {
            return
        }

        const config = {
            auth: {
                clientId: clientId,
                redirectUri: window.location.origin,
                authority: 'https://login.microsoftonline.com/2dea0464-da51-4a88-bae2-b3db94bc0c54'
            },
            cache: {
                cacheLocation: 'localStorage'
            },
            // Only uncomment when you *really* need to debug what is going on in MSAL
            // system: {
            //     logger: new msal.Logger(
            //         (logLevel, msg) => {
            //             console.log(msg)
            //         }, {
            //             level: msal.LogLevel.Verbose
            //         }
            //     )
            // }
        }
        console.log('### Azure AD sign-in: enabled\n', config)

        // Create our shared/static MSAL app object
        msalApp = new msal.PublicClientApplication(config)

        function loginHandler(response) {
            console.log("loginHandler response:", response);
            // console.log("app", app);
            if (response !== null) {
                if (app) {
                    app.updateUser();
                }
            }
        }
        msalApp.handleRedirectPromise()
            .then(loginHandler)
            .catch((error) => {
                console.error(error);
            });
    },
    //
    // Return the configured client id
    //
    clientId() {
        if (!msalApp) {
            return null
        }

        return msalApp.config.auth.clientId
    },

    //
    // Login a user with a popup
    //
    login(scopes = ['user.read', 'openid', 'profile', 'email', 'Sites.ReadWrite.All']) {
        if (!msalApp) {
            return
        }

        // https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_browser.html#redirectrequest
        let loginRequest = {
            scopes,
            //prompt: 'select_account'
        }
        msalApp.loginRedirect(loginRequest);

    },

    //
    // Logout any stored user
    //
    logout() {
        if (!msalApp) {
            return
        }

        const logoutRequest = {
            // account: msalApp.getAccountByUsername(username),
            postLogoutRedirectUri: msalApp.config.auth.redirectUri,
        };

        msalApp.logoutRedirect(logoutRequest);
    },

    //
    // Call to get user, probably cached and stored locally by MSAL
    //
    user() {
        // console.log('### Getting user details', msalApp)
        if (!msalApp) {
            return null
        }
        const currentAccounts = msalApp.getAllAccounts()
        // console.log('### Current accounts', currentAccounts)
        if (!currentAccounts || currentAccounts.length === 0) {
            // No user signed in
            return null
        } else if (currentAccounts.length > 1) {
            return currentAccounts[0]
        } else {
            return currentAccounts[0]
        }
    },

    //
    // Call through to acquireTokenSilent or acquireTokenPopup
    //
    async acquireToken(scopes = ['user.read']) {
        console.log("### Acquiring token")
        if (!msalApp) {
            return null
        }

        // Set scopes for token request
        const accessTokenRequest = {
            scopes,
            account: this.user()
        }

        let tokenResp
        try {
            // 1. Try to acquire token silently
            tokenResp = await msalApp.acquireTokenSilent(accessTokenRequest)
            console.log('### MSAL acquireTokenSilent was successful')
        } catch (err) {
            console.log(err)
            // 2. Silent process might have failed so try via popup
            tokenResp = await msalApp.acquireTokenPopup(accessTokenRequest)
            console.log('### MSAL acquireTokenPopup was successful')
        }

        // Just in case check, probably never triggers
        if (!tokenResp.accessToken) {
            throw new Error("### accessToken not found in response, that's bad")
        }

        return tokenResp.accessToken
    },

    //
    // Clear any stored/cached user
    //
    clearLocal() {
        if (msalApp) {
            for (let entry of Object.entries(localStorage)) {
                let key = entry[0]
                if (key.includes('login.windows')) {
                    localStorage.removeItem(key)
                }
            }
        }
    },

    //
    // Check if we have been setup & configured
    //
    isConfigured() {
        return msalApp != null
    }

}