import * as React from 'react'
import './Search.css'
import Dropdown from '../Dropdown/Dropdown'
import Checkbox from '../Checkbox/Checkbox'
import Model from '../../model/Model'
import { IssueType, PriorityType, QuestionType } from '../../types'

export interface SearchProps {
  appModel: Model;
  appName: string;
  clicked: any;
  changed: any;
  accountId: string;
}

export interface SearchState {
  database: string;
  type: string;
  clientId: string;
  appName: string;
  appVersion: string;
  serviceType: string;
  accountId: string;
  sessionId: string;
  id: string;
  intentId: string;
  category: string;

  environment: string;

  annotationId: string;
  status: any;
  issueType: string;
  priority: string;
  assignedTo: string;
  jiraId: string;
}

const emptyState = {
  database: 'transactions',
  type: '',
  clientId: '',
  appName: '',
  appVersion: '',
  serviceType: '',
  accountId: '',
  sessionId: '',
  id: '',
  intentId: '',
  category: '',

  environment: '',

  annotationId: '',
  status: {
    open: false,
    triaged: false,
    fixed: false,
    wontFix: false,
    verified: false,
    closed: false,
    deleted: false
  },
  issueType: '',
  priority: '',
  assignedTo: '',
  jiraId: ''
}

export class Search extends React.Component<SearchProps, SearchState> {
  constructor (props: SearchProps) {
    super(props)

    emptyState.appName = this.props.appName
    this.state = emptyState
  }

  UNSAFE_componentWillReceiveProps (nextProps: SearchProps) {
    if (nextProps.appName !== this.state.appName) {
      this.setState({
        appName: nextProps.appName
      })
    }
  }

  onBlur = (event: any) => {};

  onChange = (event: any) => {
    const nativeEvent: any = event.nativeEvent
    const stateObject: any = {}
    const propertyName: string = nativeEvent.target.name
    stateObject[propertyName] = nativeEvent.target.value
    this.setState(stateObject)
  };

  onClick = (action: string, event: any) => {
    if (action === 'submitSearch') {
      if (this.props.clicked) {
        this.props.clicked(action, this.state, event)
      }
    }
  };

  clearSearch = () => {
    this.setState(emptyState)
  };

  onDropdownChanged = (name: string, data: any) => {
    const stateObject: any = {}
    const propertyName: string = name
    stateObject[propertyName] = data
    this.setState(stateObject, () => {
      if (propertyName === 'appName') {
        if (this.props.changed) {
          this.props.changed('updateAppName', data)
        }
      }
    })
  };

  onCheckboxChanged = (label: string, isChecked: boolean) => {
    const statusObject: any = this.state.status
    statusObject[label] = isChecked
    this.setState({
      status: statusObject
    })
  };

