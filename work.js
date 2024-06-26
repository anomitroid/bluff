const cardGrid = document.getElementById('card-grid');
const playerLeft = document.getElementById('player-left');
const playerRight = document.getElementById('player-right');
const shuffleButton = document.getElementById('shuffle-button');
const distributeButton = document.getElementById('distribute-button');
const cardSlider = document.getElementById('card-slider');
const sliderLabel = document.getElementById('slider-label');
const sliderValue = document.getElementById('slider-value');
const gameArea = document.createElement('div');
gameArea.id = 'game-area';
document.body.appendChild(gameArea);

let draggedCard = null;
let activePlayer = null;
let remainingMoves = 0;
let gameAreaCounter = 0;

let lastPlay = {
    player: null,
    rank: null,
    count: 0
};

// Create deck and display initial cards
let deck = [];
const suits = ['♠', '♥', '♣', '♦'];
const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

function createCard(suit, rank) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper';

    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.dataset.suit = suit;
    card.dataset.rank = rank;

    const cardBack = document.createElement('div');
    cardBack.className = `card-back ${(suit === '♥' || suit === '♦') ? 'red' : 'black'}`;

    const topSuit = document.createElement('div');
    topSuit.className = 'suit-top';
    topSuit.textContent = `${rank}${suit}`;

    const bottomSuit = document.createElement('div');
    bottomSuit.className = 'suit-bottom';
    bottomSuit.textContent = `${rank}${suit}`;

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';

    cardFront.appendChild(topSuit);
    cardFront.appendChild(bottomSuit);

    card.appendChild(cardBack);
    card.appendChild(cardFront);
    cardWrapper.appendChild(card);

    cardWrapper.addEventListener('click', (e) => {
        if (cardWrapper.parentElement.classList.contains('card-container')) {
            e.stopPropagation();
            card.classList.toggle('flipped');
        }
    });

    return cardWrapper;
}

function createDeck() {
    deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push(createCard(suit, rank));
        });
    });
    displayDeck();
}

function displayDeck() {
    cardGrid.innerHTML = '';
    deck.forEach((cardWrapper, index) => {
        cardGrid.appendChild(cardWrapper);
    });
    setTimeout(() => {
        deck.forEach((cardWrapper, index) => {
            stackCards(index);
        });
    }, 10);
}

function stackCards(index) {
    const card = deck[index];
    const totalCards = deck.length;
    const maxOffset = 2;
    const maxRotation = 2;

    const offsetX = (Math.random() - 0.5) * maxOffset;
    const offsetY = index * 0.5;
    const rotation = (Math.random() - 0.5) * maxRotation;

    card.style.transform = `translateY(${offsetY}px) translateX(${offsetX}px) rotate(${rotation}deg)`;
    card.style.zIndex = index;

    const translateZ = (totalCards - index) * 0.2;
    card.style.transform += ` translateZ(${translateZ}px)`;
}

// Drag and drop functions
function dragStart(event) {
    if (activePlayer && 
        event.target.closest('.player-area') === activePlayer && 
        remainingMoves > 0 &&
        !event.target.closest('.card').classList.contains('flipped')) {
        draggedCard = event.target.closest('.card-wrapper');
        setTimeout(() => {
            draggedCard.style.display = 'none';
        }, 0);
    } else {
        event.preventDefault();
    }
}

function dragEnd() {
    if (draggedCard) {
        draggedCard.style.display = 'block';
        draggedCard = null;
    }
}

playerLeft.addEventListener('dragover', dragOver);
playerLeft.addEventListener('dragenter', dragEnter);
playerLeft.addEventListener('dragleave', dragLeave);
playerLeft.addEventListener('drop', drop);

playerRight.addEventListener('dragover', dragOver);
playerRight.addEventListener('dragenter', dragEnter);
playerRight.addEventListener('dragleave', dragLeave);
playerRight.addEventListener('drop', drop);

function dragOver(event) {
    event.preventDefault();
}

function dragEnter(event) {
    event.preventDefault();
    if (event.target.classList.contains('player-area')) {
        event.target.classList.add('dragover');
    }
}

function dragLeave(event) {
    if (event.target.classList.contains('player-area')) {
        event.target.classList.remove('dragover');
    }
}

function drop(event) {
    event.preventDefault();
    if (event.target.classList.contains('player-area') || event.target.classList.contains('card-container')) {
        const cardContainer = event.target.classList.contains('card-container') ? event.target : event.target.querySelector('.card-container');
        cardContainer.appendChild(draggedCard);
        draggedCard.querySelector('.card').classList.remove('card-locked');
    }
    event.target.classList.remove('dragover');
}

