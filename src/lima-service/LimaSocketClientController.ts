import { EventEmitter } from "events";

const axios = require('axios');
const { io } = require("socket.io-client");
const timesync = require('timesync');


export interface LimaServiceLoginResponse {
    access_token: string;
    account_id: string;
    refresh_token: string;
}

export default class LimaSocketClientController extends EventEmitter {

    private _serviceUrl: string;
    private _authUrl: string;
    private _accountId: string;
    private _password: string;
    private _accessToken: string | undefined;
    private _refreshToken: string | undefined;

    private _socket: any;
    private _timesync: any;
    private _connected: boolean;

    private _syncOffset: number

    constructor(serviceUrl: string, authUrl: string, accountId: string, password: string) {
        super();
        this._serviceUrl = serviceUrl;
        this._authUrl = authUrl;
        this._accountId = accountId;
        this._password = password;
        this._connected = false;
        this._syncOffset = 0;
    }

    get accountId(): string {
        return this._accountId
    }

    get connected(): boolean {
        return this._connected;
    }

    async login(): Promise<LimaServiceLoginResponse> {
        console.log('LimaSocketClientController: login', this._authUrl, this._accountId, this._password);
        return new Promise((resolve, reject) => {
            if (this._authUrl && this._accountId && this._password) {
                this._accessToken = '';
                this._refreshToken = '';
                axios.post(this._authUrl, {
                    accountId: this._accountId,
                    password: this._password
                },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then((response: any) => {
                        console.log('LimaSocketClientController: login response', response.data);
                        this._accessToken = response.data.access_token;
                        // this._accountId = response.data.account_id;
                        this._refreshToken = response.data.refresh_token;
                        resolve(response.data);
                    })
                    .catch((error: any) => {
                        console.log('LimaSocketClientController: login error', error);
                        reject();
                    });

            } else {
                reject('Invalid authUrl, accountId and/or password.')
            }
        });
    }

    //// AUDIO

    audioStart() {
        this._socket.emit('asrAudioStart');
    }

    audioEnd() {
        this._socket.emit('asrAudioEnd');
    }

    sendAudio(data: Buffer) {
        this._socket.emit('asrAudio', data);
    }

    handleTimesyncChange = (offset: number) => {
        // console.log('timesync: changed offset: ' + offset + ' ms');
        this._syncOffset = offset
    }

    async connect() {
        console.log('LimaSocketClientController: connect',)
        if (this._connected) {
            return
        }

        const loginResponse: LimaServiceLoginResponse = await this.login();
        console.log('LimaSocketClientController: loginResponse', loginResponse);
        if (loginResponse && loginResponse.access_token && this._serviceUrl) {

            this._socket = io(this._serviceUrl, {
                path: '/socket-device/',
                extraHeaders: {
                    Authorization: `Bearer ${loginResponse.access_token}`,
                },
                reconnection: false,
            });

            if (false) { // don't worry about clock sync for now
                // timesync

                this._timesync = timesync.create({
                    server: this._socket,
                    interval: 5000
                });

                // this._timesync.on('sync', (state: string) => {
                //     // console.log('timesync: sync ' + state + '');
                // });

                this._timesync.on('change', this.handleTimesyncChange);

                this._timesync.send = function (socket: any, data: any, timeout: number): Promise<void> {
                    //console.log('send', data);
                    return new Promise(function (resolve, reject) {
                        if (socket) {
                            var timeoutFn = setTimeout(reject, timeout);
                            socket.emit('timesync', data, function () {
                                clearTimeout(timeoutFn);
                                resolve();
                            });
                        } else {
                            console.log('LimaSocketClientController: Not sending timesync event. socket is undefined.')
                            resolve()
                        }
                    });
                };

                this._socket.on('timesync', (data: any) => {
                    //console.log('receive', data);
                    this._timesync.receive(null, data);
                });
            }

            // socket messages

            this._socket.on("connect", () => {
                this._connected = true;
                this.log('LimaSocketClientController: socket connected:', this._socket.id)
            });

            this._socket.on('disconnect', () => {
                this.log('LimaSocketClientController: on disconnect. closing...');
                this._socket = undefined
                this.dispose()
            });

            this._socket.on('message', (data: any) => {
                this.log('LimaSocketClientController: on message', data);
            });

        } else {
            throw new Error('Invalid or undefined access_token and/or serviceUrl.')
        }
    }

    sendCommand(commandData: any) {
        if (this._socket) {
            this._socket.emit('command', commandData)
        } else {
            console.log(`LimaSocketClientController: sendCommand: _socket is undefined.`)
        }
    }

    log(...args: any) {
        console.log(args)
        this.emit('statusMessage', args)
    }

    dispose() {
        console.log(`LimaSocketClientController: DISPOSE`)
        if (this._socket) {
            this._socket.close();
            this._socket = undefined;
        }
        this._connected = false;
        if (this._timesync) {
            this._timesync.off('change', this.handleTimesyncChange);
            this._timesync.destroy();
        }
        this._timesync = undefined;
        this.removeAllListeners()
    }
}