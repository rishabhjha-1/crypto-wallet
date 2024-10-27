import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import nacl from "tweetnacl";
import React from "react";

interface SolanaWalletProps {
  mnemonic: string;
}

export function SolanaWallet({ mnemonic }: SolanaWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<number | string>("");

  const connection = new Connection(clusterApiUrl("devnet"));

  // Load wallets from localStorage on component mount
  useEffect(() => {
    const storedWallets = JSON.parse(localStorage.getItem("wallets") || "[]");
    if (storedWallets.length) {
      const keys = storedWallets.map((wallet: { publicKey: string }) => new PublicKey(wallet.publicKey));
      const balances = Object.fromEntries(storedWallets.map((wallet: { publicKey: string; balance: number }) => [wallet.publicKey, wallet.balance]));
      setPublicKeys(keys);
      setBalances(balances);
      setCurrentIndex(keys.length);
    }
  }, []);

  // Update localStorage whenever publicKeys or balances change
  useEffect(() => {
    const wallets = publicKeys.map((key) => ({
      publicKey: key.toBase58(),
      balance: balances[key.toBase58()] || 0,
    }));
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [publicKeys, balances]);

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic); // Buffer is returned
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
        [keypair.publicKey.toBase58()]: balance / LAMPORTS_PER_SOL,
      }));
    } catch (error) {
      console.error("Error deriving wallet or fetching balance:", error);
    }
  };

  const sendSol = async () => {
    if (selectedWalletIndex === null) {
      alert("Please select a wallet to send SOL from.");
      return;
    }

    try {
      if (!recipient || !amount) {
        alert("Please provide both a recipient address and an amount.");
        return;
      }

      const senderPublicKey = publicKeys[selectedWalletIndex];
      const recipientPublicKey = new PublicKey(recipient);
      const lamports = parseFloat(amount as string) * LAMPORTS_PER_SOL;

      const path = `m/44'/501'/${selectedWalletIndex}'/0'`;
      const seed = await mnemonicToSeed(mnemonic);
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const senderKeypair = Keypair.fromSecretKey(secret);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports,
        })
      );

      const signature = await connection.sendTransaction(transaction, [senderKeypair]);
      await connection.confirmTransaction(signature);

      alert(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error("Error sending SOL:", error);
      alert("Transaction failed. Check console for details.");
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
              <button
                style={{
                  ...styles.selectWalletButton,
                  backgroundColor: selectedWalletIndex === index ? "#4CAF50" : "#2196F3",
                }}
                onClick={() => setSelectedWalletIndex(index)}
              >
                {selectedWalletIndex === index ? "Selected" : "Select Wallet"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Send SOL section */}
      <div style={styles.sendContainer}>
        <h3>Send SOL</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <button onClick={sendSol} style={styles.sendButton}>
          Send SOL
        </button>
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
  selectWalletButton: {
    marginTop: "10px",
    padding: "5px 10px",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noWalletsText: {
    textAlign: "center" as const,
    color: "#999",
  },
  sendContainer: {
    marginTop: "20px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  sendButton: {
    display: "block",
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
