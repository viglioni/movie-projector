import React from 'react';
import '../scss/App.scss';
import Player from './player';
import params from './parameters';

function App() {
  return (
    <div className="App">
      <Player {...params}/>
    </div>
  );
}

export default App;
