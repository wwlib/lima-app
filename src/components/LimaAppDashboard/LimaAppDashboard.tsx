import React from 'react';
import './LimaAppDashboard.css';
import Model from '../../model/Model';
import LimaClientController from '../../model/LimaClientController';
import { LimaAppOptions } from '../../model/AppSettings'


function LimaAppDashboard({ model }: { model: Model }) {

    const [limaServiceClient, setLimaServiceClient] = React.useState<LimaClientController | undefined>(undefined)
    const [messages, setMessages] = React.useState<string>('<messages>')
    const [textInput, setTextInput] = React.useState<string>('hello world.')

    const settings = model.settings.LimaAppOptions
    const [serviceUrl, setServiceUrl] = React.useState<string>(settings.serviceUrl)
    const [authUrl, setAuthUrl] = React.useState<string>(settings.authUrl)
    const [clientAccountId, setControllerAccountId] = React.useState<string>(settings.clientAccountId)
    const [clientPassword, setClientPassword] = React.useState<string>(settings.clientPassword)

    const statusMessageHandler = (args: any) => {
        console.log('statusMessageHandler:', args)
        if (typeof args === 'string') {
            setMessages(messages + '\n' + args)
        } else if (Array.isArray(args)) {
            let result: string = ''
            args.forEach((arg: any) => {
                if (typeof arg === 'string') {
                    result += arg + '\n'
                } else if (typeof arg === 'object') {
                    result += JSON.stringify(arg, null, 2) + '\n'
                }
            })
            setMessages(messages + '\n' + result)
        }
    }

    React.useEffect(() => {
        if (limaServiceClient) {
            limaServiceClient.connect()
            limaServiceClient.on('statusMessage', statusMessageHandler)
        }
    }, [limaServiceClient]);

    const onButtonClicked = (action: string, event: any) => {
        event.preventDefault();
        console.log(`onButtonClicked:`, action)
        switch (action) {
            case 'Connect':
                setLimaServiceClient(model.getLimaClientController(serviceUrl, authUrl, clientAccountId, clientPassword, true))
                break;
            case 'SendText':
                if (limaServiceClient) {
                    const commandData = {
                        type: 'nlu',
                        name: 'text',
                        payload: {
                            clientId: 'lima-app',
                            sessionId: '', // TODO: add sessionId
                            input: textInput,
                            inputData: {},
                            type: 'device',
                            serviceType: 'gpt3text',
                            appName: 'gpt3text/robo-chitchat-jan-2023',
                            accountId: clientAccountId,
                            environment: 'environment', // TODO: get this value from somewhere. env?
                        }
                    }
                    limaServiceClient.sendCommand(commandData) // TODO: get the targetAccountId from somewhere (form/login)
                }
                break;
        }
    }

    const onChangeHandler = (event: any) => {
        const nativeEvent: any = event.nativeEvent;
        let updateObj: any = undefined;
        switch (nativeEvent.target.id) {
            case 'serviceUrl':
                setServiceUrl(nativeEvent.target.value)
                break;
            case 'authUrl':
                setAuthUrl(nativeEvent.target.value)
                break;
            case 'clientAccountId':
                setControllerAccountId(nativeEvent.target.value)
                break;
            case 'clientPassword':
                setClientPassword(nativeEvent.target.value)
                break;
            case 'textInput':
                setTextInput(nativeEvent.target.value)
                break;
        }
    }

    const onBlurHandler = (event: any) => {
        // this.props.changed(this.state);
        const settings: LimaAppOptions = {
            serviceUrl: serviceUrl,
            authUrl: authUrl,
            clientAccountId: clientAccountId,
            clientPassword: clientPassword,
        }
        model.setAppSettings({ LimaAppOptions: settings })
    }

    return (
        <div className="LimaAppDashboard">
            <div className="LimaAppDashboard-row">
                <textarea className="LimaAppDashboard-messages" value={messages} readOnly rows={16} />
            </div>
            <div className="LimaAppDashboard-row">
                <form className='form' role='form' onSubmit={(event: any) => { onButtonClicked('SendText', event) }}>
                    <input id='textInput' type='text' className='form-control' placeholder='input' value={textInput} onChange={onChangeHandler} onBlur={onBlurHandler} />
                </form>
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('SendText', event)}>
                    SendText
                </button>
            </div>
            <div className="LimaAppDashboard-row">
                Service URL:
                <input id='serviceUrl' type='text' className='form-control' placeholder='serviceUrl' value={serviceUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Auth URL:
                <input id='authUrl' type='text' className='form-control' placeholder='authUrl' value={authUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
            </div>
            <div className="LimaAppDashboard-row">
                Controller AccountId:
                <input id='clientAccountId' type='text' className='form-control' placeholder='accountId' value={clientAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Controller Password:
                <input id='clientPassword' type='text' className='form-control' placeholder='password' value={clientPassword} onChange={onChangeHandler} onBlur={onBlurHandler} />
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('Connect', event)}>
                    Connect
                </button>
            </div>
        </div >
    );
}

export default LimaAppDashboard;
