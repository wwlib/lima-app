import * as React from 'react'
import Dropdown from '../Dropdown/Dropdown'
import './Annotation.css'
import Model from '../../model/Model'
import {
  AccountId,
  AnnotationData,
  AnnotationStatus,
  IssueType,
  Metadata,
  PriorityType,
  QuestionType
} from '../../types'

export interface AnnotationProps {
  appModel: Model;
  data: AnnotationData;
  accountId: AccountId;
  clicked: any;
  changed: any;
  metadata: Metadata[];
}

export interface AnnotationState {
  id: string;
  datestamp: number;
  datestampModified: number;
  type: string;
  clientId: string;
  appName: string;
  accountId: string;
  sessionId: string;
  transactionId: string;
  status: string;
  issueType: string;
  priority: string;
  assignedTo: string;
  revision: number;
  intentId: string;
  deidentifiedInput: string;
  notes: string;
  jiraIdsString: string;
  appSpecificData: any;
  annotationAccountId: AccountId;
  appMetadata: any;
}

export class Annotation extends React.Component<AnnotationProps, AnnotationState> {
  constructor (props: AnnotationProps) {
    super(props)
    this.state = {
      id: this.props.data.id || '',
      datestamp: this.props.data.datestamp || 0,
      datestampModified: this.props.data.datestampModified || 0,
      type: this.props.data.type || '',
      clientId: this.props.data.clientId || '',
      appName: this.props.data.appName || '',
      accountId: this.props.data.accountId || '',
      sessionId: this.props.data.sessionId || '',
      transactionId: this.props.data.transactionId || '',
      status: this.props.data.status || '',
      issueType: this.props.data.issueType || '',
      priority: this.props.data.priority || '',
      assignedTo: this.props.data.assignedTo || '',
      revision: this.props.data.revision || 0,
      intentId: this.props.data.intentId || '',
      deidentifiedInput: this.props.data.deidentifiedInput || '',
      notes: this.props.data.notes || '',
      jiraIdsString: this.props.data.jiraIds, // this.jiraIdsArrayToString(this.props.data.jiraIds),
      appSpecificData: this.props.data.appSpecificData || '',
      annotationAccountId: this.props.appModel.accountId,
      appMetadata: (props.metadata || []).find(m => m.appName === props.data.appName) || {},
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps: AnnotationProps) {
    if (nextProps !== this.props) {
      this.setState({
        id: nextProps.data.id || '',
        datestamp: nextProps.data.datestamp || 0,
        datestampModified: nextProps.data.datestampModified || 0,
        type: nextProps.data.type || '',
        clientId: nextProps.data.clientId || '',
        appName: nextProps.data.appName || '',
        accountId: nextProps.data.accountId || '',
        sessionId: nextProps.data.sessionId || '',
        transactionId: nextProps.data.transactionId || '',
        status: nextProps.data.status || '',
        issueType: nextProps.data.issueType || '',
        priority: nextProps.data.priority || '',
        assignedTo: nextProps.data.assignedTo || '',
        revision: nextProps.data.revision || 0,
        intentId: nextProps.data.intentId || '',
        deidentifiedInput: nextProps.data.deidentifiedInput || '',
        notes: nextProps.data.notes || '',
        jiraIdsString: nextProps.data.jiraIds, // this.jiraIdsArrayToString(nextProps.data.jiraIds),
        appSpecificData: nextProps.data.appSpecificData || '',
        appMetadata: (nextProps.metadata || []).find(m => m.appName === nextProps.data.appName) || {},
        annotationAccountId: nextProps.accountId,
      })
    }
  }

  jiraIdsArrayToString (jiraIdsArray: string[]) {
    let result: string = ''
    if (jiraIdsArray && Array.isArray(jiraIdsArray)) {
      result = jiraIdsArray.join(',')
    }
    return result
  }

  jiraIdsStringToArray (jiraIdsString: string) {
    let result: string[] = []
    if (jiraIdsString && typeof jiraIdsString === 'string') {
      result = jiraIdsString.split(',').map(function (item) {
        return item.trim()
      })
    }
    return result
  }

  public onBlur = (event: any) => {};

  public onChange = (event: any) => {
    const nativeEvent: any = event.nativeEvent
    const stateObject: any = {}
    const propertyName: string = nativeEvent.target.name
    stateObject[propertyName] = nativeEvent.target.value
    this.setState(stateObject)
  };

  public onClick (action: string, data: any) {
    if (this.props.clicked) {
      const annotationData: AnnotationData = {
        id: data.id || '',
        type: data.type || '',
        clientId: data.clientId || '',
        appName: data.appName || '',
        serviceType: data.serviceType || '',
        accountId: data.accountId || '',
        sessionId: data.sessionId || '',
        transactionId: data.transactionId || '',
        status: data.status || '',
        issueType: data.issueType || '',
        priority: data.priority || '',
        assignedTo: data.assignedTo || '',
        intentId: `${data.intentId}` || '',
        category: `${data.category}` || '',
        deidentifiedInput: data.deidentifiedInput || '',
        notes: data.notes || '',
        jiraIds: data.jiraIdsString, // this.jiraIdsStringToArray(data.jiraIdsString),
        appSpecificData: data.appSpecificData || '',
        annotationAccountId: this.props.appModel.accountId,
        datestamp: data.dateStamp,
        datestampModified: data.datestampModified,
        revision: data.revision || 0,
      }
      this.props.clicked(action, annotationData)
    }
  }

  onDropdownChanged = (name: string, data: any) => {
    const stateObject: any = {}
    let propertyName: string = name
    if (propertyName === 'intentIdDropdown') {
      propertyName = 'intentId'
    }
    stateObject[propertyName] = data
    this.setState(stateObject, () => {
      // console.log(`Annotation: onDropdownChanged`, this.state);
    })
  };

  render () {
    const typeOptions = [
      { label: 'qa', value: QuestionType.Qa },
      { label: 'user', value: QuestionType.User },
      { label: 'auto', value: QuestionType.Auto }
    ]
    const typeSelected = { label: this.state.type, value: this.state.type }

    const statusOptions = [
      { label: 'open', value: AnnotationStatus.Open },
      { label: 'triaged', value: AnnotationStatus.Triaged },
      { label: 'fixed', value: AnnotationStatus.Fixed },
      { label: 'wontFix', value: AnnotationStatus.WontFix },
      { label: 'verified', value: AnnotationStatus.Verified },
      { label: 'closed', value: AnnotationStatus.Closed },
      { label: 'deleted', value: AnnotationStatus.Deleted }
    ]
    const statusSelected = { label: this.state.status, value: this.state.status }

    const issueTypeOptions = [
      { label: IssueType.WrongAnswer, value: IssueType.WrongAnswer },
      { label: IssueType.MissingAnswer, value: IssueType.MissingAnswer },
      { label: IssueType.InadequateAnswer, value: IssueType.InadequateAnswer },
      { label: IssueType.Other, value: IssueType.Other },
      { label: IssueType.NoIssue, value: IssueType.NoIssue }
    ]
    const issueTypeSelected = { label: this.state.issueType, value: this.state.issueType }

    const priorityOptions = [
      { label: PriorityType.Low, value: PriorityType.Low },
      { label: PriorityType.High, value: PriorityType.High },
      { label: PriorityType.Urgent, value: PriorityType.Urgent },
      { label: PriorityType.Critical, value: PriorityType.Critical }
    ]
    const prioritySelected = { label: this.state.priority, value: this.state.priority }

    const accountId: string = this.props.appModel.accountId
    const dateFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    } as Intl.DateTimeFormatOptions
    const dateCreated = new Date(this.state.datestamp)
    const dateCreatedString: string = this.state.datestamp
      ? dateCreated.toLocaleDateString('en-US', dateFormatOptions)
      : ''
    const dateModified = new Date(this.state.datestampModified)
    const dateModifiedString: string = this.state.datestampModified
      ? dateModified.toLocaleDateString('en-US', dateFormatOptions)
      : ''

    const intentIdOptions: any[] = []
    let intentIdSelected = { label: '', value: '' }
    intentIdOptions.push({ label: '', value: '' })
    if (this.state.appMetadata && this.state.appMetadata.intents) {
      this.state.appMetadata.intents.forEach((intent: any) => {
        const option: any = { label: `${intent.intentId}: ${intent.intentDetail}`, value: intent.intentId }
        intentIdOptions.push(option)
        if (intent.intentId === this.state.intentId) {
          intentIdSelected = option
        }
      })
    }

    return (
      <div id="annotationContainer" className="LimaAppDashboardContainer">
        <label className="containerHeader">Annotation</label>

        <label className="annotation">ClientId</label>
        <input name="clientId" value={this.state.clientId} readOnly />

        <label className="annotation">AppName</label>
        <input name="appName" value={this.state.appName} readOnly />

        <label>AccountId</label>
        <input name="accountId" value={accountId} readOnly />

        <label className="annotation">TransactionId</label>
        <input name="transactionId" value={this.state.transactionId} readOnly />

        <label className="annotation">AnnotationId</label>
        <input name="id" value={this.state.id} readOnly />

        <label className="annotation">Date Created</label>
        <input name="dateCreated" value={dateCreatedString} readOnly />

        <label className="annotation">Date Modified</label>
        <input name="dateModified" value={dateModifiedString} readOnly />

        <label>Type</label>
        <Dropdown name="type" options={typeOptions} selectedOption={typeSelected} changed={this.onDropdownChanged} />

        <label>Status</label>
        <Dropdown
          name="status"
          options={statusOptions}
          selectedOption={statusSelected}
          changed={this.onDropdownChanged}
        />

        <label>Issue Type</label>
        <Dropdown
          name="issueType"
          options={issueTypeOptions}
          selectedOption={issueTypeSelected}
          changed={this.onDropdownChanged}
        />

        <label>Priority</label>
        <Dropdown
          name="priority"
          options={priorityOptions}
          selectedOption={prioritySelected}
          changed={this.onDropdownChanged}
        />

        <label>AssignedTo</label>
        <input name="assignedToId" value={this.state.assignedTo} readOnly />

        <label className="annotation">IntentId</label>
        <input name="intentId" value={this.state.intentId} onChange={this.onChange} />

        <label className="annotation">Intent Lookup</label>
        <Dropdown
          name="intentIdDropdown"
          options={intentIdOptions}
          selectedOption={intentIdSelected}
          changed={this.onDropdownChanged}
        />

        <label className="highlightedYellow">Deidentified Input</label>
        <input
          name="deidentifiedInput"
          className="highlightedYellow"
          value={this.state.deidentifiedInput}
          onChange={this.onChange}
        />

        <label className="highlightedBlue">Notes</label>
        <textarea
          name="notes"
          className="highlightedBlue"
          rows={10}
          value={this.state.notes}
          onChange={this.onChange}
       />

        <label className="annotation">Jira Ids</label>
        <input name="jiraIdsString" value={this.state.jiraIdsString} onChange={this.onChange} />

        <button
          name="submitAnnotation"
          className="containerColumn2 submitButton"
          onClick={() => {
            this.onClick('submitAnnotation', this.state)
          }}
        >
          Submit Annotation
        </button>
      </div>
    )
  }
}
