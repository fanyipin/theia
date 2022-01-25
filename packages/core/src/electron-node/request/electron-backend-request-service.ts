/********************************************************************************
 * Copyright (C) 2022 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import 'reflect-metadata';
import { injectable } from 'inversify';
import { BackendRequestService } from '../../node/request/backend-request-service';
import * as electron from '../../../shared/electron';

@injectable()
export class ElectronBackendRequestService extends BackendRequestService {

    async getProxyUrl(url: string): Promise<string | undefined> {
        if (this.proxyUrl) {
            return this.proxyUrl;
        }
        try {
            const proxy = await this.resolveProxy(url);
            if (proxy && proxy !== 'DIRECT') {
                const proxyHost = proxy.split(' ')[1];
                return this.buildProxyUrl(url, proxyHost);
            }
        } catch (e) {
            console.error('Could not resolve electron proxy.', e);
        }
        return super.getProxyUrl(url);
    }

    async resolveProxy(url: string): Promise<string | undefined> {
        const webContents = electron.webContents.getAllWebContents();
        if (webContents.length > 0) {
            return webContents[0].session.resolveProxy(url);
        } else {
            return undefined;
        }
    }

    protected buildProxyUrl(url: string, proxyHost: string): string {
        if (proxyHost.startsWith('http://') || proxyHost.startsWith('https://')) {
            return proxyHost;
        }
        if (url.startsWith('http://')) {
            return 'http://' + proxyHost;
        } else if (url.startsWith('https://')) {
            return 'https://' + proxyHost;
        }
        return proxyHost;
    }
}