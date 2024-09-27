import { generateMnemonic } from "bip39";
import React, { useState } from "react";
import {SolanaWallet} from "./SolanaWallet"
import { EthWallet } from "./EthWallet";

const Dashboard: React.FC = () => {
  const [mnemonic, setMnemonic] = useState("");

  return (
    <div>
      <h2>Dashboard</h2>
      {/* Dashboard content here */}
      <button
        onClick={async function () {
          const mn = await generateMnemonic();
          setMnemonic(mn);
        }}
      >
        Create Seed Phrase
      </button>
      <input type="text" value={mnemonic}></input>
      <SolanaWallet mnemonic={mnemonic}/>
      <EthWallet mnemonic={mnemonic}/>

    </div>
  );
};

export default Dashboard;
