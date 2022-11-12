import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS_ARRAY = ["Choco", "Vanilla", "Citrus"];

describe("Ballot", () => {
  let BallotContract: Ballot;
  let accounts: SignerWithAddress[];
  let chairman;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const BallotContractFactory = await ethers.getContractFactory("Ballot");
    BallotContract = await BallotContractFactory.deploy(
      PROPOSALS_ARRAY.map((propo) => ethers.utils.formatBytes32String(propo))
    );
    await BallotContract.deployed();
  });

  describe("when the contract is deployed", async () => {
    it("has the provided proposal", async () => {
      for (let i = 0; i < PROPOSALS_ARRAY.length; i++) {
        const proposal = await BallotContract.proposals(0);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.equal(
          PROPOSALS_ARRAY[0]
        );
      }
    });
    it("sets the deployer address as chaiperson", async () => {
      chairman = await BallotContract.chairman();
      expect(chairman).to.eq(accounts[0].address);
    });
    it("sets the voting weight for the chairperson at 1", async () => {
      const chairmanVoter = await BallotContract.voters(accounts[0].address);
      expect(chairmanVoter.weight).to.be.equal(1);
    });
  });

  describe("when to give someone the right to vote", async function () {
    it("only the chairman can call", async function () {
      const accountConnectedContract = BallotContract.connect(accounts[1]);
      await expect(
        accountConnectedContract.giveRightToVote(accounts[2].address)
      ).to.be.reverted;
    });
    it("the voter has now a vote weight of 1", async function () {
      BallotContract.giveRightToVote(accounts[1].address);
      const voteStatusUser = await BallotContract.voters(accounts[1].address);

      expect(voteStatusUser.weight.toString()).to.equal("1");
    });
  });

  describe("Vote function", function () {
    beforeEach(async function () {
      BallotContract.giveRightToVote(accounts[1].address);
    });
    it("should change the voted status to true", async function () {
      const accountConnectedContract = BallotContract.connect(accounts[1]);
      await accountConnectedContract.vote(0);
      const voteStatusUser = await accountConnectedContract.voters(
        accounts[1].address
      );

      expect(voteStatusUser.voted).to.equal(true);
    });
    it("should change to the proposal voted", async function () {
      const accountConnectedContract = BallotContract.connect(accounts[1]);
      const proposalVotedIndex = 0;
      await accountConnectedContract.vote(proposalVotedIndex);
      const voteStatusUser = await accountConnectedContract.voters(
        accounts[1].address
      );

      expect(voteStatusUser.vote).to.equal(0);
    });
    it("should updated the votecount of the proposal", async function () {
      const accountConnectedContract = BallotContract.connect(accounts[1]);
      const proposalVotedIndex = 0;
      const voteStatusUserPrevious = await accountConnectedContract.voters(
        accounts[1].address
      );
      await accountConnectedContract.vote(proposalVotedIndex);
      const votedProposal = await accountConnectedContract.getProposalsArray(
        proposalVotedIndex
      );

      expect(votedProposal.voteCount.toString()).to.equal(
        voteStatusUserPrevious.weight.toString()
      );
    });
  });

  describe("Winning proposal", function () {
    beforeEach(async function () {
      BallotContract.giveRightToVote(accounts[1].address);
    });
    it("get the correct winning proposal", async function () {
      const accountConnectedContract = BallotContract.connect(accounts[1]);
      const proposalVotedIndex = 2;
      await accountConnectedContract.vote(proposalVotedIndex);
      const winningVoteCount = await accountConnectedContract.winningProposal();

      expect(winningVoteCount.toString()).to.equal("2");
    });
  });
});