// Shuffle button functionality
shuffleButton.addEventListener('click', shuffleDeck);

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    displayDeck();
    animateShuffle();
}

// Distribute button functionality
distributeButton.addEventListener('click', distributeCards);

function distributeCards() {
    const cardsPerPlayer = parseInt(cardSlider.value);
    playerLeft.innerHTML = '<h3>Player 1</h3>';
    playerRight.innerHTML = '<h3>Player 2</h3>';

    const leftCardContainer = document.createElement('div');
    leftCardContainer.className = 'card-container';
    const leftSortButton = document.createElement('button');
    leftSortButton.textContent = 'Sort Cards';
    leftSortButton.className = 'sort-button';
    leftSortButton.addEventListener('click', () => sortPlayerCards(leftCardContainer));
    
    const leftRevealButton = document.createElement('button');
    leftRevealButton.textContent = 'Reveal Cards';
    leftRevealButton.className = 'reveal-button';
    leftRevealButton.addEventListener('click', () => revealPlayerCards(leftCardContainer));

    playerLeft.appendChild(leftSortButton);
    playerLeft.appendChild(leftRevealButton);
    playerLeft.appendChild(leftCardContainer);

    const leftRankSelect = createRankDropdown('left');
    playerLeft.appendChild(leftRankSelect);

    const leftCardCountInput = createCardCountInput('left');
    playerLeft.appendChild(leftCardCountInput);

    const leftPlaceButton = createPlaceButton(playerLeft);
    const leftCallBluffButton = createCallBluffButton(playerLeft);
    playerLeft.appendChild(leftPlaceButton);
    playerLeft.appendChild(leftCallBluffButton);
    
    const rightCardContainer = document.createElement('div');
    rightCardContainer.className = 'card-container';
    const rightSortButton = document.createElement('button');
    rightSortButton.textContent = 'Sort Cards';
    rightSortButton.className = 'sort-button';
    rightSortButton.addEventListener('click', () => sortPlayerCards(rightCardContainer));
    
    const rightRevealButton = document.createElement('button');
    rightRevealButton.textContent = 'Reveal Cards';
    rightRevealButton.className = 'reveal-button';
    rightRevealButton.addEventListener('click', () => revealPlayerCards(rightCardContainer));

    playerRight.appendChild(rightSortButton);
    playerRight.appendChild(rightRevealButton);
    playerRight.appendChild(rightCardContainer);

    const rightRankSelect = createRankDropdown('right');
    playerRight.appendChild(rightRankSelect);

    const rightCardCountInput = createCardCountInput('right');
    playerRight.appendChild(rightCardCountInput);

    const rightPlaceButton = createPlaceButton(playerRight);
    const rightCallBluffButton = createCallBluffButton(playerRight);
    playerRight.appendChild(rightPlaceButton);
    playerRight.appendChild(rightCallBluffButton);

    deck.slice(0, cardsPerPlayer).forEach((cardWrapper, index) => {
        setTimeout(() => {
            animateDistribution(cardWrapper, leftCardContainer, index);
        }, index * 100);
    });

    deck.slice(cardsPerPlayer, cardsPerPlayer * 2).forEach((cardWrapper, index) => {
        setTimeout(() => {
            animateDistribution(cardWrapper, rightCardContainer, index);
        }, (index + cardsPerPlayer) * 100);
    });

    setTimeout(() => {
        const remainingCards = Array.from(cardGrid.querySelectorAll('.card-wrapper'));
        remainingCards.forEach((card, index) => {
            stackCards(index);
        });

        const stackWidth = 90;
        const stackHeight = 120;
        cardGrid.style.left = `calc(50% - ${stackWidth / 2}px)`;
        cardGrid.style.top = `calc(50% - ${stackHeight / 2}px)`;

        cardGrid.style.display = 'none';

        gameArea.style.display = 'flex';

        hideControlButtons();

        updatePlaceButton(playerLeft, true);
        updatePlaceButton(playerRight, true);
    }, (cardsPerPlayer * 2 + 1) * 100);
}

function createCallBluffButton(player) {
    const callBluffButton = document.createElement('button');
    callBluffButton.textContent = 'Call Bluff';
    callBluffButton.className = 'call-bluff-button';
    callBluffButton.disabled = true;
    callBluffButton.addEventListener('click', () => callBluff(player));
    return callBluffButton;
}

