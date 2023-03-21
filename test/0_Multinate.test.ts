import 'dotenv/config';
import { Multinate, AttestationStation } from '../typechain';

import { BigNumber, BigNumberish } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { expect } = require('chai');

describe('Multinate', () => {
  let multinate: Multinate;
  let attestationStation: AttestationStation;
  let owner: SignerWithAddress;
  let charity: SignerWithAddress;
  let user: SignerWithAddress;
  let other: SignerWithAddress;
  let REGISTRATION_KEY: string;
  let TAX_EXEMPT_STATUS_KEY: string;
  let FINANCIAL_STATEMENTS_KEY: string;
  let MISSION_STATEMENT_KEY: string;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    [owner, charity, user, other] = signers;
    await deployments.fixture(['AttestationStation', 'Multinate']);
    attestationStation = await ethers.getContract('AttestationStation');
    multinate = await ethers.getContract('Multinate');

    REGISTRATION_KEY = await multinate.REGISTRATION_KEY();
    TAX_EXEMPT_STATUS_KEY = await multinate.TAX_EXEMPT_STATUS_KEY();
    FINANCIAL_STATEMENTS_KEY = await multinate.FINANCIAL_STATEMENTS_KEY();
    MISSION_STATEMENT_KEY = await multinate.MISSION_STATEMENT_KEY();
  });

  it('should set the correct attestation station and minimum attestation score', async () => {
    expect(await multinate.attestationStation()).to.equal(attestationStation.address);
    expect(await multinate.minimumAttestationScore()).to.equal(50);
  });

  it('should allow the owner to set the minimum attestation score', async () => {
    await multinate.connect(owner).setMinimumAttestationScore(75);
    expect(await multinate.minimumAttestationScore()).to.equal(75);
  });
