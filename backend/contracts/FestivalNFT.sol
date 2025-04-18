// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FestivalNFT is ERC721, Pausable, AccessControl, Ownable {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _ticketIds;
    Counters.Counter private _festivalIds;

    struct Festival {
        string name;
        string description;
        uint256 date;
        string venue;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 availableTickets;
        address organizer;
        bool isActive;
    }

    struct TicketDetails {
        uint256 festivalId;
        uint256 purchasePrice;
        uint256 sellingPrice;
        bool forSale;
        string metadata;
    }

    mapping(uint256 => Festival) public festivals;
    mapping(uint256 => TicketDetails) private _ticketDetails;
    mapping(address => uint256[]) private _customerTickets;
    mapping(address => bool) private _blacklistedAddresses;
    uint256[] private _ticketsForSale;
    uint256 public totalCommissionEarned;
    mapping(uint256 => uint256) public ticketCommissions; // tracks commission per ticket sale

    event FestivalCreated(
        uint256 indexed festivalId,
        string name,
        uint256 ticketPrice,
        uint256 totalTickets,
        address organizer
    );

    event TicketPurchased(
        uint256 indexed ticketId,
        uint256 indexed festivalId,
        address indexed buyer,
        uint256 price
    );

    event TicketListed(
        uint256 indexed ticketId,
        uint256 indexed festivalId,
        address indexed seller,
        uint256 price
    );

    event TicketUnlisted(uint256 indexed ticketId);

    event CommissionPaid(
        uint256 indexed ticketId,
        uint256 commission,
        uint256 sellerAmount,
        address indexed seller,
        address indexed buyer
    );

    constructor() ERC721("Festival NFT", "FEST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createFestival(
        string memory name,
        string memory description,
        uint256 date,
        string memory venue,
        uint256 ticketPrice,
        uint256 totalTickets
    ) public {
        require(hasRole(MINTER_ROLE, msg.sender), "Must have minter role");
        require(date > block.timestamp, "Festival date must be in the future");
        require(totalTickets > 0, "Must have at least one ticket");

        uint256 festivalId = _festivalIds.current();
        festivals[festivalId] = Festival({
            name: name,
            description: description,
            date: date,
            venue: venue,
            ticketPrice: ticketPrice,
            totalTickets: totalTickets,
            availableTickets: totalTickets,
            organizer: msg.sender,
            isActive: true
        });

        _festivalIds.increment();

        emit FestivalCreated(
            festivalId,
            name,
            ticketPrice,
            totalTickets,
            msg.sender
        );
    }

    function purchaseTicket(uint256 festivalId) public payable {
        require(!_blacklistedAddresses[msg.sender], "Address is blacklisted");
        require(festivals[festivalId].isActive, "Festival is not active");
        require(
            festivals[festivalId].availableTickets > 0,
            "No tickets available"
        );
        require(
            msg.value == festivals[festivalId].ticketPrice,
            "Incorrect ticket price"
        );

        uint256 ticketId = _ticketIds.current();
        _safeMint(msg.sender, ticketId);

        _ticketDetails[ticketId] = TicketDetails({
            festivalId: festivalId,
            purchasePrice: msg.value,
            sellingPrice: 0,
            forSale: false,
            metadata: ""
        });

        _customerTickets[msg.sender].push(ticketId);
        festivals[festivalId].availableTickets--;
        _ticketIds.increment();

        emit TicketPurchased(ticketId, festivalId, msg.sender, msg.value);
    }

    function listTicketForSale(uint256 ticketId, uint256 price) public {
        require(ownerOf(ticketId) == msg.sender, "Not ticket owner");
        require(!_ticketDetails[ticketId].forSale, "Already listed");
        require(price > 0, "Price must be greater than 0");

        _ticketDetails[ticketId].forSale = true;
        _ticketDetails[ticketId].sellingPrice = price;
        _ticketsForSale.push(ticketId);

        emit TicketListed(
            ticketId,
            _ticketDetails[ticketId].festivalId,
            msg.sender,
            price
        );
    }

    function unlistTicket(uint256 ticketId) public {
        require(ownerOf(ticketId) == msg.sender, "Not ticket owner");
        require(_ticketDetails[ticketId].forSale, "Not listed for sale");

        _ticketDetails[ticketId].forSale = false;
        _ticketDetails[ticketId].sellingPrice = 0;

        // Remove from _ticketsForSale array
        for (uint256 i = 0; i < _ticketsForSale.length; i++) {
            if (_ticketsForSale[i] == ticketId) {
                _ticketsForSale[i] = _ticketsForSale[_ticketsForSale.length - 1];
                _ticketsForSale.pop();
                break;
            }
        }

        emit TicketUnlisted(ticketId);
    }

    function secondaryPurchase(uint256 ticketId) public payable {
        require(!_blacklistedAddresses[msg.sender], "Address is blacklisted");
        require(_ticketDetails[ticketId].forSale, "Ticket not for sale");
        require(
            msg.value == _ticketDetails[ticketId].sellingPrice,
            "Incorrect price"
        );

        address seller = ownerOf(ticketId);
        require(msg.sender != seller, "Cannot buy own ticket");

        // Calculate commission (10%)
        uint256 commission = (msg.value * 10) / 100;
        uint256 sellerAmount = msg.value - commission;

        // Transfer ownership
        _transfer(seller, msg.sender, ticketId);

        // Transfer funds
        (bool commissionSuccess, ) = payable(owner()).call{value: commission}("");
        require(commissionSuccess, "Commission transfer failed");
        
        (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller transfer failed");

        // Track commission
        totalCommissionEarned += commission;
        ticketCommissions[ticketId] = commission;

        emit CommissionPaid(
            ticketId,
            commission,
            sellerAmount,
            seller,
            msg.sender
        );

        // Update ticket details
        _ticketDetails[ticketId].forSale = false;
        _ticketDetails[ticketId].sellingPrice = 0;

        // Update customer tickets
        _customerTickets[msg.sender].push(ticketId);
        for (uint256 i = 0; i < _customerTickets[seller].length; i++) {
            if (_customerTickets[seller][i] == ticketId) {
                _customerTickets[seller][i] = _customerTickets[seller][
                    _customerTickets[seller].length - 1
                ];
                _customerTickets[seller].pop();
                break;
            }
        }

        // Remove from _ticketsForSale array
        for (uint256 i = 0; i < _ticketsForSale.length; i++) {
            if (_ticketsForSale[i] == ticketId) {
                _ticketsForSale[i] = _ticketsForSale[_ticketsForSale.length - 1];
                _ticketsForSale.pop();
                break;
            }
        }

        emit TicketPurchased(ticketId, _ticketDetails[ticketId].festivalId, msg.sender, msg.value);
    }

    function getCustomerTickets(address customer) public view returns (uint256[] memory) {
        return _customerTickets[customer];
    }

    function getTicketDetails(uint256 ticketId) public view returns (TicketDetails memory) {
        return _ticketDetails[ticketId];
    }

    function getTicketsForSale() public view returns (uint256[] memory) {
        return _ticketsForSale;
    }

    function getActiveFestivals() public view returns (uint256[] memory) {
        uint256 totalFestivals = _festivalIds.current();
        uint256 activeCount = 0;
        
        // First, count active festivals
        for (uint256 i = 0; i < totalFestivals; i++) {
            if (festivals[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of correct size
        uint256[] memory activeFestivals = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        // Fill array with active festival IDs
        for (uint256 i = 0; i < totalFestivals; i++) {
            if (festivals[i].isActive) {
                activeFestivals[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeFestivals;
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function blacklistAddress(address account) public onlyRole(ADMIN_ROLE) {
        _blacklistedAddresses[account] = true;
    }

    function removeFromBlacklist(address account) public onlyRole(ADMIN_ROLE) {
        _blacklistedAddresses[account] = false;
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklistedAddresses[account];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getCommissionDetails(uint256 ticketId) public view returns (uint256 commission) {
        return ticketCommissions[ticketId];
    }

    function getTotalCommissionEarned() public view returns (uint256) {
        return totalCommissionEarned;
    }
}
