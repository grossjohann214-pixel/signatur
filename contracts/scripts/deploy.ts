import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const SGLEvidenceAnchor = await ethers.getContractFactory("SGLEvidenceAnchor");
  const anchor = await SGLEvidenceAnchor.deploy();
  await anchor.waitForDeployment();

  const address = await anchor.getAddress();
  console.log("SGLEvidenceAnchor deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deployment = {
    address,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(
    "deployments/SGLEvidenceAnchor.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("Deployment saved to deployments/SGLEvidenceAnchor.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
