import { MockUSDC, PancakeRouter, PancakeFactory, MockERC20 } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  const usdc: MockUSDC = await ethers.getContract('MockUSDC', signers[0]);
  const pancakeRouter: PancakeRouter = await ethers.getContract('PancakeRouter', signers[0]);
  const pancakeFactory: PancakeFactory = await ethers.getContract('PancakeFactory', signers[0]);
  const mockERC20: MockERC20 = await ethers.getContract('MockERC20', signers[0]);
  const hypUsdcOpColl = '0x1588996B29513f00C63c979A1b28b1454B1639F6';
  const hypUsdcGoerli = '0xF6455dbBd6f60F069b71e8d1c28c5971978e733f';
  const hypUsdcMumbai = '0xB7FC58dA365D6E328362B5799ec8E9a7Ae13cA07';
  console.log('Running script');
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  // let tx = await pancakeFactory.createPair(mockERC20.address, usdc.address);
  // let tx = await usdc.approve(pancakeRouter.address, ethers.utils.parseUnits('100000', 18));
  // let tx2 = await mockERC20.approve(pancakeRouter.address, ethers.utils.parseUnits('100000', 18));
  //const pairAddress = await pancakeFactory.getPair(usdc.address, mockERC20.address);
  //let tx = await mockERC20.devMint(ethers.utils.parseEther('10000000000000000'));
  // let tx = await pancakeRouter.addLiquidity(
  //   usdc.address,
  //   mockERC20.address,
  //   ethers.utils.parseEther('1000000'),
  //   ethers.utils.parseEther('1000000'),
  //   0,
  //   0,
  //   signers[0].address,
  //   deadline
  // );
  let tx = await pancakeRouter.swapExactTokensForTokens(
    ethers.utils.parseUnits('100', 18),
    0,
    [usdc.address, mockERC20.address],
    signers[0].address,
    deadline
  );
  console.log(tx);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
