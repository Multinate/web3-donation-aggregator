import { MockUSDC } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  const usdc: MockUSDC = await ethers.getContract('MockUSDC', signers[0]);
  const hypUsdcOpColl = '0x1588996B29513f00C63c979A1b28b1454B1639F6';
  const hypUsdcGoerli = '0xF6455dbBd6f60F069b71e8d1c28c5971978e733f';
  const hypUsdcMumbai = '0xB7FC58dA365D6E328362B5799ec8E9a7Ae13cA07';
  console.log('Running script');
  // let tx = await usdc.approve(hypUsdcOpColl, ethers.utils.parseEther('1000000000000000000'));
  let tx = await usdc.devMint(ethers.utils.parseEther('1000000000000000000'));
  console.log(tx);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