function createRankDropdown(player) {
    const dropdown = document.createElement('select');
    dropdown.className = 'rank-dropdown';
    ranks.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank;
        option.textContent = rank;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', () => {
        console.log(`Selected rank for ${player} player: ${dropdown.value}`);
    });

    return dropdown;
}

function createCardCountInput(player) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'card-count-input';
    input.placeholder = 'Number of cards';
    input.addEventListener('input', () => {
        console.log(`Entered number of cards for ${player} player: ${input.value}`);
    });

    return input;
}

function createPlaceButton(player) {
    const placeButton = document.createElement('button');
    placeButton.textContent = 'Place';
    placeButton.className = 'place-button';
    placeButton.addEventListener('click', () => placeCards(player));
    return placeButton;
}

function placeCards(player) {
    const rankDropdown = player.querySelector('.rank-dropdown');
    const cardCountInput = player.querySelector('.card-count-input');
    const rank = rankDropdown.value;
    const count = parseInt(cardCountInput.value);

    if (rank && count && count > 0) {
        const playerName = player.id === 'player-left' ? 'Player 1' : 'Player 2';
        const text = `${playerName} is playing ${count} ${rank}${count > 1 ? 's' : ''}`;
        updateGameArea(text);

        activePlayer = player;
        remainingMoves = count;

        // Flip selected cards face down
        const cardContainer = player.querySelector('.card-container');
        const cards = cardContainer.querySelectorAll('.card-wrapper');
        cards.forEach(cardWrapper => {
            const card = cardWrapper.querySelector('.card');
            if (card.dataset.rank === rank) {
                card.classList.remove('flipped');
            }
        });

        lastPlay = {
            player: player,
            rank: rank,
            count: count
        };

        enableDragging(player);
        updatePlaceButton(player, false);
        updatePlaceButton(opponent, true);
        updateCallBluffButton(opponent, false);  // Enable opponent's Call Bluff button
    }
}

function updateCallBluffButton(player, disabled) {
    const callBluffButton = player.querySelector('.call-bluff-button');
    callBluffButton.disabled = disabled;
}

function callBluff(player) {
    if (lastPlay.player === player) {
        console.error("Can't call bluff on your own play");
        return;
    }

    const gameAreaCards = Array.from(gameArea.querySelectorAll('.card-wrapper')).reverse();
    const revealedCards = gameAreaCards.slice(0, lastPlay.count);

    let bluffCalled = false;
    
    // Calculate grid dimensions
    const gridCols = Math.ceil(Math.sqrt(revealedCards.length));
    const gridRows = Math.ceil(revealedCards.length / gridCols);
    
    // Calculate card and grid sizes
    const cardWidth = 90; 
    const cardHeight = 120; 
    const gridWidth = cardWidth * gridCols + (gridCols - 1) * 10; 
    const gridHeight = cardHeight * gridRows + (gridRows - 1) * 10;
    
    // Calculate starting position for the grid
    const startX = (gameArea.clientWidth - gridWidth) / 2;
    const startY = (gameArea.clientHeight - gridHeight) / 2;

    revealedCards.forEach((cardWrapper, index) => {
        const card = cardWrapper.querySelector('.card');
        
        // Remove the 'card-locked' class to allow flipping
        card.classList.remove('card-locked');
        
        // Calculate grid position
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        const x = startX + col * (cardWidth + 10);
        const y = startY + row * (cardHeight + 10);
        
        // Animate the card to its grid position
        cardWrapper.style.transition = 'all 0.5s ease-in-out';
        cardWrapper.style.position = 'absolute';
        cardWrapper.style.left = `${x}px`;
        cardWrapper.style.top = `${y}px`;
        cardWrapper.style.zIndex = 1000 + index;
        
        // Flip the card with a slight delay
        setTimeout(() => {
            card.style.transition = 'transform 0.6s ease-in-out';
            card.classList.add('flipped');
        }, index * 100);
        
        // Check if the card matches the claimed rank
        if (card.dataset.rank !== lastPlay.rank) {
            bluffCalled = true;
        }
    });

    const callingPlayerName = player.id === 'player-left' ? 'Player 1' : 'Player 2';
    const calledPlayerName = lastPlay.player.id === 'player-left' ? 'Player 1' : 'Player 2';
    
    let bluffResult;
    let targetPlayer;
    
    if (bluffCalled) {
        bluffResult = "Bluff called successfully! The cards don't match the claim.";
        targetPlayer = lastPlay.player; 
    } else {
        bluffResult = "No bluff. The play was honest.";
        targetPlayer = player; 
    }
    
    updateGameArea(`${player.id === 'player-left' ? 'Player 1' : 'Player 2'} called bluff. ${bluffResult}`);

    // Disable both Call Bluff buttons
    updateCallBluffButton(playerLeft, true);
    updateCallBluffButton(playerRight, true);

    // Re-enable both Place buttons
    updatePlaceButton(playerLeft, true);
    updatePlaceButton(playerRight, true);

    // Add a delay before moving cards
    setTimeout(() => {
        const allCards = Array.from(gameArea.querySelectorAll('.card-wrapper'));
        const targetContainer = targetPlayer.querySelector('.card-container');

        allCards.forEach((cardWrapper, index) => {
            const card = cardWrapper.querySelector('.card');
            
            // Flip the card back
            card.classList.remove('flipped');
            
            // Animate the card to the target player's area
            setTimeout(() => {
                cardWrapper.style.transition = 'all 0.5s ease-in-out';
                cardWrapper.style.position = 'absolute';
                const targetRect = targetContainer.getBoundingClientRect();
                const gameAreaRect = gameArea.getBoundingClientRect();
                cardWrapper.style.left = `${targetRect.left - gameAreaRect.left + (index % 5) * 20}px`;
                cardWrapper.style.top = `${targetRect.top - gameAreaRect.top + Math.floor(index / 5) * 30}px`;
                cardWrapper.style.zIndex = index;
                
                // Move the card to the target container after animation
                setTimeout(() => {
                    targetContainer.appendChild(cardWrapper);
                    cardWrapper.style.position = '';
                    cardWrapper.style.left = '';
                    cardWrapper.style.top = '';
                    cardWrapper.style.zIndex = '';
                    card.classList.add('card-locked');
                }, 500);
            }, index * 50);
        });

        // Update game state
        const receivingPlayerName = targetPlayer.id === 'player-left' ? 'Player 1' : 'Player 2';
        updateGameArea(`${receivingPlayerName} receives all the cards!`);

        // Re-enable both Place buttons after moving cards
        setTimeout(() => {
            updatePlaceButton(playerLeft, true);
            updatePlaceButton(playerRight, true);
        }, allCards.length * 50 + 1000);

    }, 2000); 

    // Reset lastPlay
    lastPlay = {
        player: null,
        rank: null,
        count: 0
    };
}

