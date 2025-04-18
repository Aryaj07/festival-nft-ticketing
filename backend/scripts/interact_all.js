const hre = require("hardhat");

async function main() {
    // First deploy the contracts
    const [owner, buyer1, buyer2] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", owner.address);

    // Deploy FestToken
    const FestToken = await hre.ethers.getContractFactory("FestToken");
    const festToken = await FestToken.deploy();
    await festToken.waitForDeployment();
    const FEST_TOKEN_ADDRESS = await festToken.getAddress();
    console.log("FestToken deployed to:", FEST_TOKEN_ADDRESS);

    // Deploy FestivalNFT
    const festName = "Festival NFT";
    const festSymbol = "FNFT";
    const initialTicketPrice = hre.ethers.parseEther("0.1");
    const totalSupply = 1000;

    const FestivalNFT = await hre.ethers.getContractFactory("FestivalNFT");
    const festivalNFT = await FestivalNFT.deploy(
        festName,
        festSymbol,
        initialTicketPrice,
        totalSupply,
        owner.address,
        FEST_TOKEN_ADDRESS
    );
    await festivalNFT.waitForDeployment();
    const FESTIVAL_NFT_ADDRESS = await festivalNFT.getAddress();
    console.log("FestivalNFT deployed to:", FESTIVAL_NFT_ADDRESS);

    // Grant MINTER_ROLE to owner
    const MINTER_ROLE = await festivalNFT.MINTER_ROLE();
    await festivalNFT.grantRole(MINTER_ROLE, owner.address);
    console.log("Granted MINTER_ROLE to owner");

    console.log("\nInteracting with contracts using accounts:");
    console.log("Owner/Organizer:", owner.address);
    console.log("Buyer1:", buyer1.address);
    console.log("Buyer2:", buyer2.address);

    // 1. Mint tokens to both buyers
    const mintAmount = hre.ethers.parseEther("1000");
    console.log("\nMinting tokens to buyers...");
    
    let mintTx = await festToken.mint(buyer1.address, mintAmount);
    await mintTx.wait();
    
    mintTx = await festToken.mint(buyer2.address, mintAmount);
    await mintTx.wait();

    console.log("Buyer1 balance:", hre.ethers.formatEther(await festToken.balanceOf(buyer1.address)));
    console.log("Buyer2 balance:", hre.ethers.formatEther(await festToken.balanceOf(buyer2.address)));

    // 2. Mint new tickets to the owner (organizer)
    console.log("\nMinting new tickets to the organizer...");
    const mintTicketsTx = await festivalNFT.connect(owner).bulkMintTickets(5, owner.address);
    await mintTicketsTx.wait();
    console.log("Successfully minted 5 new tickets");

    // 3. Primary Market Purchase - Buyer1 purchases a ticket
    const ticketPrice = await festivalNFT.getTicketPrice();
    console.log("\nBuyer1 purchasing a ticket from primary market...");
    console.log("Ticket price:", hre.ethers.formatEther(ticketPrice), "tokens");
    
    // Approve token spending
    await festToken.connect(buyer1).approve(FESTIVAL_NFT_ADDRESS, ticketPrice);
    
    // The owner needs to approve the NFT contract to handle transfers
    await festivalNFT.connect(owner).setApprovalForAll(FESTIVAL_NFT_ADDRESS, true);
    
    // First ticket ID should be 1
    const purchaseTx = await festivalNFT.connect(buyer1).purchaseTicket();
    await purchaseTx.wait();
    console.log("Buyer1 successfully purchased a ticket");

    // Get the purchased ticket ID
    const buyer1Tickets = await festivalNFT.getCustomerTickets(buyer1.address);
    const purchasedTicketId = buyer1Tickets[0];
    console.log("Purchased ticket ID:", purchasedTicketId.toString());

    // 4. Secondary Market - Buyer1 lists their ticket for resale
    const resalePrice = hre.ethers.parseEther("0.15"); // 50% markup
    console.log("\nBuyer1 listing ticket for resale at", hre.ethers.formatEther(resalePrice), "tokens");
    
    // Approve NFT for sale
    await festivalNFT.connect(buyer1).setApprovalForAll(FESTIVAL_NFT_ADDRESS, true);
    
    const listTx = await festivalNFT.connect(buyer1).listTicketForSale(purchasedTicketId, resalePrice);
    await listTx.wait();
    console.log("Ticket listed for resale");

    // 5. Secondary Market Purchase - Buyer2 purchases from Buyer1
    console.log("\nBuyer2 purchasing ticket from secondary market...");
    
    // Approve token spending for secondary purchase
    await festToken.connect(buyer2).approve(FESTIVAL_NFT_ADDRESS, resalePrice);
    
    const secondaryPurchaseTx = await festivalNFT.connect(buyer2).secondaryPurchase(purchasedTicketId);
    await secondaryPurchaseTx.wait();
    console.log("Buyer2 successfully purchased ticket from secondary market");

    // 6. Check final state
    console.log("\nFinal state:");
    console.log("Ticket owner:", await festivalNFT.ownerOf(purchasedTicketId));
    
    const ticketDetails = await festivalNFT.getTicketDetails(purchasedTicketId);
    console.log("Ticket details:", {
        purchasePrice: hre.ethers.formatEther(ticketDetails.purchasePrice),
        sellingPrice: hre.ethers.formatEther(ticketDetails.sellingPrice),
        forSale: ticketDetails.forSale
    });

    console.log("\nFinal balances:");
    console.log("Owner:", hre.ethers.formatEther(await festToken.balanceOf(owner.address)));
    console.log("Buyer1:", hre.ethers.formatEther(await festToken.balanceOf(buyer1.address)));
    console.log("Buyer2:", hre.ethers.formatEther(await festToken.balanceOf(buyer2.address)));

    // 7. Get all tickets for sale
    console.log("\nAll tickets currently for sale:");
    const ticketsForSale = await festivalNFT.getTicketsForSale();
    console.log(ticketsForSale.map(t => t.toString()));

    // 8. Get Buyer2's tickets
    console.log("\nBuyer2's tickets:");
    const buyer2Tickets = await festivalNFT.getCustomerTickets(buyer2.address);
    console.log(buyer2Tickets.map(t => t.toString()));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });