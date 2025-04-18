// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./FestivalNFT.sol";
import "./FestToken.sol";

contract FestiveTicketsFactory is Ownable, Pausable {
    struct Festival {
        string festName;
        string festSymbol;
        uint256 ticketPrice;
        uint256 totalSupply;
        address nftContract;
        bool isActive;
    }

    FestToken public immutable paymentToken;
    mapping(address => Festival) public festivals;
    address[] public activeFestivals;
    
    event FestivalCreated(
        address indexed nftContract,
        string festName,
        string festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    );
    event FestivalDeactivated(address indexed nftContract);
    event FestivalReactivated(address indexed nftContract);

    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "Invalid payment token");
        paymentToken = FestToken(_paymentToken);
    }

    function createNewFestival(
        string memory festName,
        string memory festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    ) external onlyOwner whenNotPaused returns (address) {
        require(bytes(festName).length > 0, "Festival name cannot be empty");
        require(bytes(festSymbol).length > 0, "Festival symbol cannot be empty");
        require(ticketPrice > 0, "Ticket price must be greater than 0");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(totalSupply <= 10000, "Total supply cannot exceed 10000");

        FestivalNFT newFestival = new FestivalNFT();
        address festivalAddress = address(newFestival);

        festivals[festivalAddress] = Festival({
            festName: festName,
            festSymbol: festSymbol,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            nftContract: festivalAddress,
            isActive: true
        });

        activeFestivals.push(festivalAddress);

        emit FestivalCreated(
            festivalAddress,
            festName,
            festSymbol,
            ticketPrice,
            totalSupply
        );

        return festivalAddress;
    }

    function deactivateFestival(address festivalAddress) external onlyOwner {
        require(festivals[festivalAddress].nftContract != address(0), "Festival does not exist");
        require(festivals[festivalAddress].isActive, "Festival already deactivated");
        
        festivals[festivalAddress].isActive = false;
        
        // Remove from active festivals array
        for (uint256 i = 0; i < activeFestivals.length; i++) {
            if (activeFestivals[i] == festivalAddress) {
                activeFestivals[i] = activeFestivals[activeFestivals.length - 1];
                activeFestivals.pop();
                break;
            }
        }
        
        emit FestivalDeactivated(festivalAddress);
    }

    function reactivateFestival(address festivalAddress) external onlyOwner {
        require(festivals[festivalAddress].nftContract != address(0), "Festival does not exist");
        require(!festivals[festivalAddress].isActive, "Festival already active");
        
        festivals[festivalAddress].isActive = true;
        activeFestivals.push(festivalAddress);
        
        emit FestivalReactivated(festivalAddress);
    }

    function getActiveFestivals() external view returns (address[] memory) {
        return activeFestivals;
    }

    function getFestivalDetails(address festivalAddress)
        external
        view
        returns (
            string memory festName,
            string memory festSymbol,
            uint256 ticketPrice,
            uint256 totalSupply,
            bool isActive
        )
    {
        require(festivals[festivalAddress].nftContract != address(0), "Festival does not exist");
        Festival memory festival = festivals[festivalAddress];
        return (
            festival.festName,
            festival.festSymbol,
            festival.ticketPrice,
            festival.totalSupply,
            festival.isActive
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
