import React, { useEffect, useState } from 'react';

function Popup() {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (chrome && chrome.runtime) {
      // Send a message to the background script to get the balance
      chrome.runtime.sendMessage({ action: 'getBalance' }, (response) => {
        if (response && response.balance) {
          setBalance(response.balance);
        }
      });
    }
  }, []);

  return (
    <div>
      <h1>Crypto Wallet Extension</h1>
      <p>Balance: {balance !== null ? balance : 'Loading...'}</p>
    </div>
  );
}

export default Popup;
