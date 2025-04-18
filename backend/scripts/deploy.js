const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FestToken first
  const FestToken = await hre.ethers.getContractFactory("FestToken");
  const festToken = await FestToken.deploy();
  await festToken.waitForDeployment();
  console.log("FestToken deployed to:", await festToken.getAddress());

  // Deploy FestivalNFT
  const FestivalNFT = await hre.ethers.getContractFactory("FestivalNFT");
  const festivalNFT = await FestivalNFT.deploy();
  await festivalNFT.waitForDeployment();
  
  const contractAddress = await festivalNFT.getAddress();
  console.log("FestivalNFT deployed to:", contractAddress);

  // Save the contract address to a file that can be used by the frontend
  const fs = require("fs");
  const path = require("path");
  const envContent = `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="${contractAddress}"`;
  fs.writeFileSync(path.join(__dirname, "../../frontend/.env.local"), envContent);
  console.log("Contract address saved to frontend/.env.local");

  // Deploy FestiveTicketsFactory with the FestToken address
  const FestiveTicketsFactory = await hre.ethers.getContractFactory("FestiveTicketsFactory");
  const festiveTicketsFactory = await FestiveTicketsFactory.deploy(await festToken.getAddress());
  await festiveTicketsFactory.waitForDeployment();
  console.log("FestiveTicketsFactory deployed to:", await festiveTicketsFactory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 