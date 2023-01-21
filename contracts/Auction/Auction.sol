// SPDX-License-Identifier: GRL-3.0
pragma solidity 0.8.17;

import '../Common/Ownable.sol';
import "hardhat/console.sol";

interface IERC721 {
    function safeTransferFrom(
        address from,
        address to,
        uint tokenId
    ) external;
}

interface IERC721TokenReceiver
{
    function onERC721Received(address, address, uint256, bytes calldata) external returns(bytes4);
}

contract Auction is Ownable {
    uint nftId;
    IERC721 nft;
    uint public highestBid;
    address highestBidder;
    address payable seller;

    uint public startedAt;
    uint public endedAt;
    bool public isAuctionLive = false;

    mapping(address => uint) bids;

    constructor(address _nft, uint _nftId) {
        nft = IERC721(_nft);
        nftId = _nftId;
        seller = payable(msg.sender);
    }

    modifier auctionActive() {
        require(isAuctionLive, "Auction not live");
        require(block.timestamp < endedAt, "Auction not live");
        _;
    }

    modifier auctionInActive() {
        require(!isAuctionLive, "Auction is live");
        _;
    }

    modifier auctionEnded() {
        require(block.timestamp > endedAt, "Auction not ended");
        _;
    }

    function checkAuctionStatus() public returns(bool) {
        if(block.timestamp > endedAt){
            if(isAuctionLive){
                isAuctionLive = false;
            }
            return false;
        }
        return isAuctionLive;
    }

    function startAuction(uint initialBid, uint time) public onlyOwner auctionInActive {
        startedAt = block.timestamp;
        highestBid = initialBid;
        highestBidder = msg.sender;
        endedAt = block.timestamp + time;
        isAuctionLive = true;
        nft.safeTransferFrom(seller, address(this), nftId);
    }

    function bid() public notOwner auctionActive payable {
        require(msg.value > highestBid, "Bid more than the latest bid");
        highestBidder = msg.sender;
        highestBid = msg.value;
        bids[msg.sender] += msg.value;
    }

    function endAuction() public onlyOwner auctionEnded {
        isAuctionLive = false;
        if(address(this).balance > highestBid){
            bids[highestBidder] -= highestBid;
            (bool sent, bytes memory data) = seller.call{value: highestBid}("");
            require(sent, "Failed to end auction");
        }
        nft.safeTransferFrom(address(this), highestBidder, nftId);
    }
    
    function withdraw() public {
        uint amount = bids[msg.sender];
        if(isAuctionLive && msg.sender == highestBidder){
            amount = amount - highestBid;
        }
        (bool sent, bytes memory data) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to withdraw amount");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721TokenReceiver.onERC721Received.selector;
    }
}
