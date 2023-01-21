const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Rewards", () => {
  let staking;
  let account1, account2;
  let stakingToken, rewardToken;

  beforeEach(async () => {
    [account1, account2] = await ethers.getSigners();

    const StakingToken = await ethers.getContractFactory("ERC20Token1");
    stakingToken = await StakingToken.deploy();

    const RewardToken = await ethers.getContractFactory("ERC20Token2");
    rewardToken = await RewardToken.deploy();

    const Staking = await ethers.getContractFactory("StakingRewards");
    staking = await Staking.deploy(stakingToken.address, rewardToken.address);

    rewardToken.mint(staking.address, ethers.utils.parseEther("10000"));
  });

  it("Update Duration and Update reward works", async () => {
    expect(await rewardToken.balanceOf(staking.address)).to.be.equal(
      ethers.utils.parseEther("10000")
    );

    await expect(
      staking.updateRewardAmount(ethers.utils.parseEther("12"))
    ).to.be.rejectedWith("Duration is not set");

    expect(await staking.duration()).to.be.equal(0);
    await staking.setDuration(60 * 60);
    expect(await staking.duration()).to.be.equal(3600);
    expect(await staking.finishedAt()).to.be.equal(0);

    expect(await staking.rewardRate()).to.be.equal(0);
    await staking.updateRewardAmount(ethers.utils.parseEther("7200"));
    await expect(staking.setDuration(60 * 60)).to.be.rejectedWith(
      "Reward not finished yet"
    );
    await expect(
      staking.updateRewardAmount(ethers.utils.parseEther("0"))
    ).to.be.rejectedWith("Reward amount should be greater than zero");
    expect(await staking.rewardRate()).to.be.equal(
      ethers.utils.parseEther("2")
    );
    expect(await staking.finishedAt()).not.to.be.equal(0);
  });

  it("Staking works", async () => {
    await staking.setDuration(60 * 60);
    await staking.updateRewardAmount(ethers.utils.parseEther("7200"));
    expect(await staking.rewardRate()).to.be.equal(
      ethers.utils.parseEther("2")
    );

    await stakingToken.mint(account1.address, ethers.utils.parseEther("1000"));
    await stakingToken
      .connect(account1)
      .approve(staking.address, ethers.utils.parseEther("1000"));
    expect(await staking.balanceOf(account1.address)).to.be.equal(0);
    await staking.connect(account1).stake(ethers.utils.parseEther("1000"));
    expect(await staking.balanceOf(account1.address)).to.be.equal(
      ethers.utils.parseEther("1000")
    );
    expect(await staking.userRewardPerTokenPaid(account1.address)).to.be.equal(
      0
    );

    await stakingToken.mint(account2.address, ethers.utils.parseEther("2000"));
    await stakingToken
      .connect(account2)
      .approve(staking.address, ethers.utils.parseEther("2000"));
    expect(await staking.balanceOf(account2.address)).to.be.equal(0);
    await staking.connect(account2).stake(ethers.utils.parseEther("2000"));
    expect(await staking.balanceOf(account2.address)).to.be.equal(
      ethers.utils.parseEther("2000")
    );
    expect(await staking.totalSupply()).to.be.equal(
      ethers.utils.parseEther("3000")
    );
  });

  it("Withdraw works for single staker", async () => {
    await staking.setDuration(60 * 60);
    await staking.updateRewardAmount(ethers.utils.parseEther("7200"));
    expect(await staking.rewardRate()).to.be.equal(
      ethers.utils.parseEther("2")
    );

    await stakingToken.mint(account1.address, ethers.utils.parseEther("1000"));
    await stakingToken
      .connect(account1)
      .approve(staking.address, ethers.utils.parseEther("1000"));
    let block = await ethers.provider.getBlockNumber();
    let stakeTimestamp = (await ethers.provider.getBlock(block)).timestamp + 1;
    await staking.connect(account1).stake(ethers.utils.parseEther("1000"));

    await mine(10000);

    await staking.connect(account1).withdraw(ethers.utils.parseEther("1000"));
    let finishedTimestamp = await staking.finishedAt();
    expect(await stakingToken.balanceOf(account1.address)).to.be.equal(
      ethers.utils.parseEther("1000")
    );
    let expectedReward = (finishedTimestamp - stakeTimestamp) * 2;
    expect(await staking.earned(account1.address)).to.be.equal(
      ethers.utils.parseEther(expectedReward.toString())
    );
    await staking.getEarned();
    expect(await rewardToken.balanceOf(account1.address)).to.be.equal(
      ethers.utils.parseEther(expectedReward.toString())
    );
  });

  it("Withdraw works for multiple stakers", async () => {
    await staking.setDuration(60 * 60);
    await staking.updateRewardAmount(ethers.utils.parseEther("7200"));
    expect(await staking.rewardRate()).to.be.equal(
      ethers.utils.parseEther("2")
    );

    await stakingToken.mint(account1.address, ethers.utils.parseEther("1000"));
    await stakingToken
      .connect(account1)
      .approve(staking.address, ethers.utils.parseEther("1000"));

    await stakingToken.mint(account2.address, ethers.utils.parseEther("2000"));
    await stakingToken
      .connect(account2)
      .approve(staking.address, ethers.utils.parseEther("2000"));

    let block = await ethers.provider.getBlockNumber();
    await staking.connect(account1).stake(ethers.utils.parseEther("1000"));

    await mine(1000);

    block = await ethers.provider.getBlockNumber();
    await staking.connect(account2).stake(ethers.utils.parseEther("2000"));

    await mine(10000);

    await staking.connect(account1).withdraw(ethers.utils.parseEther("1000"));
    expect(await stakingToken.balanceOf(account1.address)).to.be.equal(
      ethers.utils.parseEther("1000")
    );
    console.log("Account 1 rewards", await staking.earned(account1.address));

    await staking.connect(account2).withdraw(ethers.utils.parseEther("2000"));
    expect(await stakingToken.balanceOf(account2.address)).to.be.equal(
      ethers.utils.parseEther("2000")
    );
    console.log("Account 2 rewards", await staking.earned(account2.address));
  });
});
