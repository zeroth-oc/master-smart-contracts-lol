// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../Common/Ownable.sol";

interface IERC20 {
  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);

  function transfer(address to, uint256 amount) external returns (bool);

  function balanceOf(address account) external view returns (uint256);
}

contract StakingRewards is Ownable {
  IERC20 public immutable stakingToken;
  IERC20 public immutable rewardToken;

  // State variables to calculate rewards
  uint256 public finishedAt;
  uint256 public updateAt;
  uint256 public duration;
  uint256 public rewardRate;
  uint256 public rewardPerTokenStored;
  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;

  // State variables to calculate user's stake and total supply
  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;

  constructor(IERC20 _stakingToken, IERC20 _rewardToken) {
    stakingToken = IERC20(_stakingToken);
    rewardToken = IERC20(_rewardToken);
  }

  modifier updateReward(address _account) {
    rewardPerTokenStored = rewardPerToken();
    updateAt = rewardApplicableTime();

    if (_account != address(0)) {
      rewards[msg.sender] = earned(msg.sender);
      userRewardPerTokenPaid[msg.sender] = rewardPerTokenStored;
    }
    _;
  }

  function setDuration(uint256 _duration) external onlyOwner {
    require(finishedAt < block.timestamp, "Reward not finished yet");
    duration = _duration;
  }

  function updateRewardAmount(uint256 _amount)
    external
    onlyOwner
    updateReward(address(0))
  {
    require(_amount > 0, "Reward amount should be greater than zero");
    require(duration > 0, "Duration is not set");

    if (finishedAt > block.timestamp) {
      uint256 remainingRewards = (finishedAt - block.timestamp) * rewardRate;
      rewardRate = (remainingRewards + _amount) / duration;
    } else {
      rewardRate = _amount / duration;
    }

    require(rewardRate > 0, "Rewards is equal to zero");
    require(
      rewardToken.balanceOf(address(this)) >= (rewardRate * duration),
      "Insufficient reward tokens"
    );

    finishedAt = block.timestamp + duration;
    updateAt = block.timestamp;
  }

  function stake(uint256 _amount) external updateReward(msg.sender) {
    require(_amount > 0, "Amount should be greater than zero");
    require(block.timestamp < finishedAt, "The staking is completed");

    bool received = stakingToken.transferFrom(
      msg.sender,
      address(this),
      _amount
    );
    require(received, "Failed to receive tokens");

    balanceOf[msg.sender] += _amount;
    totalSupply += _amount;
  }

  function withdraw(uint256 _amount) external updateReward(msg.sender) {
    require(_amount > 0, "Amount should be greater than zero");
    require(
      balanceOf[msg.sender] >= _amount,
      "Insufficient tokens to withdraw"
    );

    balanceOf[msg.sender] -= _amount;
    totalSupply -= _amount;

    bool transferred = stakingToken.transfer(msg.sender, _amount);
    require(transferred, "Failed to transfer tokens");
  }

  function earned(address _account) public view returns (uint256) {
    uint256 pendingRewards = balanceOf[_account] *
      (rewardPerToken() - userRewardPerTokenPaid[_account]);
    return rewards[_account] + (pendingRewards / 1e18);
  }

  function getEarned() public {
    uint256 earnedTokens = earned(msg.sender);
    require(earnedTokens > 0, "Not enough rewards tokens to withdraw");
    require(
      earnedTokens < rewardToken.balanceOf(address(this)),
      "Not enough rewards tokens in contract"
    );

    rewards[msg.sender] = 0;
    rewardToken.transfer(msg.sender, earnedTokens);
  }

  function rewardApplicableTime() internal view returns (uint256) {
    return _min(finishedAt, block.timestamp);
  }

  function rewardPerToken() internal view returns (uint256) {
    if (totalSupply == 0) {
      return rewardPerTokenStored;
    }

    return
      rewardPerTokenStored +
      ((rewardRate * (rewardApplicableTime() - updateAt) * 1e18) / totalSupply);
  }

  function _min(uint256 a, uint256 b) internal pure returns (uint256) {
    return (a > b) ? b : a;
  }
}
