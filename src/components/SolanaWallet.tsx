import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import React from "react";

interface SolanaWalletProps {
  mnemonic: string;
}

export function SolanaWallet({ mnemonic }: SolanaWalletProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]); // Explicitly typing state as an array of PublicKey

  const addWallet = async () => {
    try {
      const seed = await mnemonicToSeed(mnemonic); // Handle mnemonicToSeed as a promise
      const path = `m/44'/501'/${currentIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      setCurrentIndex((prevIndex) => prevIndex + 1); // Update index
      setPublicKeys((prevKeys) => [...prevKeys, keypair.publicKey]); // Add new public key
    } catch (error) {
      console.error("Error deriving wallet:", error);
    }
  };

  return (
    <div>
      <button onClick={addWallet}>Add wallet</button>
      {publicKeys.map((p, index) => (
        <div key={index}>{p.toBase58()}</div> // Ensure public key has a unique key
      ))}
    </div>
  );
}
