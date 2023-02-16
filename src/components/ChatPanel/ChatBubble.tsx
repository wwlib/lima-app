import * as React from 'react'
import './ChatPanel.css'
import { ChatMessageData, MessageType } from '../../model/ChatManager'

export interface ChatBubbleProps {
    data: ChatMessageData;
    clicked: any;
}

export interface ChatBubbleState {

}

export default class ChatBubble extends React.Component<ChatBubbleProps, ChatBubbleState> {
  constructor (props: ChatBubbleProps) {
    super(props)
    this.state = {
    }
  }

    onClick = (event: any, action: string) => {
      event.stopPropagation()
      if (this.props.clicked) {
        this.props.clicked(action, this.props.data)
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

    render () {
      let chatBubbleClass: string = 'chatBubbleRight'
      // let buttonFlag: any;
      if (this.props.data.type === MessageType.canonicalQuestion || this.props.data.type === MessageType.answer) {
        // let flagText: string = 'Wrong Question';
        // if (this.props.data.type === MessageType.answer) {
        //     flagText = 'Inadequate Answer';
        // }
        chatBubbleClass = 'chatBubbleLeft'
        // buttonFlag = <div className='chatBubbleButtonFlag' onClick={(e: any) => this.onClick(e, 'flag')}>{flagText}</div>
      }

      return <div className={`chatBubble ${chatBubbleClass}`} onClick={(e: any) => this.onClick(e, 'select')}>
            <div className="chatBubbleContent">
                <div className="chatBubbleContentText">
                    {this.props.data.text}
                </div>
                {/* <div className="chatBubbleContentButton">
                    {buttonFlag}
                </div> */}

            </div>
        </div>
    }
}