function enableDragging(player) {
    const cardContainer = player.querySelector('.card-container');
    const cards = cardContainer.querySelectorAll('.card-wrapper');
    cards.forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });
}

function disableDragging(player) {
    const cardContainer = player.querySelector('.card-container');
    const cards = cardContainer.querySelectorAll('.card-wrapper');
    cards.forEach(card => {
        card.draggable = false;
        card.removeEventListener('dragstart', dragStart);
        card.removeEventListener('dragend', dragEnd);
    });
}

function updatePlaceButton(player, enabled) {
    const placeButton = player.querySelector('.place-button');
    placeButton.disabled = !enabled;
}

function updateGameArea(text) {
    const existingCards = Array.from(gameArea.querySelectorAll('.card-wrapper'));
    gameArea.innerHTML = `<p>${text}</p>`;
    existingCards.forEach(card => gameArea.appendChild(card));
    gameArea.style.display = 'flex';
    gameArea.style.flexDirection = 'column';
    gameArea.style.justifyContent = 'flex-start';
    gameArea.style.alignItems = 'center';
    gameArea.style.padding = '10px';
    gameArea.style.minHeight = '200px';
}

function animateShuffle() {
    const cards = Array.from(cardGrid.querySelectorAll('.card-wrapper'));
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                stackCards(index);
            }, 150);
        }, index * 20);
    });
}

function animateCardSort(card, targetPosition, delay) {
    const startPosition = card.getBoundingClientRect();
    const deltaX = targetPosition.left - startPosition.left;
    const deltaY = targetPosition.top - startPosition.top;

    card.style.zIndex = '1000';
    card.style.transition = 'none';
    card.style.transform = `translate(0, 0)`;

    setTimeout(() => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }, delay);

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.zIndex = '';
    }, delay + 500);
}

function animateDistribution(cardWrapper, targetContainer, index) {
    const card = cardWrapper.querySelector('.card');
    const originalRect = cardWrapper.getBoundingClientRect();
    const targetRect = targetContainer.getBoundingClientRect();

    const clone = cardWrapper.cloneNode(true);
    document.body.appendChild(clone);
    clone.style.position = 'fixed';
    clone.style.left = `${originalRect.left}px`;
    clone.style.top = `${originalRect.top}px`;
    clone.style.transition = 'all 0.5s ease';
    clone.style.zIndex = '1000';

    setTimeout(() => {
        clone.style.left = `${targetRect.left + 10}px`;
        clone.style.top = `${targetRect.top + 10 + index * 30}px`;
        clone.style.transform = 'scale(0.67)';
    }, 50);

    setTimeout(() => {
        document.body.removeChild(clone);
        card.classList.add('card-locked');
        targetContainer.appendChild(cardWrapper);
    }, 550);
}

