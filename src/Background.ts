chrome.runtime.onInstalled.addListener(() => {
    console.log('Crypto Wallet Extension installed');
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBalance') {
      // Handle balance retrieval
      sendResponse({ balance: '0.5 ETH' });
    } else {
      sendResponse({ status: 'unknown action' });
    }
  });
  