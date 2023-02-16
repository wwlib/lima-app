import { EventEmitter } from 'events'

export interface ChatManagerOptions {

}

export enum MessageType {
    'userInput' = 'userInput',
    'canonicalQuestion' = 'canonicalQuestion',
    'answer' = 'answer',
}

export interface ChatMessageData {
    text: string;
    id: string;
    type: MessageType;
}

export interface ChatData {
    messages: ChatMessageData[];
}

export class ChatManager extends EventEmitter {
    private static _instance: ChatManager;

    private _messages: ChatMessageData[];

    constructor (options?: ChatManagerOptions) {
      super()
      this._messages = this._init()
    }

    static Instance (options?: ChatManager) {
      return this._instance || (this._instance = new this(options))
    }

    private _init (): ChatMessageData[] {
      return []
    }

    reset () {
      this._messages = this._init()
    }

    get chatData (): ChatData {
      return {
        messages: this._messages
      }
    }

    addMessage (text: string, id: string, type: MessageType): ChatMessageData {
      const message: ChatMessageData = {
        text,
        id,
        type
      }
      this._messages.push(message)
      return message
    }

    /// /

    static isChatMessageData (object: any): object is ChatMessageData {
      return ('id' in object) && ('text' in object) && ('type' in object)
    }
}
