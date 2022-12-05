import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const [account,setAccount] = useState(null)
  const loadBlockchainData = async()=>{
    //ethers is the library that connects our app to the blockchain
    //to create a connection to blockchain, we're gonna use ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    setAccount(accounts[0])
  }

  useEffect(()=>{
    loadBlockchainData()
  },[])

  return (
    <div>

      <div className='cards__section'>

        <h3>Welcome to Millow</h3>

      </div>

    </div>
  );
}

export default App;
