//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstate is ERC721URIStorage {
    //using will take all the properties inside Counters and use it as  Counters.Counter data type
    using Counters for Counters.Counter;
    //setting the type of tokenIds and it will be private
    Counters.Counter private _tokenIds;

    constructor() ERC721("Real Estate", "Real") {}

    function mint(string memory tokenURI) public returns (uint256){
        _tokenIds.increment(); // increase the counter/token id for new tokens
        uint newItemId = _tokenIds.current(); // get the current token now and place it in newItemId
        _mint(msg.sender, newItemId); // _mint is a function inside the erc721 we are importing. it will send minted nft with the new id
        _setTokenURI(newItemId, tokenURI);// setting metadata
        
        return newItemId;   
    }

    //this function tells us how many nfts have been minted
    function totalSupply() public view returns(uint256){
        return _tokenIds.current();
    }
}
