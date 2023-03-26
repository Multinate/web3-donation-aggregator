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
  const hypdUSDC = '0x4cC972d299b96ae3663002433aC6944e6c6a5229';
  const hypdUSDCContract = await ethers.getContractAt('MockUSDC', hypdUSDC, signers[0]);

  console.log('Running script');
  let deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  await hypdUSDCContract.approve('0xb1B9e0B66eA339c13a3282bdE47BE06D79246438', ethers.utils.parseUnits('100000', 18));
  //let tx = await pancakeFactory.createPair('0x4cC972d299b96ae3663002433aC6944e6c6a5229', mockERC20.address);
  // let tx = await hypdUSDCContract.approve(pancakeRouter.address, ethers.utils.parseUnits('100000', 18));
  // let tx2 = await mockERC20.approve(pancakeRouter.address, ethers.utils.parseUnits('100000', 18));
  //const pairAddress = await pancakeFactory.getPair(usdc.address, mockERC20.address);
  // let tx = await mockERC20.devMint(ethers.utils.parseEther('10000000000000000'));
  // let tx = await pancakeRouter.addLiquidity(
  //   hypdUSDCContract.address,
  //   mockERC20.address,
  //   ethers.utils.parseEther('10000'),
  //   ethers.utils.parseEther('10000'),
  //   0,
  //   0,
  //   signers[0].address,
  //   deadline
  // );
  // let tx = await pancakeRouter.swapExactTokensForTokens(
  //   ethers.utils.parseUnits('100', 18),
  //   0,
  //   [usdc.address, mockERC20.address],
  //   signers[0].address,
  //   deadline
  // );
  // console.log(tx);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
