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

  it('should successfully update charity score and emit CharityEligibilityUpdated event', async () => {
    await attestationStation.connect(other)['attest(address,bytes32,bytes)'](charity.address, REGISTRATION_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, TAX_EXEMPT_STATUS_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, FINANCIAL_STATEMENTS_KEY, '0x40');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, MISSION_STATEMENT_KEY, '0x50');

    const tx = await multinate.connect(other).updateCharityScore(charity.address);
    expect(await multinate.charityScores(charity.address)).to.equal(86);

    await expect(tx).to.emit(multinate, 'CharityEligibilityUpdated').withArgs(charity.address, true);
  });

  it('should return correct eligibility status for a charity', async () => {
    await attestationStation.connect(other)['attest(address,bytes32,bytes)'](charity.address, REGISTRATION_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, TAX_EXEMPT_STATUS_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, FINANCIAL_STATEMENTS_KEY, '0x40');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, MISSION_STATEMENT_KEY, '0x50');

    await multinate.connect(other).updateCharityScore(charity.address);
    expect(await multinate.isCharityEligible(charity.address)).to.equal(true);
  });

  it('should successfully create a campaign and emit CampaignCreated event', async () => {
    await attestationStation.connect(other)['attest(address,bytes32,bytes)'](charity.address, REGISTRATION_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, TAX_EXEMPT_STATUS_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, FINANCIAL_STATEMENTS_KEY, '0x40');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, MISSION_STATEMENT_KEY, '0x50');

    await multinate.connect(other).updateCharityScore(charity.address);
    const now = Math.floor(Date.now() / 1000);
    const lowerBound = now + 86400 - 10; // Add a tolerance range of 10 seconds (optional)
    const upperBound = now + 86400 + 10; // Add a tolerance range of 10 seconds (optional)

    const tx = await multinate.connect(charity).createCampaign('Test Campaign', 'Test Description', 1000, now + 86400);
    await expect(tx).to.emit(multinate, 'CampaignCreated');

    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === 'CampaignCreated');

    if (event && event.args) {
      expect(event.args[0]).to.equal(1); // Campaign ID
      expect(event.args[1]).to.equal(charity.address); // Charity address
      expect(event.args[2]).to.equal('Test Campaign'); // Title
      expect(event.args[3]).to.equal(1000); // Target amount
      expect(event.args[4]).to.be.within(lowerBound, upperBound); // Deadline
    } else {
      throw new Error('CampaignCreated event not found');
    }
  });

  it('should fail to create a campaign with an ineligible charity', async () => {
    await expect(
      multinate
        .connect(charity)
        .createCampaign('Invalid Campaign', 'A description of the campaign', 1000, Date.now() + 86400)
    ).to.be.revertedWith('The charity organization is not eligible');
  });

  it('should fail to create a campaign with an invalid target amount', async () => {
    await attestationStation.connect(other)['attest(address,bytes32,bytes)'](charity.address, REGISTRATION_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, TAX_EXEMPT_STATUS_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, FINANCIAL_STATEMENTS_KEY, '0x40');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, MISSION_STATEMENT_KEY, '0x50');

    await multinate.connect(other).updateCharityScore(charity.address);

    await expect(
      multinate
        .connect(charity)
        .createCampaign('Invalid Campaign', 'A description of the campaign', 0, Date.now() + 86400)
    ).to.be.revertedWith('Target amount must be greater than zero');
  });

  it('should fail to create a campaign with an invalid deadline', async () => {
    await attestationStation.connect(other)['attest(address,bytes32,bytes)'](charity.address, REGISTRATION_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, TAX_EXEMPT_STATUS_KEY, '0x01');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, FINANCIAL_STATEMENTS_KEY, '0x40');
    await attestationStation
      .connect(other)
      ['attest(address,bytes32,bytes)'](charity.address, MISSION_STATEMENT_KEY, '0x50');

    await multinate.connect(other).updateCharityScore(charity.address);

    await expect(
      multinate
        .connect(charity)
        .createCampaign(
          'Invalid Campaign',
          'A description of the campaign',
          1000,
          Math.floor(Date.now() / 1000) - 86400
        )
    ).to.be.revertedWith('Deadline must be in the future');
  });
});
