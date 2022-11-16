//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//skeleton of a smart contract that tells what fns are available
interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    // variables with data type "address"
    address public lender;
    address public inspector;
    address payable public seller;
    address public nftAddress;

    //adding modifier to set prerequisite to a function
    modifier onlySeller() {
        require(msg.sender == seller, "only seller can call this message");
        _;
    }

   //adding modifier to set prerequisite to a function
    modifier onlyBuyer(uint256 _nftId) {
        require(msg.sender == buyer[_nftId], "only buyer of that particular nft can do this action");
        _;
    }

      modifier onlyInspector() {
        require(msg.sender == inspector, "only this address can perform inspection");
        _;
    }

    //creating a mapping(object)
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer; // this contains key-value of nft: buyerAddress. basically tracks which nft belongs to whom(?)
    mapping(uint256 => bool) public inspectionPassed;//this contains key-value pairs of nftId : ifInspectionPassedOrFailed
    //this mapping will store the ids of nfts that will contain the approval of appraiser, inspector
    mapping(uint256 => mapping(address => bool)) public approval;

    //the local varibales that will change the public ones when new instances are created
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftId,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        //anyone can call this function. So as a safe keeping measure,
        //we'll have to approve it from the seller side before moving nft from the seller's side
        //take the nft address and the nft(using id) and transfer from owner to this contract add
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        purchasePrice[_nftId] = _purchasePrice;
        escrowAmount[_nftId] = _escrowAmount;
        buyer[_nftId] = _buyer;
    }

    //put under contract (only buyer-payable escrow)
    function depositEarnest(uint256 _nftId) public payable onlyBuyer(_nftId) returns(bool){
        return(msg.value >= escrowAmount[_nftId]);
    }
    
    function updateInspectionStatus(uint256 _nftId, bool _passed) public onlyInspector {
        inspectionPassed[_nftId] = _passed; 
    }

    function approveSale(uint _nftId) public {
        approval[_nftId][msg.sender] = true; // approving the nft according to the ID for the callers that are inspectors,etc.
    }

    receive() external payable{}

    function getBalance() public view returns(uint256){
        //https://ethereum.stackexchange.com/questions/40018/what-is-addressthis-in-solidity
        return address(this).balance;
    }

    

}
