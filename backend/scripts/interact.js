const hre = require("hardhat");

async function main() {
    // Get the contract addresses from our previous deployment
    const FEST_TOKEN_ADDRESS = "0x9812a7bFd0540cd323b3D1E5f70a058d22b83c0C";
    const FESTIVAL_NFT_ADDRESS = "0xf75610181CF975Ab9BAb03Fe6B3d7cDb9676d656";
    const FACTORY_ADDRESS = "0x66D62342C33d471c07d3B37E1f235Af7B877299c";

    const [owner, buyer] = await hre.ethers.getSigners();
    console.log("Interacting with contracts using accounts:");
    console.log("Owner:", owner.address);
    console.log("Buyer:", buyer.address);

    // Get contract instances
    const FestToken = await hre.ethers.getContractFactory("FestToken");
    const festToken = FestToken.attach(FEST_TOKEN_ADDRESS);

    const FestivalNFT = await hre.ethers.getContractFactory("FestivalNFT");
    const festivalNFT = FestivalNFT.attach(FESTIVAL_NFT_ADDRESS);

    // 1. Check initial balances
    const ownerBalance = await festToken.balanceOf(owner.address);
    console.log("\nInitial FestToken balance of owner:", hre.ethers.formatEther(ownerBalance));

    // 2. Mint some tokens to the buyer
    const mintAmount = hre.ethers.parseEther("1000");
    console.log("\nMinting", hre.ethers.formatEther(mintAmount), "tokens to buyer...");
    const mintTx = await festToken.mint(buyer.address, mintAmount);
    await mintTx.wait();

    const buyerBalance = await festToken.balanceOf(buyer.address);
    console.log("Buyer's FestToken balance:", hre.ethers.formatEther(buyerBalance));

    // 3. Get the ticket price
    const ticketPrice = await festivalNFT.getTicketPrice();
    console.log("\nTicket price:", hre.ethers.formatEther(ticketPrice), "tokens");

    // 4. Mint tickets to the organizer
    console.log("\nMinting tickets to the organizer...");
    try {
        const mintTicketsTx = await festivalNFT.connect(owner).bulkMintTickets(5, owner.address);
        await mintTicketsTx.wait();
        console.log("Successfully minted 5 tickets to organizer");
    } catch (error) {
        console.error("Error minting tickets:", error.message);
        return;
    }

    // 5. Approve NFT contract to spend tokens from buyer
    console.log("\nApproving NFT contract to spend buyer's tokens...");
    const approveTx = await festToken.connect(buyer).approve(FESTIVAL_NFT_ADDRESS, ticketPrice);
    await approveTx.wait();

    // 6. Approve NFT transfers
    console.log("\nApproving NFT transfers...");
    const approveNFTTx = await festivalNFT.connect(owner).approve(buyer.address, 1);
    await approveNFTTx.wait();

    // 7. Purchase a ticket
    console.log("\nPurchasing a ticket...");
    try {
        const purchaseTx = await festivalNFT.connect(buyer).purchaseTicket();
        await purchaseTx.wait();
        console.log("Ticket purchased successfully!");

        // Check if buyer owns the ticket
        const ticketId = 1; // First ticket
        const ticketOwner = await festivalNFT.ownerOf(ticketId);
        console.log(`Owner of ticket #${ticketId}:`, ticketOwner);

        // Get ticket details
        const ticketDetails = await festivalNFT.getTicketDetails(ticketId);
        console.log("\nTicket details:", {
            purchasePrice: hre.ethers.formatEther(ticketDetails.purchasePrice),
            sellingPrice: hre.ethers.formatEther(ticketDetails.sellingPrice),
            forSale: ticketDetails.forSale,
            metadata: ticketDetails.metadata
        });

        // Check buyer's token balance after purchase
        const buyerBalanceAfter = await festToken.balanceOf(buyer.address);
        console.log("Buyer's FestToken balance after purchase:", hre.ethers.formatEther(buyerBalanceAfter));

        // Check owner's token balance after purchase
        const ownerBalanceAfter = await festToken.balanceOf(owner.address);
        console.log("Owner's FestToken balance after purchase:", hre.ethers.formatEther(ownerBalanceAfter));
    } catch (error) {
        console.error("Error purchasing ticket:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 