import { MockUSDC } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  const usdc: MockUSDC = await ethers.getContract('MockUSDC', signers[0]);
  const gnosisUsdc = '0x77f359C9e1F5a1264B931fca77523d99a7807b50';
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
