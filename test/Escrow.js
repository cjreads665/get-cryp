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
});