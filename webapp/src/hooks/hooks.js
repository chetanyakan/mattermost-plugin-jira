// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isDesktopApp, isMinimumDesktopAppVersion} from '../utils/user_agent';
import {openCreateModalWithoutPost, openChannelSettings, sendEphemeralPost} from '../actions';
import {isUserConnected, getInstalledInstanceType, isInstanceInstalled} from '../selectors';
import PluginId from 'plugin_id';

export default class Hooks {
    constructor(store) {
        this.store = store;
    }

    slashCommandWillBePostedHook = (message, contextArgs) => {
        if (message && (message.startsWith('/jira create ') || message === '/jira create')) {
            if (!isInstanceInstalled(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('There is no Jira instance installed. Please contact your system administrator.'));
                return Promise.resolve({});
            }
            if (!isUserConnected(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('Your Mattermost account is not connected to Jira. Please use `/jira connect` to connect your account, then try again.'));
                return Promise.resolve({});
            }
            const description = message.slice(12).trim();
            this.store.dispatch(openCreateModalWithoutPost(description, contextArgs.channel_id));
            return Promise.resolve({});
        }

        if (message && (message.startsWith('/jira connect') || message === '/jira connect')) {
            if (!isInstanceInstalled(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('There is no Jira instance installed. Please contact your system administrator.'));
                return Promise.resolve({});
            }
            if (isUserConnected(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('You already have a Jira account linked to your Mattermost account. Please use `/jira disconnect` to disconnect.'));
                return Promise.resolve({});
            }

            if (getInstalledInstanceType(this.store.getState()) === 'server' && isDesktopApp() && !isMinimumDesktopAppVersion(4, 3, 0)) { // eslint-disable-line no-magic-numbers
                const errMsg = 'The current version of your desktop app does not support connecting to Jira directly. Please connect through your browser or [see here](https://github.com/mattermost/mattermost-plugin-jira) for details on upgrading.';
                this.store.dispatch(sendEphemeralPost(errMsg));
                return Promise.resolve({});
            }

            window.open('/plugins/' + PluginId + '/user/connect', '_blank');
            return Promise.resolve({});
        }

        if (message && (message.startsWith('/jira subscribe ') || message === '/jira subscribe')) {
            if (!isInstanceInstalled(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('There is no Jira instance installed. Please contact your system administrator.'));
                return Promise.resolve({});
            }
            if (!isUserConnected(this.store.getState())) {
                this.store.dispatch(sendEphemeralPost('Your Mattermost account is not connected to Jira. Please use `/jira connect` to connect your account, then try again.'));
                return Promise.resolve({});
            }
            this.store.dispatch(openChannelSettings(contextArgs.channel_id));
            return Promise.resolve({});
        }

        return Promise.resolve({message, args: contextArgs});
    }
}