  render () {
    const databaseOptions = [
      { label: 'annotations', value: 'annotations' },
      { label: 'transactions', value: 'transactions' }
    ]
    const databaseSelected = { label: this.state.database, value: this.state.database }

    const appNameOptions = [{ label: '', value: '' }]
    const appNames: string[] = this.props.appModel.getAppNames()
    appNames.forEach((appName: string) => {
      appNameOptions.push({ label: appName, value: appName })
    })
    const appNameSelected = { label: this.state.appName, value: this.state.appName }

    const typeOptions = [
      { label: '', value: '' },
      { label: QuestionType.Qa, value: QuestionType.Qa },
      { label: QuestionType.User, value: QuestionType.User },
      { label: QuestionType.Auto, value: QuestionType.Auto }
    ]
    const typeSelected = { label: this.state.type, value: this.state.type }

    const issueTypeOptions = [
      { label: '', value: '' },
      { label: IssueType.WrongAnswer, value: IssueType.WrongAnswer },
      { label: IssueType.MissingAnswer, value: IssueType.MissingAnswer },
      { label: IssueType.Other, value: IssueType.Other },
      { label: IssueType.NoIssue, value: IssueType.NoIssue }
    ]
    const issueTypeSelected = { label: this.state.issueType, value: this.state.issueType }

    const priorityOptions = [
      { label: '', value: '' },
      { label: PriorityType.Low, value: PriorityType.Low },
      { label: PriorityType.High, value: PriorityType.High },
      { label: PriorityType.Urgent, value: PriorityType.Urgent },
      { label: PriorityType.Critical, value: PriorityType.Critical }
    ]
    const prioritySelected = { label: this.state.priority, value: this.state.priority }

    const assignedToOptions = [
      { label: '', value: '' },
      { label: 'unassigned', value: 'unassigned' }
    ]

    const assignedToEmail: string = this.props.appModel.accountId
    const assignedToSelected = { label: assignedToEmail, value: this.state.assignedTo }

    const commonFields: any = (
      <>
        <label>Database</label>
        <Dropdown
          name="database"
          options={databaseOptions}
          selectedOption={databaseSelected}
          changed={this.onDropdownChanged}
        />

        <label className="search">Id</label>
        <input name="id" value={this.state.id} onChange={this.onChange} />

        <label className="search">SessionId</label>
        <input name="sessionId" value={this.state.sessionId} onChange={this.onChange} />

        <label className="search">ClientId</label>
        <input name="clientId" value={this.state.clientId} onChange={this.onChange} />

        <label className="search">AppName</label>
        {/* <input name="appName" value={this.state.appName} onChange={this.onChange} /> */}
        <Dropdown
          name="appName"
          options={appNameOptions}
          selectedOption={appNameSelected}
          changed={this.onDropdownChanged}
        />

        <label className="search">ServiceType</label>
        <input name="serviceType" value={this.state.serviceType} onChange={this.onChange} />

        {/* <label className="search">IntentId</label>
        <input name="intentId" value={this.state.intentId} onChange={this.onChange} />

        <label className="search">Category</label>
        <input name="category" value={this.state.category} onChange={this.onChange} /> */}

        <label>Type</label>
        <Dropdown name="type" options={typeOptions} selectedOption={typeSelected} changed={this.onDropdownChanged} />
      </>
    )

    let annotationFields: any
    if (this.state.database === 'annotations') {
      annotationFields = (
        <>
          <label className="search">AnnotationId</label>
          <input name="annotationId" value={this.state.annotationId} onChange={this.onChange} />

          <label>Status</label>

          <div id="statusCheckboxGroup">
            <Checkbox label={'open'} isChecked={this.state.status.open} changed={this.onCheckboxChanged} />
            <Checkbox label={'triaged'} isChecked={this.state.status.triaged} changed={this.onCheckboxChanged} />
            <Checkbox label={'fixed'} isChecked={this.state.status.fixed} changed={this.onCheckboxChanged} />
            <Checkbox label={'wontFix'} isChecked={this.state.status.wontFix} changed={this.onCheckboxChanged} />
            <Checkbox label={'verified'} isChecked={this.state.status.verified} changed={this.onCheckboxChanged} />
            <Checkbox label={'closed'} isChecked={this.state.status.closed} changed={this.onCheckboxChanged} />
            <Checkbox label={'deleted'} isChecked={this.state.status.deleted} changed={this.onCheckboxChanged} />
          </div>

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
          <Dropdown
            name="assignedTo"
            options={assignedToOptions}
            selectedOption={assignedToSelected}
            changed={this.onDropdownChanged}
          />

          <label className="search">JiraId</label>
          <input name="jiraId" value={this.state.jiraId} onChange={this.onChange} />
        </>
      )
    }

    const searchControls: any = (
      <>
        <div id="searchButtonsContainer" className="containerColumn2">
          <button
            name="submitSearch"
            className="submitButton"
            onClick={(event) => {
              this.onClick('submitSearch', event)
            }}
          >
            Submit Search
          </button>
          <button name="clearSearch" className="submitButton" onClick={this.clearSearch}>
            Clear Search
          </button>
        </div>
      </>
    )

    return (
      <div id="searchContainer">
        {commonFields}
        {annotationFields}
        {searchControls}
      </div>
    )
  }
}
