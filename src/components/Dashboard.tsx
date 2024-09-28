import { generateMnemonic } from "bip39";
import React, { useState } from "react";
import { SolanaWallet } from "./SolanaWallet";
import { EthWallet } from "./EthWallet";

const Dashboard: React.FC = () => {
  const [mnemonic, setMnemonic] = useState("");

  const handleGenerateMnemonic = async () => {
    const mn = await generateMnemonic();
    setMnemonic(mn);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Wallet Dashboard</h2>
      <button style={styles.button} onClick={handleGenerateMnemonic}>
        Create Seed Phrase
      </button>

      <input
        type="text"
        value={mnemonic}
        readOnly
        style={styles.input}
        placeholder="Generated Seed Phrase will appear here"
      />

      <div style={styles.walletsContainer}>
        <SolanaWallet mnemonic={mnemonic} />
        <EthWallet mnemonic={mnemonic} />
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
  button: {
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
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  walletsContainer: {
    marginTop: "20px",
  },
};

export default Dashboard;