function sortPlayerCards(container) {
    const cards = Array.from(container.querySelectorAll('.card-wrapper'));
    const suitOrder = ['♠', '♥', '♣', '♦'];
    const rankOrder = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

    cards.sort((a, b) => {
        const suitA = a.querySelector('.card').dataset.suit;
        const suitB = b.querySelector('.card').dataset.suit;
        const rankA = a.querySelector('.card').dataset.rank;
        const rankB = b.querySelector('.card').dataset.rank;

        if (suitA !== suitB) {
            return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
        } else {
            return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
        }
    });

    const sortedPositions = cards.map((card, index) => {
        const row = Math.floor(index / 13);
        const col = index % 13;
        return {
            left: col * 20,
            top: row * 30
        };
    });

    cards.forEach((card, index) => {
        const targetPosition = {
            left: container.offsetLeft + sortedPositions[index].left,
            top: container.offsetTop + sortedPositions[index].top
        };
        animateCardSort(card, targetPosition, index * 50);
    });

    setTimeout(() => {
        cards.forEach(card => container.appendChild(card));
    }, cards.length * 50 + 500);
}

function revealPlayerCards(container) {
    const cards = Array.from(container.querySelectorAll('.card'));
    cards.forEach(card => {
        card.classList.add('flipped');
    });
}

cardSlider.addEventListener('input', () => {
    sliderValue.textContent = cardSlider.value;
});

gameArea.addEventListener('dragover', dragOver);
gameArea.addEventListener('dragenter', dragEnter);
gameArea.addEventListener('dragleave', dragLeave);
gameArea.addEventListener('drop', dropInGameArea);

function dropInGameArea(event) {
    event.preventDefault();
    if (activePlayer && remainingMoves > 0 && !draggedCard.querySelector('.card').classList.contains('flipped')) {
        gameArea.appendChild(draggedCard);
        const card = draggedCard.querySelector('.card');
        card.classList.add('card-locked');
        
        // Center and stack cards
        const cardWidth = 90; 
        const cardHeight = 120; 
        const offsetX = (gameArea.clientWidth - cardWidth) / 2;
        const offsetY = (gameArea.clientHeight - cardHeight) / 2;
        
        draggedCard.style.position = 'absolute';
        draggedCard.style.left = `${offsetX + gameAreaCounter * 2}px`;
        draggedCard.style.top = `${offsetY + gameAreaCounter * 2}px`;
        draggedCard.style.zIndex = gameAreaCounter;

        gameAreaCounter++;
        
        remainingMoves--;
        
        if (remainingMoves === 0) {
            finishTurn();
        }
    }
    event.target.classList.remove('dragover');
}

function finishTurn() {
    const playerName = activePlayer.id === 'player-left' ? 'Player 1' : 'Player 2';
    updateGameArea(`${playerName} finished their turn.`);
    disableDragging(activePlayer);
    updatePlaceButton(activePlayer, true);
    
    const opponent = activePlayer === playerLeft ? playerRight : playerLeft;
    updateCallBluffButton(opponent, false);  
    
    activePlayer = null;
}

function hideControlButtons() {
    shuffleButton.style.display = 'none';
    distributeButton.style.display = 'none';
    cardSlider.style.display = 'none';
    sliderValue.style.display = 'none';
    sliderLabel.style.display = 'none';
}

gameArea.style.display = 'none';
gameArea.style.position = 'absolute';
gameArea.style.left = '50%';
gameArea.style.top = '50%';
gameArea.style.transform = 'translate(-50%, -50%)';
gameArea.style.width = '300px';
gameArea.style.minHeight = '200px';
gameArea.style.border = '2px dashed #000';
gameArea.style.backgroundColor = '#f8f8f8';
gameArea.style.zIndex = '100';
gameArea.style.fontSize = '18px';
gameArea.style.fontFamily = 'Arial, sans-serif';
gameArea.style.overflowY = 'auto';
gameArea.style.padding = '20px';

(function initializeGame() {
    createDeck();
    updatePlaceButton(playerLeft, false);
    updatePlaceButton(playerRight, false);
    disableDragging(playerLeft);
    disableDragging(playerRight);
}) ();