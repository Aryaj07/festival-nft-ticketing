const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Granting MINTER_ROLE with account:", deployer.address);

    // Get the contract instance
    const FestivalNFT = await hre.ethers.getContractFactory("FestivalNFT");
    
    // Get the deployed contract address from the network
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Newly deployed contract address
    console.log("Contract address:", contractAddress);
    
    const festivalNFT = FestivalNFT.attach(contractAddress);

    // Get the MINTER_ROLE bytes32 value
    const MINTER_ROLE = await festivalNFT.MINTER_ROLE();
    console.log("MINTER_ROLE hash:", MINTER_ROLE);
    
    // Your wallet address that needs the MINTER_ROLE
    const addressToGrant = "0x04CA6B6de77026F4ad35983d5b9EDaDbBBb76e86"; // User's MetaMask address
    console.log("Granting role to:", addressToGrant);
    
    // Check if the deployer has admin role
    const DEFAULT_ADMIN_ROLE = await festivalNFT.DEFAULT_ADMIN_ROLE();
    const isAdmin = await festivalNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    if (!isAdmin) {
      throw new Error("Deployer account does not have admin role to grant roles");
    }
    
    // Check if the address already has the role
    const hasRole = await festivalNFT.hasRole(MINTER_ROLE, addressToGrant);
    if (hasRole) {
      console.log(`Address ${addressToGrant} already has MINTER_ROLE`);
      return;
    }

    // Grant the role
    console.log(`Granting MINTER_ROLE to ${addressToGrant}...`);
    const tx = await festivalNFT.grantRole(MINTER_ROLE, addressToGrant);
    console.log("Transaction hash:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    
    // Verify the role was granted
    const hasRoleAfter = await festivalNFT.hasRole(MINTER_ROLE, addressToGrant);
    if (hasRoleAfter) {
      console.log("✅ MINTER_ROLE granted successfully!");
    } else {
      console.log("❌ Failed to grant MINTER_ROLE");
    }
  } catch (error) {
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 