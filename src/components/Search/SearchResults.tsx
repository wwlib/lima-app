import * as React from 'react'
import './Search.css'
import { TransactionData, AnnotationData, SearchResultsData } from '../../types'
import Model from '../../model/Model'
import Dropdown from '../Dropdown/Dropdown'

export interface SearchResultsProps {
    data: SearchResultsData;
    activeTransactionId: string;
    intentIdFilter: string;
    sessionIdFilter: string;
    clicked: any;
    changed: any;
}

export interface SearchResultsState {
    status: string;
    database: string;
    results: TransactionData[] | AnnotationData[];
    activeTransactionId: string;
    intentIds: any;
    intentIdFilter: string;
    intentIdFilterData: any;
    sessionIds: any;
    sessionIdFilter: string;
    sessionIdFilterData: any;
}

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
  constructor (props: SearchResultsProps) {
    super(props)
    let intentIdDictionary: any = {}
    let intentIdFilterData: any = {}
    if (props.data.result) {
      intentIdDictionary = this.getIntentIdDictionaryWithResults(props.data.result)
      intentIdFilterData = this.getIntentIdFilterData(props.data.result, props.intentIdFilter)
    }

    let sessionIdDictionary: any = {}
    let sessionIdFilterData: any = {}
    if (props.data.result) {
      sessionIdDictionary = this.getSessionIdDictionaryWithResults(props.data.result)
      sessionIdFilterData = this.getSessionIdFilterData(props.data.result, props.sessionIdFilter)
    }

    console.log(`SearchResults: this.props.data.result:`, this.props.data.result)

    this.state = {
      status: this.props.data.status,
      database: this.props.data.database,
      results: this.props.data.result,
      activeTransactionId: this.props.activeTransactionId,
      intentIds: intentIdDictionary,
      intentIdFilter: props.intentIdFilter,
      intentIdFilterData: intentIdFilterData,
      sessionIds: sessionIdDictionary,
      sessionIdFilter: props.sessionIdFilter,
      sessionIdFilterData: sessionIdFilterData
    }
  }

  getIntentIdDictionaryWithResults (results: TransactionData[] | AnnotationData[]) {
    const intentIdDictionary: any = {}
    results.forEach((result: TransactionData | AnnotationData) => {
      const count: number = intentIdDictionary[result.intentId]
      if (count) {
        intentIdDictionary[result.intentId] = count + 1
      } else {
        intentIdDictionary[result.intentId] = 1
      }
    })
    return intentIdDictionary
  }

  getSessionIdDictionaryWithResults (results: TransactionData[] | AnnotationData[]) {
    const sessionIdDictionary: any = {}
    results.forEach((result: TransactionData | AnnotationData) => {
      const count: number = sessionIdDictionary[result.sessionId]
      if (count) {
        sessionIdDictionary[result.sessionId] = count + 1
      } else {
        sessionIdDictionary[result.sessionId] = 1
      }
    })
    return sessionIdDictionary
  }

  UNSAFE_componentWillReceiveProps (nextProps: SearchResultsProps) {
    if (nextProps.data !== this.props.data || nextProps.activeTransactionId !== this.props.activeTransactionId || nextProps.intentIdFilter !== this.props.intentIdFilter) {
      const intentIdDictionary: any = this.getIntentIdDictionaryWithResults(nextProps.data.result)
      const sessionIdDictionary: any = this.getSessionIdDictionaryWithResults(nextProps.data.result)
      this.setState({
        status: nextProps.data.status,
        database: nextProps.data.database,
        results: nextProps.data.result,
        activeTransactionId: nextProps.activeTransactionId,

        intentIds: intentIdDictionary,
        intentIdFilterData: this.getIntentIdFilterData(nextProps.data.result, nextProps.intentIdFilter),
        intentIdFilter: nextProps.intentIdFilter,

        sessionIds: sessionIdDictionary,
        sessionIdFilterData: this.getSessionIdFilterData(nextProps.data.result, nextProps.sessionIdFilter),
        sessionIdFilter: nextProps.sessionIdFilter
      })
    }
  }

  public onClick (action: string, data: any) {
    if (this.props.clicked) {
      this.props.clicked(action, data)
    }
  }

  getIntentIdFilterData (results: any[], intentIdFilter: string) {
    // console.log(`getFilterData: ${intentIdFilter}`);
    const intentIdFilterData: any = {
      intentId: intentIdFilter,
      count: 0,
      ids: []
    }

    results.forEach((result: TransactionData | AnnotationData) => {
      if (!intentIdFilter || `${result.intentId}` === intentIdFilter) {
        if (Model.isTransactionData(result)) {
          const data: TransactionData = result as TransactionData
          intentIdFilterData.count += 1
          intentIdFilterData.ids.push(data.id)
        } else if (Model.isAnnotationData(result)) {
          const data: AnnotationData = result as AnnotationData
          intentIdFilterData.count += 1
          intentIdFilterData.ids.push(data.id)
        }
      }
    })
    return intentIdFilterData
  }

  getSessionIdFilterData (results: any[], sessionIdFilter: string) {
    // console.log(`getFilterData: ${sessionIdFilter}`);
    const sessionIdFilterData: any = {
      sessionId: sessionIdFilter,
      count: 0,
      transactionIds: []
    }
    results.forEach((result: TransactionData | AnnotationData) => {
      if (!sessionIdFilter || `${result.sessionId}` === sessionIdFilter) {
        if (Model.isTransactionData(result)) {
          const data: TransactionData = result as TransactionData
          sessionIdFilterData.count += 1
          sessionIdFilterData.transactionIds.push(data.id)
        } else if (Model.isAnnotationData(result)) {
          const data: AnnotationData = result as AnnotationData
          sessionIdFilterData.count += 1
          sessionIdFilterData.transactionIds.push(data.id)
        }
      }
    })
    return sessionIdFilterData
  }

    onDropdownChanged = (name: string, data: any) => {
      const stateObject: any = {
      }
      const propertyName: string = name
      stateObject[propertyName] = data
      if (propertyName === 'intentIdFilter') {
        if (this.props.changed) {
          this.props.changed('updateIntentIdFilter', data)
        }
      } else if (propertyName === 'sessionIdFilter') {
        if (this.props.changed) {
          this.props.changed('updateSessionIdFilter', data)
        }
      }
      this.setState(stateObject)
    }

    render () {
      const links: any[] = []
      let header: any
      if (this.state.database === 'transactions') {
        const sessionIdOptions = [{ label: '', value: '' }]
        const sessionIdKeys: string[] = Object.keys(this.state.sessionIds).sort()
        sessionIdKeys.forEach((sessionIdKey: string) => {
          const label: string = `${sessionIdKey} (${this.state.sessionIds[sessionIdKey]})`
          sessionIdOptions.push({ label: label, value: sessionIdKey })
        })
        const sessionIdSelected = { label: this.state.sessionIdFilter, value: this.state.sessionIdFilter }

        header = <div>
                <div className='searchResultLinksHeader'>
                    <div className='linkHeaderField sessionId'>
                        {'sessionId'}
                        <Dropdown name="sessionIdFilter" options={sessionIdOptions} selectedOption={sessionIdSelected} changed={this.onDropdownChanged} />
                    </div>
                </div>
                <div
                    key={'header'}
                    className="searchResultLinksHeader">
                    <div className='linkHeaderField linkIndex'>{'#'}</div>
                    <div className='linkHeaderField linkId'>{'id'}</div>
                    <div className='linkHeaderField linkIntentId'>{'intent'}</div>
                    <div className='linkHeaderField linkType'>{'type'}</div>
                    <div className='linkHeaderField linkConfidence'>{'conf'}</div>
                    <div className='linkHeaderField linkInput'>{'input'}</div>
                </div>
            </div>
      } else if (this.state.database === 'annotations') {
        const intentIdOptions = [{ label: '', value: '' }]
        const intentIdKeys: string[] = Object.keys(this.state.intentIds).sort()

        intentIdKeys.forEach((intentIdKey: string) => {
          const label: string = `${intentIdKey} (${this.state.intentIds[intentIdKey]})`
          intentIdOptions.push({ label: label, value: intentIdKey })
        })
        const intentIdSelected = { label: this.state.intentIdFilter, value: this.state.intentIdFilter }

        header = <div
                key={'header'}
                className="searchResultLinksHeader">
                <div className='linkHeaderField linkIndex'>{'#'}</div>
                <div className='linkHeaderField linkId'>{'id'}</div>
                <div className='linkHeaderField linkIntentId'>
                    {'intent'}
                    <Dropdown name="intentIdFilter" options={intentIdOptions} selectedOption={intentIdSelected} changed={this.onDropdownChanged} />
                </div>
                <div className='linkHeaderField linkType'>{'type'}</div>
                <div className='linkHeaderField linkPriority'>{'priority'}</div>
                <div className='linkHeaderField linkIssueType'>{'issueType'}</div>
                <div className='linkHeaderField linkStatus'>{'status'}</div>
            </div>
      }
      let linkIndex: number = 1
      this.state.results.sort((a: any, b: any) => a.datestamp - b.datestamp ) // sort by date
      this.state.results.forEach((result: TransactionData | AnnotationData) => {
        let link: any
        if (Model.isTransactionData(result)) {
          const data: TransactionData = result as TransactionData
          const id = data.id ? data.id.substring(0, 8) : 'na'
          const activeClass: string = (data.id === this.state.activeTransactionId) ? 'active' : ''
          const intentDetail = data.intentDetail // .substring(0, 30);
          const input = data.input
          link = undefined
          if (!this.state.sessionIdFilter || `${result.sessionId}` === this.state.sessionIdFilter) {
            link = <div
                        key={linkIndex}
                        className={`searchResultLink ${activeClass}`}
                        onClick={() => { this.onClick('searchResultSelected', data) }}>
                        <div className='linkField linkIndex'>{`${linkIndex++}`}</div>
                        <div className='linkField linkId'>{`${id}`}</div>
                        <div className='linkField linkIntentId'>{`${data.intentId}`}</div>
                        <div className='linkField linkType'>{`${data.type}`}</div>
                        <div className='linkField linkConfidence'>{`${data.confidence}`}</div>
                        <div className='linkField linkInput'>{`${input}`}</div>
                    </div>
          }
        } else if (Model.isAnnotationData(result)) {
          const data: AnnotationData = result as AnnotationData
          const id = data.transactionId.substring(0, 8)
          const activeClass: string = (data.transactionId === this.state.activeTransactionId) ? 'active' : ''
          link = undefined
          if (!this.state.intentIdFilter || `${result.intentId}` === this.state.intentIdFilter) {
            link = <div
                        key={linkIndex}
                        className={`searchResultLink ${activeClass}`}
                        onClick={() => { this.onClick('searchResultSelected', data) }}>
                        <div className='linkField linkIndex'>{`${linkIndex++}`}</div>
                        <div className='linkField linkId'>{`${id}`}</div>
                        <div className='linkField linkIntentId'>{`${data.intentId}`}</div>
                        <div className='linkField linkType'>{`${data.type}`}</div>
                        <div className='linkField linkPriority'>{`${data.priority}`}</div>
                        <div className='linkField linkIssueType'>{`${data.issueType}`}</div>
                        <div className='linkField linkStatus'>{`${data.status}`}</div>
                    </div>
          }
        }
        if (link) {
          links.push(link)
        }
      })

      return <div id="searchResultsContainer">
            {/* <label className="containerHeader">Search Results</label> */}
            {header}
            <div id='searchResultLinks'>
                {links}
            </div>
            <div id='searchResultData'>
                <textarea value={JSON.stringify(this.state.intentIdFilterData, null, 2)} readOnly ></textarea>
            </div>
        </div>
    }
}
