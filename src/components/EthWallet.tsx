import React, { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";

interface EthWalletProps {
  mnemonic: string;
}

const alchemy = new Alchemy({
  apiKey: "_Bzd98eym0sSFlLZ3bR-NzQR9s12122O", // Replace with your Alchemy API Key
  network: Network.ETH_MAINNET,
});

export const EthWallet = ({ mnemonic }: EthWalletProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: string }>({});

  // Load persisted addresses from localStorage when the component mounts
  useEffect(() => {
    const savedAddresses = localStorage.getItem("eth_addresses");
    if (savedAddresses) {
      const parsedAddresses = JSON.parse(savedAddresses);
      setAddresses(parsedAddresses);
      fetchBalances(parsedAddresses);
    }
  }, []);

  // Fetch balances for the provided list of addresses
  const fetchBalances = async (addressList: string[]) => {
    const balanceMap: { [key: string]: string } = {};
    for (const address of addressList) {
      const balance = await alchemy.core.getBalance(address);
      balanceMap[address] = balance.toString();
    }
    setBalances(balanceMap);
  };

  // Add a new ETH wallet, fetch its balance, and persist it in localStorage
  const addEthWallet = async () => {
    try {
      // Generate the wallet from the mnemonic
      const seed = await mnemonicToSeed(mnemonic);
      const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(derivationPath);
      const wallet = new Wallet(child.privateKey);

      // Update the current index and addresses
      setCurrentIndex((prevIndex) => prevIndex + 1);
      const updatedAddresses = [...addresses, wallet.address];
      setAddresses(updatedAddresses);

      // Save updated addresses in localStorage
      localStorage.setItem("eth_addresses", JSON.stringify(updatedAddresses));

      // Fetch the balance for the new address
      const balance = await alchemy.core.getBalance(wallet.address);
      setBalances((prevBalances) => ({
        ...prevBalances,
        [wallet.address]: balance.toString(),
      }));
    } catch (error) {
      console.error("Error adding ETH wallet:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ethereum Wallets</h2>

      <button onClick={addEthWallet} style={styles.addButton}>
        Add ETH Wallet
      </button>

      <div style={styles.walletList}>
        {addresses.length === 0 ? (
          <p style={styles.noWalletsText}>No wallets added yet.</p>
        ) : (
          addresses.map((address) => (
            <div key={address} style={styles.walletItem}>
              <div style={styles.walletAddress}>Address: {address}</div>
              <div style={styles.walletBalance}>
                Balance: {balances[address] || "Fetching..."} ETH
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Basic styles for better UI structure
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f7f7f7",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    display: "block",
    width: "100%",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  walletList: {
    marginTop: "20px",
  },
  walletItem: {
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  walletAddress: {
    fontSize: "14px",
    color: "#666",
  },
  walletBalance: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  noWalletsText: {
    textAlign: "center" as const,
    color: "#999",
  },
};

