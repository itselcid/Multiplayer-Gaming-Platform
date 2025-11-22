// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TournamentFactory {
    address public owner;

    Tournament[] public tournaments;

    enum Status {
        Pending,
        OnGoing,
        Finished
    }

    struct Tournament {
        uint id;
        string title;
        uint entryFee;
        uint8 participants;
        uint startTime;
        Status status;
    }

    constructor() {
        owner = msg.sender;
    }

    // error AdminOnly(address msg_sender);
    event TournamentCreated(
        uint id,
        uint entryFee,
        uint8 participants,
        uint startDate,
        Status status
    );

    function createTournament(
        string memory _title,
        uint _entryFee,
        uint8 _participants,
        uint _startTime,
        Status _status
    ) public {
        // require(msg.sender == owner, AdminOnly(msg.sender));
        tournaments.push(
            Tournament({
                id: tournaments.length,
                title: _title,
                entryFee: _entryFee,
                participants: _participants,
                startTime: _startTime,
                status: _status
            })
        );
        emit TournamentCreated(
            tournaments.length,
            _entryFee,
            _participants,
            _startTime,
            _status
        );
    }

    function getTournaments() public view returns (Tournament[] memory) {
        return (tournaments);
    }

    function getTournament(uint id) public view returns (Tournament memory) {
        return (tournaments[id]);
    }
}
