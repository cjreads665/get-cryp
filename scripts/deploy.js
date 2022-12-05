// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
async function main() {
  let buyer, seller, inspector, lender;
    //setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();
    
    //deploy Real Estate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const realEstate = await RealEstate.deploy(); //returns the contract after deploying
    await realEstate.deployed()

  console.log(`deployed real estate contract at : ${realEstate.address} `);
  console.log(`Miniting 3 properties...\n`);

  for(let i=0; i<3 ;i++){
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/${i+1}.json`)
    await transaction.wait()
  }

  const Escrow = await ethers.getContractFactory("Escrow");
  //deploying the contract on the hardhat local blockchain
  let escrow = await Escrow.deploy(
    realEstate.address, //address of the deployed contract
    seller.address,
    inspector.address,
    lender.address
  );

  await escrow.deployed()

  for(let i=0; i<3 ;i++){
    //approving the transactions
    const transaction = await realEstate.connect(seller).approve(escrow.address,i+1)
    await transaction.wait()
  }

  //listing properties
  let transaction = await escrow.connect(seller).list(1,buyer.address, tokens(20),tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2,buyer.address, tokens(15),tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3,buyer.address, tokens(10),tokens(5))
  await transaction.wait()

  console.log("finished");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
