import React from 'react'
import './App.css'
import Model from './model/Model'
import Logo from './components/Logo/Logo'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'
import LimaAppDashboard from './components/LimaAppDashboard/LimaAppDashboard'
import SocketPanel from './components/SocketPanel/SocketPanel'

function App({ model }: { model: Model }) {

  const [activeTab, setActiveTab] = React.useState<string>('Settings')


  const onTabButtonClicked = (action: string, event: any) => {
    event.preventDefault()
    switch (action) {
      case 'tabSettings':
        setActiveTab('Settings')
        break
      case 'tabDashboard':
        setActiveTab('Dashboard')
        break
      case 'tabSocket':
        setActiveTab('Socket')
        break
    }
  }

  const getButtonStyle = (buttonName: string): string => {
    let style: string = 'btn btn-primary';
    if (buttonName === activeTab) {
      style = 'btn btn-info';
    }
    return style;
  }

  const getActiveTabComponent = (): any => {
    let activeTabComponent: any = null;
    switch (activeTab) {
      case 'Settings':
        activeTabComponent =
          <SettingsPanel
            model={model}
          />
        break;
      case 'Dashboard':
        activeTabComponent =
          <LimaAppDashboard
            model={model}
          />
        break;
      case 'Socket':
        activeTabComponent =
          <SocketPanel
            model={model}
          />
        break;
    }
    return activeTabComponent;
  }

  return (
    // <div className="App">
    //   <LimaAppDashboard model={model}/>
    // </div>

    <div className="App">
      <header className="App-header">
        <Logo />
        <div className='App-nav-tabs'>
          <button id='btn_settings' type='button' className={getButtonStyle('Settings')}
            onClick={(event) => onTabButtonClicked(`tabSettings`, event)}>
            Settings
          </button>
          <button id='btn_dashboard' type='button' className={getButtonStyle('Dashboard')}
            onClick={(event) => onTabButtonClicked(`tabDashboard`, event)}>
            Dashboard
          </button>
          <button id='btn_socket' type='button' className={getButtonStyle('Socket')}
            onClick={(event) => onTabButtonClicked(`tabSocket`, event)}>
            Socket
          </button>
        </div>
      </header>
      <div className='Tabs'>
        {getActiveTabComponent()}
      </div>
    </div>
  )
}

export default App
