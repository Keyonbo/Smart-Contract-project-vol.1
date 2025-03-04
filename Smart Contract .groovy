// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GiftEscrow
 * @dev A smart contract for creating ETH "time-locked" gifts.
 */
contract GiftEscrow {
    // Structure representing a single gift
    struct Gift {
        address sender;       // Address of the sender (gift giver)
        address recipient;    // Address of the recipient
        uint256 amount;       // Amount of ETH (in wei) that is locked
        uint256 unlockTime;   // Timestamp when the gift can be withdrawn
        bool withdrawn;       // Indicates whether the gift has been withdrawn
    }

    // Array of all gifts
    Gift[] public gifts;

    // Event emitted when a new gift is created
    event GiftCreated(
        uint256 giftId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 unlockTime
    );

    // Event emitted when a gift has been successfully withdrawn
    event GiftWithdrawn(
        uint256 giftId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Creates a new gift and locks ETH until `block.timestamp + _delayInSeconds`.
     * @param _recipient The address of the gift recipient
     * @param _delayInSeconds The number of seconds after which the gift can be unlocked
     */
    function createGift(address _recipient, uint256 _delayInSeconds) external payable {
        require(msg.value > 0, "Must send ETH to create a gift");
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(_delayInSeconds > 0, "Delay must be greater than zero");

        // Calculate the unlock time as the current timestamp + delay
        uint256 unlockTime = block.timestamp + _delayInSeconds;

        // Create the Gift struct
        Gift memory newGift = Gift({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            unlockTime: unlockTime,
            withdrawn: false
        });

        // Store it in the array and get its ID
        gifts.push(newGift);
        uint256 giftId = gifts.length - 1;

        // Emit the event
        emit GiftCreated(giftId, msg.sender, _recipient, msg.value, unlockTime);
    }

    /**
     * @dev Allows the recipient to withdraw the gift after the unlockTime has passed.
     * @param _giftId The ID of the gift in the gifts array
     */
    function withdrawGift(uint256 _giftId) external {
        // Validate the gift ID
        require(_giftId < gifts.length, "Invalid gift ID");

        // Reference the gift struct
        Gift storage gift = gifts[_giftId];

        // Check that the gift has not already been withdrawn
        require(!gift.withdrawn, "Gift already withdrawn");
        // Check if the unlock time has passed
        require(block.timestamp >= gift.unlockTime, "Not yet unlocked");
        // Check that the caller is the actual recipient
        require(msg.sender == gift.recipient, "Only recipient can withdraw");

        // Mark the gift as withdrawn
        gift.withdrawn = true;

        // Transfer the funds to the recipient
        payable(gift.recipient).transfer(gift.amount);

        // Emit the withdrawal event
        emit GiftWithdrawn(_giftId, gift.recipient, gift.amount);
    }

    /**
     * @dev Returns the total number of gifts (e.g., for frontend use).
     * @return The count of stored gifts
     */
    function getGiftCount() external view returns (uint256) {
        return gifts.length;
    }

    /**
     * @dev Returns information about a specific gift.
     * @param _giftId The ID of the gift
     */
    function getGift(uint256 _giftId)
        external
        view
        returns (
            address sender,
            address recipient,
            uint256 amount,
            uint256 unlockTime,
            bool withdrawn
        )
    {
        require(_giftId < gifts.length, "Invalid gift ID");
        Gift storage gift = gifts[_giftId];
        return (gift.sender, gift.recipient, gift.amount, gift.unlockTime, gift.withdrawn);
    }
}
