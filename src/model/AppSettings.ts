export interface LimaAppOptions {
    serviceUrl: string;
    authUrl: string;
    clientAccountId: string;
    clientPassword: string;
}

const LOCAL_STORAGE_ITEM_NAME = 'lima-app'

const defaultLimaAppOptions: LimaAppOptions = {
    serviceUrl: 'http://localhost:8084/', // 'http://reasongraph.com:8084/',
    authUrl: 'http://localhost:8084/auth', // 'http://reasongraph.com:8084/auth',
    clientAccountId: 'client1',
    clientPassword: 'client1',
}

export interface AppSettingsOptions {
    LimaAppOptions: LimaAppOptions
}

export default class AppSettings {

    public LimaAppOptions: LimaAppOptions = defaultLimaAppOptions;

    constructor(options?: AppSettingsOptions) {
        // super();
        this.init(options);
    }

    init(options?: AppSettingsOptions): void {
        // console.log(`AppSettingsOptions: init`, options);
        if (options) {
            this.initWithData(options);
        } else if (this.loadFromLocalStorage()) {
            console.log(`loaded settings from local storage.`)
        } else {
            this.initWithData();
        }
    }

    initWithData(options: AppSettingsOptions | any = {}): void {
        console.log(`AppSettingsOptions: initWithData`, options);
        // super.initWithData(options)

        if (options.LimaAppOptions) {
            this.LimaAppOptions = options.LimaAppOptions;
        } else {
            this.LimaAppOptions = defaultLimaAppOptions;
        }
    }

    saveToLocalStorage(): boolean {
        const localStorage = window.localStorage;
        try {
            const dataText = JSON.stringify(this.json);
            localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, dataText)
            return true;
        } catch (error) {
            console.log(`saveToLocalStorage:`, error);
            return false;
        }
    }

    loadFromLocalStorage(): boolean {
        let result = false;
        const localStorage = window ? window.localStorage : undefined;

        if (localStorage) {
            const settingsText: string | null = localStorage.getItem(LOCAL_STORAGE_ITEM_NAME)
            // console.log(`loadFromLocalStorage: `, settingsText);
            if (settingsText) {
                try {
                    const settings = JSON.parse(settingsText);
                    this.initWithData(settings as LimaAppOptions)
                    result = true
                } catch (error) {
                    console.log(`loadFromLocalStorage`, error);
                }
            }
        }
        return result;
    }

    get json(): any {
        let json: any = {
            LimaAppOptions: this.LimaAppOptions,
        };
        return json;
    }

}