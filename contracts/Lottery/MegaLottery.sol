// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "../Common/Ownable.sol";

contract MegaLottery is Ownable{
    
    enum Status {ACTIVE, COMPLETED}

    struct Draw {
        uint id;
        Status status;
        uint winnerTicket;
        uint startTime;
        uint endTime;
        uint price;
        uint totalTickets;
        uint[] bookedTickets;
    }

    bool public _paused;
    uint public _currentDraw = 0;
    uint public _time;
    uint public _price; 
    uint public _totalTickets; 

    mapping (uint => Draw) private _draws;

    mapping (uint =>  mapping(uint => address)) private _owners;

    mapping (address => uint) _balances;

    modifier isNotPaused(){
        require(_paused == false, "Permission Denied");
        _;
    }
    
    modifier isPaused(){
        require(_paused == true, "Permission Denied");
        _;
    }

    modifier active {
        require(_currentDraw == 0 || _draws[_currentDraw].status == Status.ACTIVE, 'Current draw should be active');
        _;
    }

    modifier completed {
        require(_currentDraw == 0 || _draws[_currentDraw].status == Status.COMPLETED, 'Current draw should be completed');
        _;
    }

    modifier timeAvailable {
        require(_currentDraw == 0 || block.timestamp < _draws[_currentDraw].endTime, 'Current draw time should be available');
        _;
    }
    
    modifier timeExpired {
        require(_currentDraw == 0 || block.timestamp > _draws[_currentDraw].endTime, 'Current draw time should be expired');
        _;
    }

    modifier costs(uint price){
        require(msg.value >= price, 'Please provide enough ether to buy ticket');
        _;
    }

    modifier ticketAvailable(uint ticket){
        require(_owners[_currentDraw][ticket] == address(0), 'Ticket already purchased');
        _;
    }

    modifier isValidDraw(uint drawId) {
        require(drawId > 0 && drawId <= _currentDraw, 'Draw not valid');
        _;
    }

    constructor (uint totalTickets, uint price, uint time){
        _totalTickets = totalTickets;
        _price = price;
        _time = time;
    }

    receive() external payable {}

    function getCurrentDraw() public view returns(Draw memory) {
        return _draws[_currentDraw];
    }

    function getDraw(uint drawId) public view isValidDraw(drawId) returns(Draw memory) {
        return _draws[drawId];
    }

    function getOwnerOfTicket(uint drawId, uint ticket) public view isValidDraw(drawId) returns(address) {
        return _owners[drawId][ticket];
    }

    function getBalance(address user) public view returns(uint) {
        return _balances[user];
    }

    function getEarningsBalance() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function getPurchasedTickets(uint drawId) public view isValidDraw(drawId) returns(uint[] memory, address[] memory) {
        uint totalTickets = _draws[drawId].bookedTickets.length;

        uint[] memory tickets = new uint[](totalTickets);
        address[] memory owners = new address[](totalTickets);
        for (uint i=0; i < totalTickets; i++) {
            tickets[i] = _draws[drawId].bookedTickets[i];
            owners[i] = _owners[drawId][_draws[drawId].bookedTickets[i]];
        }

        return (tickets, owners);
    }

    function getDrawWinner(uint drawId) public view returns(address){
        require(drawId > 0 && drawId < _currentDraw, 'Draw not valid');
        return _owners[drawId][_draws[drawId].winnerTicket];
    }

     function pause() isNotPaused public onlyOwner {
        _paused = true;
    }

    function unPause() isPaused public onlyOwner {
        _paused = false;
    }

    function setTime(uint time) public onlyOwner {
        _time = time;
    }

    function setPrice(uint price) public onlyOwner {
        _price = price;
    }

    function setTotalTickets(uint tickets) public onlyOwner {
        _totalTickets = tickets;
    }

    function buyTicket(uint ticket) public payable isNotPaused active timeAvailable costs(_price) ticketAvailable(ticket) {
        _draws[_currentDraw].bookedTickets.push(ticket);
        _owners[_currentDraw][ticket] = msg.sender;
    }

    function withdraw(address payable user, uint amount) public payable returns(bool){
        require(_balances[user] >= amount, 'Not enough balance');
        _balances[user] -= amount;
        (bool sent, bytes memory data) = user.call{value: amount}("");
        require(sent, "Withdraw failed");
        if (!sent)
            _balances[user] += amount;
        
        return sent;
    }

    function withdrawEarnings(address payable user, uint amount) public payable onlyOwner returns(bool){
        require(address(this).balance >= amount, 'Not enough balance');
        (bool sent, bytes memory data) = user.call{value: amount}("");
        return sent;
    }

    function endCurrentAndStartNewDraw() public payable isNotPaused onlyOwner returns(uint) {
        if (_currentDraw != 0) 
            endDraw();
        newDraw();
        return _currentDraw;
    }

    function newDraw() private completed timeExpired {
        ++ _currentDraw;
        uint[] memory tickets;

        _draws[_currentDraw] = Draw(
            _currentDraw,
            Status.ACTIVE,
            0,
            block.timestamp,
            block.timestamp + _time,
            _price,
            _totalTickets,
            tickets
        );
    }

    function endDraw() private active timeExpired {
        _draws[_currentDraw].status = Status.COMPLETED;
        uint totalTickets = _draws[_currentDraw].bookedTickets.length;
        if (totalTickets == 0) return;

        uint totalPrice = totalTickets * _draws[_currentDraw].price;
        uint winnerTicket = _draws[_currentDraw].bookedTickets[selectWinner(totalTickets)];
        address winner = _owners[_currentDraw][winnerTicket];
        _draws[_currentDraw].winnerTicket = winnerTicket;
        _balances[winner] = totalPrice;
    }

    function selectWinner(uint number) view private returns(uint){
        return uint(keccak256(abi.encodePacked(_currentDraw, block.timestamp, block.difficulty, msg.sender, number))) % number;
    }
}
