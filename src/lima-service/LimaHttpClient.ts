/**
 * LimaHttpClient is an interface to the LIMA Service (Language Intelligence Manager Analyzer).
 * - https://github.com/wwlib/lima-service
 * - see docs/docker/docker-compose.yml for an example of a typical LIMA service configuration
 * 
 * LIMA manages the routing of NLU requests to appropriate cognitive services and logs each trasaction for easy review.
 * 
 * @module
 */

import { TransactionData, AnnotationData } from '../types'
import { Metadata } from '../types'

const axios = require('axios')

export interface LimaConfig {
    Url: string
    AuthUrl: string
    AccountId: string
    Password: string
    SessionId: string
}

export type LimaMetadataRequestBody = any

export interface LimaRequestBody {
    sessionId: string
    clientId: string // i.e. 'hub-lima-client'
    input: string
    inputData: any
    type: string
    serviceType: string // i.e. 'luis',
    appName: string // i.e. 'luis/robo-dispatch',
    accountId: string
    environment: string
}

export interface LimaTransactionSearchRequestBody {
    id?: string
    sessionId?: string
    clientId: string // i.e. 'hub-lima-client'
    input?: string
    type?: string
    serviceType?: string // i.e. 'luis',
    appName?: string // i.e. 'luis/robo-dispatch',
    accountId?: string
    environment?: string
}

export interface LimaAnnotationSearchRequestBody {
    id?: string
    transactionId?: string
    sessionId?: string
    clientId: string
    appName: string
    serviceType?: string // i.e. 'luis',
    status?: string
    priority?: string
    issueType?: string
    assignedTo?: string
    accountId?: string
    jiraIds?: string
}

export interface LimaAnnotationRequestBody {
    id: string
    annotationAccountId: string
    type: string
    transactionId: string
    sessionId: string
    clientId: string
    appName: string
    serviceType: string // i.e. 'luis',
    status: string
    priority: string
    issueType: string
    assignedTo: string
    accountId: string
    intentId: string
    category: string
    deidentifiedInput: string
    notes: string
    appSpecificData: any
    jiraIds: string
    // datestamp: number
    // datestampModified: number
    revision: number
}
    
export class LimaHttpClient {

    private _limaUrl: string = ''
    private _limaAuthUrl: string = ''
    private _limaAccountId: string = ''
    private _limaPassword: string = ''
    private _limaSessionId: string = ''

    private _config: LimaConfig
    private _debug: boolean = false

    constructor(config: LimaConfig, options?: any) {
        this._config = config
        this._limaUrl = this._config.Url
        this._limaAuthUrl = this._config.AuthUrl
        this._limaAccountId = this._config.AccountId
        this._limaPassword = this._config.Password
        this._limaSessionId = this._config.SessionId
        this._debug = options ? options.debug : false
    }

    set config(config: any) {
        if (config && config.Url && config.AuthUrl && config.AccountId && config.Password) {
            this._config = config
            this._limaUrl = this._config.Url
            this._limaAuthUrl = this._config.AuthUrl
            this._limaAccountId = this._config.AccountId
            this._limaPassword = this._config.Password
        } else {
            console.log(`LimaHttpClient: set config: error: incomplete config:`, config)
        }
    }

