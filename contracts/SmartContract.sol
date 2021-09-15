//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartContract is Ownable, ERC721URIStorage {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    uint256 private MAX_ITEMS;
    uint256 private PRICE;
    
    struct NFToken
    {
        uint256 id;
        string uri;
    }

    constructor() ERC721("Test NFT", "TestNFT") {
        MAX_ITEMS = 30;
        PRICE = 0.06 ether;
    }

    function CreateCollectible(address _to, string memory uri) public payable returns (uint256) {
        uint256 total = _tokenIdTracker.current();
        require(total < MAX_ITEMS, "No more NFTs left to mint");
        require(msg.value >= PRICE, "Value below price");

        _tokenIdTracker.increment();
        uint id = _tokenIdTracker.current();
        _safeMint(_to, id);
        _setTokenURI(id, uri);
        return id;
    }
    
    function GetAllExistingTokens() public view returns(NFToken[] memory){
        NFToken[] memory result=new NFToken[](_tokenIdTracker.current());
        for(uint256 i=0;i<_tokenIdTracker.current();i++){
            if(_exists(i+1)){
                result[i]=NFToken(i+1, tokenURI(i+1));
            }
        }
        return result;
    }

    function WithdrawAll(address _address) public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        Withdraw(_address, address(this).balance);
    }

    function Withdraw(address _address, uint256 _amount) private {
        (bool success,) = _address.call{value : _amount}("");
        require(success, "Transfer failed.");
    }
    
    function BalanceOf() external view returns (uint)
    {
        return address(this).balance;
    }
}