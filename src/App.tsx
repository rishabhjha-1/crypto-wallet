import React from 'react';
import Balance from './components/Balance';
import SendReceive from './components/SendReceive';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const App: React.FC = () => {
  return (
    <div style={{ width: '300px', height: '400px', padding: '10px' }}>
      <h1>Crypto Wallet</h1>
      <Dashboard />
      <Balance />
      <SendReceive />
      <Settings />
    </div>
  );
};

export default App;