    // TODO: optimize this by keeping track of access_token expiration time
    async getAuthData() {
        if (this._limaAuthUrl && this._limaAccountId && this._limaPassword) {
            return new Promise((resolve, reject) => {
                axios.post(this._limaAuthUrl, {
                    accountId: this._limaAccountId,
                    password: this._limaPassword
                },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(function (response: any) {
                        // console.log(response)
                        resolve(response.data)
                    })
                    .catch(function (error: any) {
                        console.log(error)
                        reject()
                    })
            })
        } else {
            throw new Error('LimaHttpClient: Unable to get authData.')
        }
    }

    // TODO: return a typed response
    async call(route: string, requestBody: LimaMetadataRequestBody | LimaTransactionSearchRequestBody | LimaAnnotationSearchRequestBody | LimaRequestBody): Promise<any> {
        const authData: any = await this.getAuthData()

        return new Promise((resolve, reject) => {
            axios.post(`${this._limaUrl}/${route}`, requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authData.access_token}`,
                    }
                })
                .then((response: any) => {
                    // console.log(response)
                    resolve(response.data)
                })
                .catch((error: any) => {
                    // TODO: remove log and throw
                    console.log(`LimaHttpClient: call: Error:`)
                    console.log(error)
                    reject(error)
                })
        })
    }

    // metadata

    getMetadata(): Metadata[] {
        // TODO: Make a call to lima-service to get metadata
        // const requestBody: LimaMetadataRequestBody = {}
        // const result = await this.call('metdata', requestBody) as Transaction[]
        // return result

        return [
            {
                key: "lima:metadata:luis/robo-dispatch",
                appName: "luis/robo-dispatch",
                appVersion: "1.0",
                serviceType: "luis",
                intents: [],
                categories: [],
                isDefault: true
            },
            {
                key: "lima:metadata:gpt3text/roboChitchatJan2023",
                appName: "gpt3text/roboChitchatJan2023",
                appVersion: "0.1",
                serviceType: "gpt3text",
                intents: [],
                categories: [],
                isDefault: false
            }
        ]        
    }

    // Search

    async getTransactionsWithData(data: any): Promise<TransactionData[]> {
        console.log(`LimaHttpClient: getTransactionsWithData:`, data)
        const requestBody: LimaTransactionSearchRequestBody = {
            id: data.id,
            sessionId: data.sessionId,
            clientId: data.clientId,
            input: data.input,
            type: data.type,
            serviceType: data.serviceType, // i.e. 'luis',
            appName: data.appName, // i.e. 'luis/robo-dispatch',
            accountId: data.accountId,
            environment: data.environment,
        }
        console.log(`LimaHttpClient: getTransactionsWithData: requestBody:`, requestBody)
        const limaResponse = await this.call('transactions', requestBody)
        let result: TransactionData[] = []
        if (limaResponse.transactions) {
            result = limaResponse.transactions.map((item: any) => item.value) // redis returns { id, value }
        }
        console.log(result)
        return result
    }

    async getAnnotationsWithData(data: any): Promise<AnnotationData[]> {
        console.log(`LimaHttpClient: getAnnotationsWithData:`, data)
        const requestBody: LimaAnnotationSearchRequestBody = {
            id: data.id,
            transactionId: data.transactionId,
            sessionId: data.sessionId,
            clientId: data.clientId,
            appName: data.appName,
            serviceType: data.serviceType, // i.e. 'luis',
            status: data.status, // i.e. 'luis/robo-dispatch',
            priority: data.priority,
            issueType: data.issueType,
            assignedTo: data.assignedTo,
            accountId: data.accountId,
            jiraIds: data.jiraIds,
        }
        
        console.log(`LimaHttpClient: getAnnotationsWithData: requestBody:`, requestBody)
        const limaResponse = await this.call('annotations', requestBody)
        let result: AnnotationData[] = []
        if (limaResponse.annotations) {
            result = limaResponse.annotations.map((item: any) => item.value) // redis returns { id, value }
        }
        console.log(result)
        return result
    }

    //// annotations

    async submitAnnotation(data: AnnotationData) {
        console.log(`LimaHttpClient: submitAnnotation:`, data)
        const requestBody: LimaAnnotationRequestBody = {
            id: data.id,
            annotationAccountId: data.annotationAccountId,
            type: data.type,
            transactionId: data.transactionId,
            sessionId: data.sessionId,
            clientId: data.clientId,
            appName: data.appName,
            serviceType: data.serviceType, // i.e. 'luis',
            status: data.status, // i.e. 'luis/robo-dispatch',
            priority: data.priority,
            issueType: data.issueType,
            assignedTo: data.assignedTo,
            accountId: data.accountId,
            intentId: data.intentId,
            category: data.accountId,
            deidentifiedInput: data.deidentifiedInput,
            notes: data.notes,
            appSpecificData: data.appSpecificData,
            jiraIds: data.jiraIds,
            // datestamp: number
            // datestampModified: number
            revision: data.revision
        }

        console.log(`LimaHttpClient: submitAnnotation: requestBody:`, requestBody)
        const limaResponse = await this.call('annotation', requestBody)
        console.log(`LimaHttpClient: submitAnnotation: limaResponse:`, limaResponse)
        return limaResponse.response
    }
}
