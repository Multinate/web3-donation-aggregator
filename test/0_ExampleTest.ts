import 'dotenv/config';

// import { ExampleContract } from '../typechain';
import { BigNumber, BigNumberish } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { expect } = require('chai');

let owner: SignerWithAddress;
let user: SignerWithAddress;
let user2: SignerWithAddress;
// let exampleContract: ExampleContract;

//// ExampleContract

describe('ExampleContract', function () {
  // Add your test cases.
  before(async () => {
    await deployments.fixture();
    [owner, user, user2] = await ethers.getSigners();
    // Thing to do before everything
  });
  it('Should .... ....', async () => {
    // Test something
  });
});
