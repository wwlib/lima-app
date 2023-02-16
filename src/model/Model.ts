import { EventEmitter } from 'events'
import Log from '../utils/Log'
import log from './log'
import AppSettings, { AppSettingsOptions } from './AppSettings'
import { LimaHttpClient, LimaConfig } from '../lima-service/LimaHttpClient'
import LimaSocketClientController from '../lima-service/LimaSocketClientController'
import {
  AnnotationData,
  TransactionData,
  InputData,
  QuestionType,
  EnvironmentType,
  Metadata,
  UserData,
  SearchResultsData,
  AnnotationResultsData,
  AnnotationStatus,
  IssueType,
  PriorityType
} from '../types'
import { ChatManager, ChatData } from './ChatManager'


export default class Model extends EventEmitter {

  public log: Log
  private _settings: AppSettings

  private _limaClientController: LimaSocketClientController | undefined

  private _inputClientId = ''
  private _inputAppName = ''
  private _inputSessionId = ''
  private _inputEnvironment: EnvironmentType | undefined
  private _inputType: QuestionType | undefined
  private _inputTop = 1 // NBest
  private _inputScoreThreshold = 0
  private _inputCategory = ''
  private _inputInputData: string = ''
  private _inputQuestion = ''

  private _defaultAppName: string = ''
  private _metadataArray: Metadata[] = []
  private _limaHttpClient: LimaHttpClient

  // private _annotationData: AnnotationData

  constructor() {
    super()
    this.log = log
    this._settings = new AppSettings()
    console.log(`Cookies:`, this.getCookies())

    // this._annotationData = this.resetAnnotationData()

    const limaConfig: LimaConfig = {
      Url: this._settings.LimaAppOptions.serviceUrl,
      AuthUrl: this._settings.LimaAppOptions.authUrl,
      AccountId: this._settings.LimaAppOptions.clientAccountId,
      Password: this._settings.LimaAppOptions.clientPassword,
      SessionId: this._inputSessionId
    }
    this._limaHttpClient = new LimaHttpClient(limaConfig)
  }

  get settings(): AppSettings {
    return this._settings
  }

  get accountId(): string {
    return this._settings.LimaAppOptions.clientAccountId || 'na'
  }

