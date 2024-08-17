import React, { useState } from 'react';

const SendReceive: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSend = () => {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'sendTransaction', amount, address }, (response) => {
        alert(response.status);
      });
    }
  };

  return (
    <div>
      <h2>Send/Receive</h2>
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default SendReceive;
