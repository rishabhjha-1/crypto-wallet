import React, { useEffect, useState } from 'react';

const Balance: React.FC = () => {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'getBalance' }, (response) => {
        if (response && response.balance) {
          setBalance(response.balance);
        }
      });
    }
  }, []);

  return (
    <div>
      <h2>Balance</h2>
      <p>{balance !== null ? balance : 'Loading...'}</p>
    </div>
  );
};

export default Balance;
