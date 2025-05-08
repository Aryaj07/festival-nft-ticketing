const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FestToken first
  const FestToken = await hre.ethers.getContractFactory("FestToken");
  const festToken = await FestToken.deploy();
  await festToken.waitForDeployment();
  const festTokenAddress = await festToken.getAddress();
  console.log("FestToken deployed to:", festTokenAddress);

  // Deploy FestivalNFT
  const FestivalNFT = await hre.ethers.getContractFactory("FestivalNFT");
  const festivalNFT = await FestivalNFT.deploy();
  await festivalNFT.waitForDeployment();
  const festivalNFTAddress = await festivalNFT.getAddress();
  console.log("FestivalNFT deployed to:", festivalNFTAddress);

  // Deploy FestiveTicketsFactory with the FestToken address
  const FestiveTicketsFactory = await hre.ethers.getContractFactory("FestiveTicketsFactory");
  const festiveTicketsFactory = await FestiveTicketsFactory.deploy(festTokenAddress);
  await festiveTicketsFactory.waitForDeployment();
  const factoryAddress = await festiveTicketsFactory.getAddress();
  console.log("FestiveTicketsFactory deployed to:", factoryAddress);

  // Save all contract addresses to a file that can be used by the frontend
  const fs = require("fs");
  const path = require("path");
  const envContent = `NEXT_PUBLIC_FESTIVAL_NFT_ADDRESS="${festivalNFTAddress}"
NEXT_PUBLIC_FEST_TOKEN_ADDRESS="${festTokenAddress}"
NEXT_PUBLIC_FACTORY_ADDRESS="${factoryAddress}"`;

  fs.writeFileSync(path.join(__dirname, "../../frontend/.env.local"), envContent);
  console.log("Contract addresses saved to frontend/.env.local");

  // Log all addresses together for easy reference
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("FestToken:", festTokenAddress);
  console.log("FestivalNFT:", festivalNFTAddress);
  console.log("FestiveTicketsFactory:", factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 