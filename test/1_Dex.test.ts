import 'dotenv/config';
import { PancakeFactory, PancakeRouter, MockERC20, MockUSDC, MockWETH, SwapManager } from '../typechain';

import { BigNumber, BigNumberish } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { expect } = require('chai');

describe('Pancake', () => {
  let factory: PancakeFactory;
  let router: PancakeRouter;
  let usdc: MockUSDC;
  let swapManager: SwapManager;
  let erc20: MockERC20;
  let weth: MockWETH;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    [owner, user, other] = signers;
    await deployments.fixture(['Factory', 'Router', 'MockERC20', 'MockUSDC', 'Mock', 'SwapManager', 'Multinate']);
    factory = await ethers.getContract('PancakeFactory');
    router = await ethers.getContract('PancakeRouter');
    usdc = await ethers.getContract('MockUSDC');
    erc20 = await ethers.getContract('MockERC20');
    weth = await ethers.getContract('MockWETH');
    swapManager = await ethers.getContract('SwapManager');
    // Mint 10000 of each token
    await usdc.devMint(ethers.utils.parseUnits('10000000', 18));
    await erc20.devMint(ethers.utils.parseUnits('10000000', 18));
    // Approve router to spend tokens
    await usdc.approve(router.address, ethers.utils.parseUnits('10000000', 18));
    await erc20.approve(router.address, ethers.utils.parseUnits('10000000', 18));

    // Approve swap manager to spend tokens
    await usdc.approve(swapManager.address, ethers.utils.parseUnits('10000000', 18));
    await erc20.approve(swapManager.address, ethers.utils.parseUnits('10000000', 18));
  });

  it('should add liquidity', async () => {
    console.log(await factory.INIT_CODE_PAIR_HASH());
    // Create pair
    await factory.createPair(usdc.address, erc20.address);
    // Get pair address
    const pairAddress = await factory.getPair(usdc.address, erc20.address);
    // log pairaddress
    console.log('Pair address: ', pairAddress);
    // Deadline is 10 minutes of now
    let deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    // Add liquidity
    await router.addLiquidity(
      usdc.address,
      erc20.address,
      ethers.utils.parseUnits('10000', 18),
      ethers.utils.parseUnits('10000', 18),
      0,
      0,
      owner.address,
      deadline
    );

    // Swap
    await router.swapExactTokensForTokens(
      ethers.utils.parseUnits('100', 18),
      0,
      [usdc.address, erc20.address],
      owner.address,
      deadline
    );

    // await swapManager
    //   .connect(owner)
    //   .donate(erc20.address, ethers.utils.parseEther('10'), { value: ethers.utils.parseEther('0.01') });

    // // expect baalnce of swapmanager to ve 10
    // expect(await usdc.balanceOf(swapManager.address)).to.equal(ethers.utils.parseEther('10'));
  });
});
