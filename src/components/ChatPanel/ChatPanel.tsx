import * as React from 'react'
import './ChatPanel.css'
import { ChatData, ChatMessageData, MessageType } from '../../model/ChatManager'
import ChatBubble from './ChatBubble'

export interface ChatPanelProps {
    data: ChatData;
    clicked: any;
}

export interface ChatPanelState {
    messageData: ChatMessageData[];
    inputText: string;
}

export default class ChatPanel extends React.Component<ChatPanelProps, ChatPanelState> {
    private _divRef: any = React.createRef();
    private _adjustScrollTop: boolean = false;

    constructor (props: ChatPanelProps) {
      super(props)
      this.state = {
        messageData: this.props.data.messages || [
          {
            id: '',
            text: "Hi, I'm Jibo",
            type: MessageType.answer
          },
          {
            id: '',
            text: 'Yo',
            type: MessageType.userInput
          },
          {
            id: '',
            text: 'Ho',
            type: MessageType.userInput
          }
        ],
        inputText: ''
      }
    }

    componentDidUpdate (prevProps: any, prevState: any, snapshot: any) {
      if (this._adjustScrollTop) {
        this._divRef.scrollTop = this._divRef.scrollHeight // - snapshot;
        this._adjustScrollTop = false
      }
    }

    onChatBubbleClick = (action: string, data: ChatMessageData) => {
      if (this.props.clicked) {
        if (action === 'select') {
          this.props.clicked('chatBubbleSelected', data)
        } else if (action === 'flag') {
          this.props.clicked('chatBubbleFlagged', data)
        }
      }
    }

    onKeyPress = (event: any) => {
      if (event.key === 'Enter') {
        if (this.props.clicked) {
          this.props.clicked('submitChatInput', this.state.inputText)
        }
        this._adjustScrollTop = true
      }
    }

    public onChange = (event: any) => {
      const nativeEvent: any = event.nativeEvent
      const stateObject: any = {
      }
      const propertyName: string = nativeEvent.target.name
      stateObject[propertyName] = nativeEvent.target.value
      this.setState(stateObject)
    }

    // https://blog.logrocket.com/what-to-expect-in-react-v17/
    setDivRef = (ref: any) => {
      this._divRef = ref
    }

    render () {
      const chatBubbles: any[] = []
      let chatBubbleKey: number = 0
      this.state.messageData.forEach((message: ChatMessageData) => {
        const chatBubble: any = <ChatBubble key={chatBubbleKey++} data={message} clicked={this.onChatBubbleClick} />
        chatBubbles.push(chatBubble)
      })
      return <>
            <div className="chatBox">
                <div id="bubbler" className="chatContentView" ref={this.setDivRef}>
                    {chatBubbles}
                </div>
                <div className="chatControls">
                    <span id="chatPrompt">{'>'}</span>
                    <input name="inputText" id="chatTextField" placeholder="enter your message" value={this.state.inputText} onChange={this.onChange} onKeyPress={this.onKeyPress} />
                </div>
            </div>
        </>
    }
}
