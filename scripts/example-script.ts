// import {
//   ExampleContract
// } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  // const example: ExampleContract = await ethers.getContract('ExampleContract', signers[0]);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
