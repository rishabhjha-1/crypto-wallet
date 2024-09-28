import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import nacl from "tweetnacl";
import React from "react";

interface SolanaWalletProps {
  mnemonic: string;
}

export function SolanaWallet({ mnemonic }: SolanaWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});

  const connection = new Connection(clusterApiUrl("mainnet-beta"));

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/${currentIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      setCurrentIndex((prevIndex) => prevIndex + 1);
      setPublicKeys((prevKeys) => [...prevKeys, keypair.publicKey]);

      // Fetch balance for the new public key
      const balance = await connection.getBalance(keypair.publicKey);
      setBalances((prevBalances) => ({
        ...prevBalances,
        [keypair.publicKey.toBase58()]: balance / 1e9, // Convert lamports to SOL
      }));
    } catch (error) {
      console.error("Error deriving wallet:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Solana Wallets</h2>
      <button onClick={addWallet} style={styles.addButton}>
        Add Wallet
      </button>

      <div style={styles.walletList}>
        {publicKeys.length === 0 ? (
          <p style={styles.noWalletsText}>No wallets added yet.</p>
        ) : (
          publicKeys.map((key, index) => (
            <div key={index} style={styles.walletItem}>
              <div style={styles.walletAddress}>Public Key: {key.toBase58()}</div>
              <div style={styles.walletBalance}>
                Balance: {balances[key.toBase58()] !== undefined ? balances[key.toBase58()].toFixed(2) : "Fetching..."} SOL
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
