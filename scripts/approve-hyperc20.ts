import { MockUSDC } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  const usdc: MockUSDC = await ethers.getContract('MockUSDC', signers[0]);
  const gnosisUsdc = '0x651130570e902bdf0C61C70215aE226A47646f78';
  console.log('Running script');
  let tx = await usdc.approve(gnosisUsdc, ethers.utils.parseEther('1000000000000000000'));
  //let tx = await usdc.devMint(ethers.utils.parseEther('1000000000000000000'));
  console.log(tx);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
