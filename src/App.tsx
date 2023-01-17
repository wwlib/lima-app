import React from 'react';
import './App.css';
import Model from './model/Model';
import LimaAppDashboard from './components/LimaAppDashboard/LimaAppDashboard';

function App({model}: {model: Model}) {
  return (
    <div className="App">
      <LimaAppDashboard model={model}/>
    </div>
  );
}

export default App;
