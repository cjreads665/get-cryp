const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  beforeEach(async () => {
    //setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    //deploy Real Estate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy(); //returns the contract after deploying

    // minting the nft using the contract
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();
    // console.log(transaction);

    const Escrow = await ethers.getContractFactory("Escrow");
    //deploying the contract on the hardhat local blockchain
    escrow = await Escrow.deploy(
      realEstate.address, //address of the deployed contract
      seller.address,
      inspector.address,
      lender.address
    );
    //approve property
    //approving the transaction by connectig the seller and approving the escrow address for nft id 1
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    //list property
    //connecting the seller with the function list with nft id 1 and executing it
    transaction = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5)); //tokens = dummy eth
    await transaction.wait();
  });

  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  describe("Deployment", () => {
    it("return the NFT address", async () => {
      //after deploying, get the public variable nftAddress that is supposed to be contract address
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(realEstate.address);
    });
    it("return the seller address", async () => {
      //after deploying, get the public variable seller that is supposed to be contract address
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });
    it("return the lender address", async () => {
      //after deploying, get the public variable lender that is supposed to be contract address
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });

  // 1 provided here is the nft id
  describe("Listing", () => {
    it("updated as listed", async () => {
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });

    it("updates ownership", async () => {
      //checking to see that the nft is transferred from seller to the escrow smart contract
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });

    it("returns buyer", async () => {
      const result = await escrow.buyer(1)
      expect(result).to.be.equal(buyer.address);
    });

    it("returns purhase price", async () => {
      const result = await escrow.purchasePrice(1)
      expect(result).to.be.equal(tokens(10));
    });

    it("returns escrow amount", async () => {
      const result = await escrow.escrowAmount(1)
      expect(result).to.be.equal(tokens(5));
    });
  });

  describe("Deposits", () => {
    it("updates contract balance", async () => {
      //connecting buyer to the escrow contract and passing the nft id along with the tokens as escrow
      const transaction = await escrow.connect(buyer).depositEarnest(1,{value : tokens(5)});
      await transaction.wait();
      const result = await escrow.getBalance();
      expect(result).to.be.equal(tokens(5));
    });
  });

  describe("Inspection", () => {
    it("updates inspection status", async () => {
      //connecting buyer to the escrow contract and passing the nft id along with the tokens as escrow
      const transaction = await escrow.connect(inspector).updateInspectionStatus(1,true); //emulating that inspector passed the nft along with inspection result
      await transaction.wait();
      const result = await escrow.inspectionPassed(1) // inspectionPassed is the mapping that returns the status with nft id
      expect(result).to.be.equal(true)
    });
  });

  describe("Approval", () => {
    it("updates approval status", async () => {
      let transaction = await escrow.connect(buyer).approveSale(1); // buyer approving the sale for that nftId
      await transaction.wait();
      transaction = await escrow.connect(seller).approveSale(1); // buyer approving the sale for that nftId
      await transaction.wait();
      transaction = await escrow.connect(lender).approveSale(1); // buyer approving the sale for that nftId
      await transaction.wait();
      //check if the parties involved have all approved the transactions
      expect(await escrow.approval(1,buyer.address)).to.be.equal(true);
      expect(await escrow.approval(1,seller.address)).to.be.equal(true);
      expect(await escrow.approval(1,lender.address)).to.be.equal(true);

    });
  });

  describe("Sale", () => {
    it("updates approval status", async () => {
  beforeEach(async()=>{
    let transaction = await escrow.connect(buyer).depositEarnest(1,{value : tokens(5)})
    await transaction.wait()

    transaction = await escrow.connect(inspector).updateInspectionStatus(1,true)
    await transaction.wait()

    transaction = await escrow.connect(buyer).approveSale(1)
    await transaction.wait()

    transaction = await escrow.connect(seller).approveSale(1)
    await transaction.wait()

    transaction = await escrow.connect(lender).approveSale(1) //lender will approve the sale 
    await transaction.wait()

    await lender.sendTransaction({to: escrow.address, value : tokens(5)}) //lender giving loan by sending to contract

    transaction = await escrow.connect(seller).finalizeSale(1)
    await transaction.wait()
  })

  it("updates balance to zero",async()=>{
    expect(await escrow.getBalance()).to.be.equal(0);
  })

  it("updates ownership",async()=>{
    expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
  })

    });
  });

});
