import { EventEmitter } from 'events';
import Log from '../utils/Log';
import log from './log';
import AppSettings, { AppSettingsOptions } from './AppSettings';
import LimaClientController from './LimaClientController';


export default class Model extends EventEmitter{

  public log: Log;
  public settings: AppSettings;

  private _limaClientController: LimaClientController | undefined;

  constructor() {
    super()
    this.log = log;
    this.settings = new AppSettings();
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings);
    this.settings.init(settings);
    this.settings.saveToLocalStorage();
  }

  //// CognitiveHub

  getLimaClientController(serviceUrl: string, authUrl: string, controllerAccountId: string, controllerPassword: string, reset: boolean = false): LimaClientController | undefined {
    if (reset) {
      if (this._limaClientController) {
        this._limaClientController.dispose()
        this._limaClientController = undefined
      }
    }
    if (this._limaClientController) {
      return this._limaClientController;
    } else {
      console.log(`getLimaClientController:`, serviceUrl, authUrl, controllerAccountId)
      if (serviceUrl && authUrl && controllerAccountId && controllerPassword) {
        this._limaClientController = new LimaClientController(serviceUrl, authUrl, controllerAccountId, controllerPassword);
        return this._limaClientController;
      } else {
        return undefined
      }
    }
  }
}
