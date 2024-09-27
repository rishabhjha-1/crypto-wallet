import React, { useState } from 'react';
import Balance from './components/Balance';
import SendReceive from './components/SendReceive';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { Buffer } from 'buffer';

const App: React.FC = () => {
  const [mnemonic, setMnemonic] = useState("");

// Assign Buffer to the global window object
window.Buffer = Buffer;

  return (
    <div style={{ width: '300px', height: '400px', padding: '10px' }}>
      <h3>kks Crypto Wallet</h3>
      <Dashboard />
      <Balance />
      <SendReceive />
      <Settings />
    </div>
  );
};

export default App;
