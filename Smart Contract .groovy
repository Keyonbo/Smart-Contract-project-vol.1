// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GiftEscrow
 * @dev Smart kontrakt pro vytváření "časově uzamčených" dárků v ETH.
 */
contract GiftEscrow {
    // Struktura reprezentující jeden dar
    struct Gift {
        address sender;       // Adresa dárce
        address recipient;    // Adresa příjemce
        uint256 amount;       // Množství ETH (v wei), které je uzamčeno
        uint256 unlockTime;   // Čas (timestamp), kdy je dárek možné vybrat
        bool withdrawn;       // Označuje, zda byl dárek vyzvednut
    }

    // Pole všech dárků
    Gift[] public gifts;

    // Událost pro informování o nově vytvořeném dárku
    event GiftCreated(
        uint256 giftId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 unlockTime
    );

    // Událost pro informování o úspěšném vybrání dárku
    event GiftWithdrawn(
        uint256 giftId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Vytvoří nový dárek a uzamkne do něj ETH.
     * @param _recipient Adresa příjemce dárku
     * @param _unlockTime Čas (timestamp), kdy je možné dárek vybrat
     */
    function createGift(address _recipient, uint256 _unlockTime) external payable {
        require(msg.value > 0, "Must send ETH to create a gift");
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(
            _unlockTime > block.timestamp,
            "Unlock time must be in the future"
        );

        // Vytvoření struktury Gift
        Gift memory newGift = Gift({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            unlockTime: _unlockTime,
            withdrawn: false
        });

        // Uložíme do pole a získáme ID
        gifts.push(newGift);
        uint256 giftId = gifts.length - 1;

        // Emitujeme událost
        emit GiftCreated(giftId, msg.sender, _recipient, msg.value, _unlockTime);
    }

    /**
     * @dev Příjemce vybere dárek, pokud už nastal unlockTime.
     * @param _giftId ID dárku v poli gifts
     */
    function withdrawGift(uint256 _giftId) external {
        // Validace ID
        require(_giftId < gifts.length, "Invalid gift ID");

        // Pomocná reference na strukturu (ukazatel)
        Gift storage gift = gifts[_giftId];

        // Kontrola, že už nebyl vyzvednut
        require(!gift.withdrawn, "Gift already withdrawn");
        // Kontrola času
        require(block.timestamp >= gift.unlockTime, "Not yet unlocked");
        // Kontrola, že volající je skutečný příjemce
        require(msg.sender == gift.recipient, "Only recipient can withdraw");

        // Značíme dárek jako vyzvednutý
        gift.withdrawn = true;

        // Poslání peněz příjemci
        payable(gift.recipient).transfer(gift.amount);

        // Emit události
        emit GiftWithdrawn(_giftId, gift.recipient, gift.amount);
    }

    /**
     * @dev Získat počet všech dárků (např. pro frontend).
     * @return počet uložených dárků
     */
    function getGiftCount() external view returns (uint256) {
        return gifts.length;
    }

    /**
     * @dev Získat informace o konkrétním dárku.
     * @param _giftId ID dárku
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
