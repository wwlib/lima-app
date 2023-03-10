import * as React from 'react'
import './Transaction.css'
import Model from '../../model/Model'
import { TransactionData } from '../../types'
import JSONPretty from 'react-json-pretty'

const JSONPrettyMon = require('react-json-pretty/dist/monikai')

export interface TransactionProps {
  appModel: Model;
  data: TransactionData;
}

export interface TransactionState {
  serviceType: string;
  appName: string;
  clientId: string;
  accountId: string;
  sessionId: string;
  id: string;
  appVersion: string;
  datestamp: number;
  input: string;
  category: string;
  intentId: string;
  intentDetail: string;
  confidence: number;
  responseText: string;
}

export class Transaction extends React.Component<TransactionProps, TransactionState> {
  constructor(props: TransactionProps) {
    super(props)
    let responseText: string = ''
    try {
      responseText = JSON.stringify(this.props.data, null, 2)
    } catch (error) {
      console.log(error)
    }
    this.state = {
      serviceType: this.props.data.serviceType || '',
      appName: this.props.data.appName || '',
      clientId: this.props.data.clientId || '',
      accountId: this.props.data.accountId || '',
      sessionId: this.props.data.sessionId || '',
      id: this.props.data.id || '',
      appVersion: this.props.data.appVersion || '',
      datestamp: this.props.data.datestamp || 0,
      input: this.props.data.input || '',
      category: this.props.data.category || '',
      intentId: this.props.data.intentId || '',
      intentDetail: this.props.data.intentDetail || '',
      confidence: 0,
      responseText: responseText || ''
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: TransactionProps) {
    if (nextProps !== this.props) {
      let responseText: string = ''
      try {
        responseText = JSON.stringify(nextProps.data, null, 2)
      } catch (error) {
        console.log(error)
      }
      this.setState({
        serviceType: nextProps.data.serviceType || '',
        appName: nextProps.data.appName || '',
        clientId: nextProps.data.clientId || '',
        accountId: nextProps.data.accountId || '',
        sessionId: nextProps.data.sessionId || '',
        id: nextProps.data.id || '',
        appVersion: nextProps.data.appVersion || '',
        datestamp: nextProps.data.datestamp || 0,
        category: nextProps.data.category || '',
        intentId: nextProps.data.intentId || '',
        intentDetail: nextProps.data.intentDetail || '',
        input: nextProps.data.input || '',
        confidence: nextProps.data.confidence || 0,
        responseText: responseText || ''
      })
    }
  }

  render() {
    let answer: string = ''
    if (this.props.data && this.props.data.response && this.props.data.response.answers) {
      answer = this.props.data.response.answers[0].answer || ''
    } else if (typeof this.props.data.response === 'string') {
      answer = this.props.data.response
    }

    const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    const dateCreated = new Date(this.state.datestamp)
    const dateCreatedString: string = this.state.datestamp ? dateCreated.toLocaleDateString('en-US', dateFormatOptions) : ''

    return <div className="transactionColumns">
      <div className="transactionColumn">
        <div id='transactionContainer' className="LimaAppDashboardContainer">
          <label className="containerHeader">Transaction</label>
          <label className="answer">ServiceType</label>
          <input name="serviceType" className="answer" value={this.state.serviceType} readOnly />
          <label className="answer">AppName</label>
          <input name="appName" className="answer" value={this.state.appName} readOnly />
          <label className="answer">ClientId</label>
          <input name="clientId" className="answer" value={this.state.clientId} readOnly />
          <label className="answer">AccountId</label>
          <input name="accountId" className="answer" value={this.state.accountId} readOnly />
          <label className="answer">SessionId</label>
          <input name="sessionId" className="answer" value={this.state.sessionId} readOnly />
          <label className="answer">Id</label>
          <input name="id" className="answer" value={this.state.id} readOnly />
          <label className="answer">AppVersion</label>
          <input name="appVersion" className="answer" value={this.state.appVersion} readOnly />
          <label className="answer">Date Created</label>
          <input name="dateCreated" value={dateCreatedString} readOnly />
          <label className="highlightedYellow">Input</label>
          <input name="input" className="highlightedYellow" value={this.state.input} readOnly />
          <label className="highlighted">IntentDetail</label>
          <input name="intentDetail" className="highlighted" value={this.state.intentDetail} readOnly />
          <label className="answer">IntentId</label>
          <input name="intentId" className="answer" value={this.state.intentId} readOnly />
          <label className="answer">Confidence</label>
          <input name="confidence" className="answer" value={this.state.confidence} readOnly />
          <label className="answer">Category</label>
          <input name="category" className="answer" value={this.state.category} readOnly />
          <label id="transactionAnswerLabel" className="highlightedBlue">Answer</label>
          <textarea name="transactionAnswer" id="transactionAnswer" className="highlightedBlue" value={answer} rows={16} readOnly />
          {/* <textarea name="responseText" id='transactionResponse' value={this.state.responseText} rows={25} readOnly></textarea> */}
          <div id='transactionResponse'>
            <JSONPretty data={this.state.responseText} theme={JSONPrettyMon} />
          </div>
        </div>
      </div>
      <div className="transactionColumn LimaAppDashboardContainer transactionInputColumn">
        <label className="highlightedYellow">Transaction Input/Prompt</label>
        <textarea name="input" className="highlightedYellow" value={this.state.input} readOnly rows={38}/>
      </div>
    </div>
  }
}
