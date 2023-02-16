import * as React from 'react'
import './Input.css'
import Model from '../../model/Model'
import Dropdown from '../Dropdown/Dropdown'
import ChatPanel from '../ChatPanel/ChatPanel'
import { ChatData } from '../../model/ChatManager'
import { EnvironmentType, Metadata, QuestionType, InputData } from '../../types'

export interface InputProps {
  data: InputData;
  appModel: Model;
  clicked: any;
  changed: any;
  chatData: ChatData;
  metadata: Metadata[];
}

export interface InputState {
  clientId: string;
  appName: string;
  accountId: string;
  sessionId: string;
  environment: string;
  type: string;
  top: number; // NBest
  scoreThreshold: number;
  category: string;
  question: string;
  uiMinimized: boolean;
  appMetadata: any;
  inputData: string;
}

export class Input extends React.Component<InputProps, InputState> {
  constructor (props: InputProps) {
    super(props)

    this.state = {
      clientId: props.data.clientId,
      appName: props.data.appName,
      accountId: props.data.accountId,
      sessionId: props.data.sessionId,
      environment: props.data.environment,
      type: props.data.type!,
      top: props.data.top,
      scoreThreshold: props.data.scoreThreshold,
      category: props.data.category,
      question: props.data.question,
      uiMinimized: false,
      appMetadata: props.data && ((props.metadata || []).find((m) => m.appName === props.data.appName) || {}),
      inputData: props.data.inputData
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps: InputProps) {
    if (nextProps !== this.props) {
      this.setState({
        clientId: nextProps.data.clientId,
        appName: nextProps.data.appName,
        accountId: nextProps.data.accountId,
        sessionId: nextProps.data.sessionId,
        environment: nextProps.data.environment,
        type: nextProps.data.type!,
        top: nextProps.data.top,
        scoreThreshold: nextProps.data.scoreThreshold,
        category: nextProps.data.category,
        question: nextProps.data.question,
        inputData: nextProps.data.inputData,
        appMetadata:
          (nextProps.data && (nextProps.metadata || []).find((m) => m.appName === nextProps.data.appName)) || {}
      })
    }
  }

  updateMetadata = () => {
    if (this.props.metadata && this.state.appName) {
      const appMetadata = (this.props.metadata || []).find((m) => m.appName === this.state.appName)
      let inputData = ''
      this.setState(
        {
          appMetadata
        },
        () => {
          this.setState({ inputData })
        }
      )
    }
  };

  public onBlur = (event: any) => {};

  public onChange = (event: any) => {
    const nativeEvent: any = event.nativeEvent
    const stateObject: any = {}
    const propertyName: string = nativeEvent.target.name
    stateObject[propertyName] = nativeEvent.target.value
    this.setState(stateObject)
  };

  onClick = (action: string, data: any) => {
    if (this.props.clicked) {
      if (action === 'submitChatInput') {
        // use the input settings from the outer input panel
        // add the question text from the chat panel
        const chatInputData: any = {
          appName: this.state.appName,
          category: this.state.category,
          clientId: this.state.clientId,
          environment: this.state.environment,
          scoreThreshold: this.state.scoreThreshold,
          sessionId: this.state.sessionId,
          top: this.state.top,
          type: this.state.type,
          accountId: this.state.accountId,
          question: data,
          inputData: this.state.inputData
        }
        this.props.clicked('submitInput', chatInputData)
      } else {
        this.props.clicked(action, data)
      }
    }
  };

  showHide = () => {
    this.setState({
      uiMinimized: !this.state.uiMinimized
    })
  };

  onKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      this.onClick('submitInput', this.state)
    }
  };

  onDropdownChanged = (name: string, data: any) => {
    const stateObject: any = {}
    const propertyName: string = name
    stateObject[propertyName] = data
    this.setState(stateObject, () => {
      if (propertyName === 'appName') {
        this.updateMetadata()
        if (this.props.changed) {
          this.props.changed('updateAppName', data)
        }
      }
    })
  };

  render () {
    const appNameOptions: any = []
    const appNames: string[] = (this.props.metadata || []).map((m) => m.appName!)
    appNames.forEach((appName: string) => {
      appNameOptions.push({ label: appName, value: appName })
    })
    const appNameSelected = { label: this.state.appName, value: this.state.appName }

    const environmentOptions = [
      { label: EnvironmentType.Production, value: EnvironmentType.Production },
      { label: EnvironmentType.Test, value: EnvironmentType.Test }
    ]
    const environmentSelected = { label: this.state.environment, value: this.state.environment }

    const typeOptions = [
      { label: QuestionType.Qa, value: QuestionType.Qa },
      { label: QuestionType.User, value: QuestionType.User },
      { label: QuestionType.Auto, value: QuestionType.Auto }
    ]
    const typeSelected = { label: this.state.type, value: this.state.type }

    const categoryOptions: any[] = []
    categoryOptions.push({ label: '', value: '' })
    if (this.state.appMetadata && this.state.appMetadata.categories) {
      this.state.appMetadata.categories.forEach((category: string) => {
        categoryOptions.push({ label: category, value: category })
      })
    }
    const categorySelected = { label: this.state.category, value: this.state.category }
    const showHideButtonContents: string = this.state.uiMinimized ? '+' : '-'

    const accountId: string = this.props.appModel.accountId!

    let contents: any
    if (!this.state.uiMinimized) {
      contents = (
        <>
          <label className="input">ClientId</label>
          <input name="clientId" className="input" value={this.state.clientId} onChange={this.onChange} readOnly />

          <label>AppName</label>
          <Dropdown
            name="appName"
            options={appNameOptions}
            selectedOption={appNameSelected}
            changed={this.onDropdownChanged}
          />

          <label>InputData</label>
          <textarea name="inputData" value={this.state.inputData} onChange={this.onChange} />

          <label>AccountId</label>
          {/* <Dropdown name="accountId" options={accountIdOptions} selectedOption={accountIdSelected} changed={this.onDropdownChanged} /> */}
          <input name="accountId" className="input" value={accountId} readOnly />

          <label className="input">SessionId</label>
          <input name="sessionId" className="input" value={this.state.sessionId} readOnly />
          <button
            id="sessionIdButton"
            className="fieldButton"
            onClick={() => {
              this.onClick('clearSessionId', {})
            }}
          >
            Clear
          </button>

          <label>Environment</label>
          <Dropdown
            name="environment"
            options={environmentOptions}
            selectedOption={environmentSelected}
            changed={this.onDropdownChanged}
          />

          <label>Type</label>
          <Dropdown name="type" options={typeOptions} selectedOption={typeSelected} changed={this.onDropdownChanged} />

          <label className="input">Top (NBest)</label>
          <input name="top" className="input" value={this.state.top} onChange={this.onChange} />

          <label className="input">Score Threshold</label>
          <input name="scoreThreshold" className="input" value={this.state.scoreThreshold} onChange={this.onChange} />

          <label>Category</label>
          <Dropdown
            name="category"
            options={categoryOptions}
            selectedOption={categorySelected}
            changed={this.onDropdownChanged}
          />

          {/* <label className="input">Question</label>
                <input name="question" className="input" value={this.state.question} onChange={this.onChange} onKeyPress={this.onKeyPress} />
                <button id="submitQuestion" className="containerColumn2 submitButton" onClick={() => { this.onClick('submitInput', this.state) }}>Submit Question</button> */}
        </>
      )
    }

    return (
      <>
        <div id="inputContainer">
          {/* <label className="containerHeader">Input</label> */}
          <button id="inputShowHide" className="fieldButton" onClick={this.showHide}>
            {showHideButtonContents}
          </button>
          {contents}
        </div>
        <div id="chatContainer">
          <ChatPanel data={this.props.chatData} clicked={this.onClick} />
        </div>
      </>
    )
  }
}