  get inputAppName(): string {
    return this._inputAppName
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings)
    this._settings.init(settings)
    this._settings.saveToLocalStorage()
  }

  // Input

  getDefaultAppName(): string {
    return this._defaultAppName
  }

  get inputData(): InputData {
    return {
      clientId: this._inputClientId,
      appName: this._inputAppName,
      accountId: this.accountId,
      sessionId: this._inputSessionId,
      environment: this._inputEnvironment as EnvironmentType,
      type: this._inputType,
      top: this._inputTop,
      scoreThreshold: this._inputScoreThreshold,
      category: this._inputCategory,
      question: this._inputQuestion,
      inputData: this._inputInputData
    }
  }

  // UserData

  // TODO: maybe get this with a call to the lima-service via access_token?
  // for now just get it form the settings via the accountId getter
  async getUserData(): Promise<UserData> {
    return new Promise<UserData>((resolve, reject) => {
      resolve({ accountId: this.accountId })
    })
  }

  // TransactionData

  get transactionData(): TransactionData {
    return {
      id: "",
      type: "",
      serviceType: "",
      appName: "",
      clientId: "",
      accountId: "",
      sessionId: "",
      // transactionId: "",
      appVersion: "",
      datestamp: 0,
      input: "",
      category: "",
      intentId: "",
      intentDetail: "",
      confidence: 0,
      responseText: "",
      response: {},
    }
  }

  // AnnotationData

  get annotationData(): AnnotationData {
    return {
      id: "",
      type: "",
      clientId: "",
      appName: "",
      serviceType: "",
      accountId: "",
      sessionId: "",
      transactionId: "",
      status: "",
      issueType: "",
      priority: "",
      assignedTo: "",
      category: "",
      intentId: "",
      deidentifiedInput: "",
      notes: "",
      jiraIds: "",
      appSpecificData: {},
      annotationAccountId: "",
      datestamp: Date.now(),
      datestampModified: Date.now(),
      revision: 0
    }
  }

  public getEmptyAnnotationData (sessionId = '', transactionId = '', intentId = '', appName = ''): AnnotationData {
    return {
      id: '',
      type: QuestionType.Qa,
      clientId: 'limaApp',
      appName: appName,
      serviceType: '',
      accountId: '',
      sessionId: sessionId,
      transactionId: transactionId,
      status: AnnotationStatus.Open,
      issueType: IssueType.WrongAnswer,
      priority: PriorityType.Low,
      assignedTo: 'unassigned',
      intentId: intentId,
      category: '',
      deidentifiedInput: '',
      notes: '',
      appSpecificData: {},
      jiraIds: '',
      annotationAccountId: '',
      datestamp: Date.now(),
      datestampModified: Date.now(),
      revision: 0,
    }
  }

  resetAnnotationData (sessionId = '', transactionId = '', intentId = '', appName = ''): AnnotationData {
    return this.getEmptyAnnotationData(sessionId, transactionId, intentId, appName)
    // this._annotationData = this.getEmptyAnnotationData(sessionId, transactionId, intentId, appName)
    // return this._annotationData
  }

  resetInputData() {
    this._inputClientId = 'limaApp'
    this._inputAppName = this.getDefaultAppName()
    this._inputSessionId = ''
    this._inputEnvironment = EnvironmentType.Production
    this._inputType = QuestionType.Qa
    this._inputTop = 1
    this._inputScoreThreshold = 0
    this._inputCategory = ''
    this._inputQuestion = 'what is hepatitis c?'
  }

  // Chat

  get chatData(): ChatData {
    return ChatManager.Instance().chatData
  }

  // Metadata

  getMetadata(): Metadata[] {
    return this._metadataArray
  }

  async makeMetadataRequest(): Promise<Metadata[]> {
    return new Promise<Metadata[]>(async (resolve, reject) => {
      try {
        const result = await this._limaHttpClient.getMetadata()
        this.processMetadataResult(result || [])
        resolve(result)
      } catch (e) {
        reject(new Error('LIMA api call failed: makeMetadataRequest: invalid response status.'))
      }
    })
  }

  processMetadataResult(metadataResult: Metadata[]) {
    this._metadataArray = metadataResult
    if (this._metadataArray) {
      this._metadataArray.forEach((metadataData: Metadata) => {
        if (metadataData.isDefault) {
          this._defaultAppName = metadataData.appName
        }
      })
      this.resetInputData()
    }
  }

  getAppNames(): string[] {
    let result: string[] = []
    if (this._metadataArray) {
      result = this._metadataArray.map(m => m.appName)
    }
    return result
  }

  //// Search

  submitSearchData(data: any): Promise<SearchResultsData> {
    const { database, ...params } = data
    const criteria: any = Model.stripEmptyProperties(params, ['status']) // , 'uiMinimized'
    if (database === 'annotations' && data.status) {
      const statusList: string[] = []
      const keys: string[] = Object.keys(data.status)
      keys.forEach((key: string) => {
        if (data.status[key]) {
          statusList.push(key)
        }
      })
      criteria.status = statusList.length > 0 ? statusList : undefined
    }
    return this.makeSearchRequest(database, criteria)
  }

  async makeSearchRequest(database: string, data: any): Promise<SearchResultsData> {
    console.log(`Model: makeSearchRequest:`, database, data)
    try {
      let result: any
      if (database === 'transactions') {
        result = await this._limaHttpClient.getTransactionsWithData(data)
      } else if (database === 'annotations') {
        result = await this._limaHttpClient.getAnnotationsWithData(data)
      }
      const results: SearchResultsData = {
        database,
        status: "OK",
        result,
      }
      return results
    } catch (e) {
      console.log(e)
      console.log(`QAS api call failed: makeSearchRequest: error: ${e}`)
      throw new Error('LIMA api call failed: makeSearchRequest: invalid response status.')
    }
  }

  //// Annotations

  // submitAnnotationData (data: AnnotationData): Promise<AnnotationData> {
  //   return new Promise<AnnotationData>(async (resolve, reject) => {
  //     try {
  //       const result = await processAnnotationService(data)
  //       this._annotationData = result
  //       this.activeAnnotationId = result.id || ''
  //       resolve(result)
  //     } catch (e) {
  //       console.log(e)
  //       reject(new Error('QAS api call failed: submitAnnotationData: received invalid annotation data.'))
  //     }
  //   })
  // }

  submitAnnotationData(data: any): Promise<AnnotationData> {
    const requestData: AnnotationData = Model.stripEmptyProperties(data) // , 'uiMinimized'
    return this.makeAnnotationRequest(requestData)
  }

  async makeAnnotationRequest(data: AnnotationData): Promise<AnnotationData> {
    console.log(`Model: makeAnnotationRequest:`, data)
    try {
      let result: any = await this._limaHttpClient.submitAnnotation(data)
      console.log(`Model: makeAnnotationRequest: result:`, result)
      // const results: AnnotationData = {
      // }
      return result
    } catch (e) {
      console.log(e)
      console.log(`LIMA api call failed: makeAnnotationRequest: error: ${e}`)
      throw new Error('LIMA api call failed: makeAnnotationRequest: invalid response status.')
    }
  }

  // async makeSearchRequest(data: any): Promise<SearchResultsData> {
  //   try {
  //     const result = await this._limaHttpClient.getTransactionsWithData(data)
  //     const searchResultsData: SearchResultsData = {
  //       database: "",
  //       status: "",
  //       result: result,
  //     }
  //     return searchResultsData
  //   } catch (e) {
  //     throw new Error('LIMA api call failed: makeSearchRequest: invalid response status.')
  //   }
  // }

  //// Auth-related

  getCookies = () => {
    var cookies = document.cookie.split('')
    var ret = ''
    for (var i = 1; i <= cookies.length; i++) {
      ret += i + ' - ' + cookies[i - 1] + "<br>"
    }
    return ret
  }

  //// Socket Client

  getLimaSocketClientController(serviceUrl: string, authUrl: string, controllerAccountId: string, controllerPassword: string, reset: boolean = false): LimaSocketClientController | undefined {
    if (reset) {
      if (this._limaClientController) {
        this._limaClientController.dispose()
        this._limaClientController = undefined
      }
    }
    if (this._limaClientController) {
      return this._limaClientController
    } else {
      console.log(`getLimaSocketClientController:`, serviceUrl, authUrl, controllerAccountId)
      if (serviceUrl && authUrl && controllerAccountId && controllerPassword) {
        this._limaClientController = new LimaSocketClientController(serviceUrl, authUrl, controllerAccountId, controllerPassword)
        return this._limaClientController
      } else {
        return undefined
      }
    }
  }

  //// Static

  static isTransactionData(object: any): object is TransactionData {
    return !('transactionId' in object)
  }

  static isAnnotationData(object: any): object is AnnotationData {
    return 'transactionId' in object
  }

  static stripEmptyProperties(data: any, exclude: string[] = [], include: string[] = []): any {
    const result: any = {} // Object.assign({}, data);
    if (data) {
      const keys: string[] = Object.keys(data)
      keys.forEach((key: string) => {
        if (include.indexOf(key) >= 0 || (data[key] !== '' && data[key] !== undefined && exclude.indexOf(key) === -1)) {
          result[key] = data[key]
        }
      })
    }
    return result
  }
}
