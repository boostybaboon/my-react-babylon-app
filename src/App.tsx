import React from 'react';
import BabylonScene from './babylon/BabylonScene';
import BabylonScene_gsap from './babylon/BabylonScene_gsap';
import BabylonBlockTest from './babylon/BabylonBlockTest';
import BabylonBlockTestNoTone from './babylon/BabylonBlockTestNoTone';
import BabylonBlockTestDecoupled from './babylon/BabylonBlockTestDecoupled';

const App: React.FC = () => {
  return (
    <div>
      <h1>My Babylon.js React App</h1>
      {/* <BabylonBlockTest /> */}
      <BabylonBlockTestDecoupled />
      {/* <BabylonBlockTestNoTone /> */}
      {/* <BabylonScene /> */}
      {/* <BabylonScene_gsap /> */}
    </div>
  );
};

export default App;