import React from 'react';
import './LimaAppDashboard.css';
import Model from '../../model/Model';
import LimaSocketClientController from '../../lima-service/LimaSocketClientController';
import { LimaAppOptions } from '../../model/AppSettings'
import { AnnotationData, InputData, SearchResultsData, TransactionData } from '../../types';
import { Input } from '../Input/Input'
import { Transaction } from '../Transaction/Transaction'
import { Annotation } from '../Annotation/Annotation'
import { Search } from '../Search/Search';
import { SearchResults } from '../Search/SearchResults';


function LimaAppDashboard({ model }: { model: Model }) {

  const [limaServiceClient, setLimaServiceClient] = React.useState<LimaSocketClientController | undefined>(undefined)
  const [statusMessages, setStatusMessages] = React.useState<string>('<statusMessages>')
  const [textInput, setTextInput] = React.useState<string>('hello world.')

  const settings = model.settings.LimaAppOptions
  const [serviceUrl, setServiceUrl] = React.useState<string>(settings.serviceUrl)
  const [authUrl, setAuthUrl] = React.useState<string>(settings.authUrl)
  const [clientAccountId, setControllerAccountId] = React.useState<string>(settings.clientAccountId)
  const [clientPassword, setClientPassword] = React.useState<string>(settings.clientPassword)

  const [inputPanelMode, setInputPanelMode] = React.useState<string>('search')
  const [inputData, setInputData] = React.useState<InputData>(model.inputData)

  const [transactionData, setTransactionData] = React.useState<TransactionData>(model.transactionData)
  const [annotationData, setAnnotationData] = React.useState<AnnotationData>(model.annotationData)

  const [searchResultsData, setSearchResultsData] = React.useState<SearchResultsData>({
    database: "",
    status: "",
    result: [],
  })
  const [searchResultsActiveTransactionId, setSearchResultsActiveTransactionId] = React.useState<any>({})
  const [intentIdFilter, setIntentIdFilter] = React.useState<any>({})
  const [sessionIdFilter, setSessionIdFilter] = React.useState<any>({})

  const statusMessageHandler = (args: any) => {
    console.log('statusMessageHandler:', args)
    if (typeof args === 'string') {
      setStatusMessages(statusMessages + '\n' + args)
    } else if (Array.isArray(args)) {
      let result: string = ''
      args.forEach((arg: any) => {
        if (typeof arg === 'string') {
          result += arg + '\n'
        } else if (typeof arg === 'object') {
          result += JSON.stringify(arg, null, 2) + '\n'
        }
      })
      setStatusMessages(statusMessages + '\n' + result)
    }
  }

  React.useEffect(() => {
    if (limaServiceClient) {
      limaServiceClient.connect()
      limaServiceClient.on('statusMessage', statusMessageHandler)
    }
  }, [limaServiceClient, statusMessageHandler]);

  const submitAnnotation = (data: AnnotationData) => {
    setStatusMessages(statusMessages + '\n' + 'submitAnnotation: annotation submitted.')
    model
      .submitAnnotationData(data)
      .then((annotationData: AnnotationData) => {
        // console.log(annotationData);
        if (annotationData) {
          setAnnotationData(annotationData)
          setStatusMessages(statusMessages + '\n' + 'submitAnnotation: annotation response received.')
        } else {
          setStatusMessages(statusMessages + '\n' + 'submitAnnotation: received invalid annotation data in response.')
        }
      })
      .catch((error: any) => {
        console.log(error)
        setStatusMessages(statusMessages + '\n' + error)
      })
  }

  const onButtonClicked = (action: string, data?: any, event?: any) => {
    event?.preventDefault();
    console.log(`onButtonClicked:`, action)
    switch (action) {
      case 'inputPanelMode':
        setInputPanelMode(data)
        break
      case 'submitAnnotation':
        console.log('LimaAppDashboard: submitAnnotation', data);
        submitAnnotation(data)
        break
      case 'submitSearch':
        console.log(`onButtonClicked: submitSearch:`, data)
        model.submitSearchData(data)
          .then((searchResults: SearchResultsData) => {
            console.log(`LimaAppDashboard: searchResults:`, searchResults)
            setSearchResultsData(searchResults)
            setSearchResultsActiveTransactionId('')
            setIntentIdFilter('')
            setSessionIdFilter('')
            setInputPanelMode('results')
          })
          .catch((error: any) => {
            console.log(error)
            setStatusMessages(statusMessages + '\n' + error)
          })
        break;
      case 'searchResultSelected':
        // console.log(action, data);
        if (Model.isTransactionData(data)) {
          let tempTransactionData: TransactionData | undefined
          let tempAnnotationData: AnnotationData | undefined
          model.submitSearchData({ database: 'transactions', id: data.id })
            .then((searchResults: SearchResultsData) => {
              console.log(searchResults);
              if (searchResults && searchResults.result && searchResults.result.length === 1) {
                tempTransactionData = searchResults.result[0] as any
                if (tempTransactionData) {
                  setTransactionData(tempTransactionData)
                  setSearchResultsActiveTransactionId(tempTransactionData.id)

                  // look up the associated annotation if it exists
                  model.submitSearchData({ database: 'annotations', transactionId: tempTransactionData.id })
                    .then((searchResults: SearchResultsData) => {
                      // console.log(searchResults);
                      if (searchResults && searchResults.result && searchResults.result.length === 1) {
                        tempAnnotationData = searchResults.result[0] as any
                      } else {
                        // new annotation data for transaction
                        tempAnnotationData = model.resetAnnotationData(
                          tempTransactionData!.sessionId,
                          tempTransactionData!.id,
                          tempTransactionData!.intentId,
                          tempTransactionData!.appName
                        )
                      }
                      if (tempAnnotationData) setAnnotationData(tempAnnotationData)
                    })
                    .catch((error: any) => {
                      console.log(error)
                      setStatusMessages(statusMessages + '\n' + error)
                    })
                }
              }
            })
            .catch((error: any) => {
              console.log(error)
              setStatusMessages(statusMessages + '\n' + error)
            })
        } else if (Model.isAnnotationData(data)) {
          let tempTransactionData: TransactionData | undefined
          let tempAnnotationData: AnnotationData | undefined
          model.submitSearchData({ database: 'annotations', id: data.id })
            .then((searchResults: SearchResultsData) => {
              // console.log(searchResults);
              if (searchResults && searchResults.result && searchResults.result.length === 1) {
                tempAnnotationData = searchResults.result[0] as any
                if (tempAnnotationData) setAnnotationData(tempAnnotationData)
                // look up the associated transaction if it exists
                model.submitSearchData({ database: 'transactions', id: tempAnnotationData!.transactionId })
                  .then((searchResults: SearchResultsData) => {
                    // console.log(searchResults);
                    if (searchResults && searchResults.result && searchResults.result.length === 1) {
                      tempTransactionData = searchResults.result[0] as any
                      if (tempTransactionData) setTransactionData(tempTransactionData)
                      setSearchResultsActiveTransactionId(tempTransactionData!.id)
                    } else {
                      setStatusMessages(statusMessages + '\n' + 'no transaction data.')
                    }
                  })
                  .catch((error: any) => {
                    console.log(error)
                    setStatusMessages(statusMessages + '\n' + error)
                  })
              } else {
                setStatusMessages(statusMessages + '\n' + 'no annotation data.')
              }
            })
            .catch((error: any) => {
              console.log(error)
              setStatusMessages(statusMessages + '\n' + error)
            })
        }
        break
    }
  }

  const onChangeHandler = (event: any) => {
    const nativeEvent: any = event.nativeEvent;
    switch (nativeEvent.target.id) {
      case 'textInput':
        setTextInput(nativeEvent.target.value)
        break;
    }
  }

  const onBlurHandler = (event: any) => {
  }

  let inputSearchContents: any
  switch (inputPanelMode) {
    case 'input':
      inputSearchContents = (
        <Input
          data={inputData}
          appModel={model}
          clicked={onButtonClicked}
          changed={onChangeHandler}
          chatData={model.chatData}
          metadata={model.getMetadata()}
        />
      )
      break
    case 'search':
      inputSearchContents = (
        <div>
          <Search
            appModel={model}
            appName={model.inputAppName}
            clicked={onButtonClicked}
            changed={onChangeHandler}
            accountId={model.accountId}
          />
        </div>
      )
      break
    case 'results':
      inputSearchContents = (
        <div>
          <SearchResults
            data={searchResultsData}
            activeTransactionId={searchResultsActiveTransactionId}
            intentIdFilter={intentIdFilter}
            sessionIdFilter={sessionIdFilter}
            clicked={onButtonClicked}
            changed={onChangeHandler}
          />
        </div>
      )
      break
  }

  const navButtonData: any[] = [
    { label: 'Input', value: 'input' },
    { label: 'Search', value: 'search' },
    { label: 'Results', value: 'results' }
  ]
  const navButtons: any[] = []
  navButtonData.forEach((buttonData: any) => {
    const selectedClass: string = inputPanelMode === buttonData.value ? 'modeSelected' : ''
    navButtons.push(
      <button
        key={buttonData.value}
        className={`inputPanelButton ${selectedClass}`}
        onClick={() => {
          onButtonClicked('inputPanelMode', buttonData.value)
        }}
      >
        {buttonData.label}
      </button>
    )
  })


  return (
    <div id="LimaAppDashboard" className="LimaAppDashboard">
      <div id="LimaAppDashboardContents" className="LimaAppDashboardContents">
        <div id="inputSearchContainer" className="LimaAppDashboardContainer">
          <div id="inputSearchMenu">{navButtons}</div>
          <div id="inputSearchContents">{inputSearchContents}</div>
        </div>
        <div id="reviewContainer">
          <Transaction appModel={model} data={transactionData} />
          <Annotation
            appModel={model}
            data={annotationData}
            accountId={model.accountId}
            clicked={onButtonClicked}
            changed={onChangeHandler}
            metadata={model.getMetadata()}
          />
        </div>
      </div>
      <div id="LimaAppDashboardStatus" className="LimaAppDashboardContainer LimaAppDashboardStatus">{statusMessages}</div>
    </div>
  );
}

export default LimaAppDashboard;
