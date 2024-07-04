class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper';

        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.suit = this.suit;
        card.dataset.rank = this.rank;

        const cardBack = document.createElement('div');
        cardBack.className = `card-back`;

        const topSuit = document.createElement('div');
        topSuit.className = 'suit-top';
        topSuit.textContent = `${this.rank}${this.suit}`;

        const bottomSuit = document.createElement('div');
        bottomSuit.className = 'suit-bottom';
        bottomSuit.textContent = `${this.rank}${this.suit}`;

        const cardFront = document.createElement('div');
        cardFront.className = `card-front ${(this.suit === '♥' || this.suit === '♦') ? 'red' : 'black'}`;

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
}

class Deck {
    constructor() {
        this.suits = ['♠', '♥', '♣', '♦'];
        this.ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
        this.cards = [];
        this.createDeck();
    }

    createDeck() {
        this.cards = [];
        this.suits.forEach(suit => {
            this.ranks.forEach(rank => {
                this.cards.push(new Card(suit, rank));
            });
        });
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

class Player {
    constructor(name, element) {
        this.name = name;
        this.element = element;
        this.cardContainer = null;
        this.cardCount = 0;
        this.setupPlayerArea();
    }

    setupPlayerArea() {
        this.element.innerHTML = `<h3>${this.name}</h3>`;
        
        const sortButton = document.createElement('button');
        sortButton.textContent = 'Sort Cards';
        sortButton.className = 'sort-button';
        sortButton.addEventListener('click', () => this.sortCards());
        
        const revealButton = document.createElement('button');
        revealButton.textContent = 'Reveal Cards';
        revealButton.className = 'reveal-button';
        revealButton.addEventListener('click', () => this.revealCards());

        this.cardContainer = document.createElement('div');
        this.cardContainer.className = 'card-container';

        this.element.appendChild(sortButton);
        this.element.appendChild(revealButton);
        this.element.appendChild(this.cardContainer);

        const rankDropdown = this.createRankDropdown();
        this.element.appendChild(rankDropdown);

        const cardCountInput = this.createCardCountInput();
        this.element.appendChild(cardCountInput);

        const placeButton = this.createPlaceButton();
        const callBluffButton = this.createCallBluffButton();
        this.element.appendChild(placeButton);
        this.element.appendChild(callBluffButton);

        const passButton = this.createPassButton();
        this.element.appendChild(passButton);

        this.updateCardCountDisplay();
    }

    createRankDropdown() {
        const dropdown = document.createElement('select');
        dropdown.className = 'rank-dropdown';
        Game.ranks.forEach(rank => {
            const option = document.createElement('option');
            option.value = rank;
            option.textContent = rank;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', () => {
            console.log(`Selected rank for ${this.name}: ${dropdown.value}`);
        });

        return dropdown;
    }

    createCardCountInput() {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'card-count-input';
        input.placeholder = 'Number of cards';
        input.style.width = '90%';
        input.min = 0;
        input.max = Game.cardsPerPlayer;
        input.addEventListener('input', () => {
            console.log(`Entered number of cards for ${this.name}: ${input.value}`);
        });

        return input;
    }

    createPlaceButton() {
        const placeButton = document.createElement('button');
        placeButton.textContent = 'Place';
        placeButton.className = 'place-button';
        placeButton.addEventListener('click', () => game.placeCards(this));
        return placeButton;
    }

    createCallBluffButton() {
        const callBluffButton = document.createElement('button');
        callBluffButton.textContent = 'Call Bluff';
        callBluffButton.className = 'call-bluff-button';
        callBluffButton.disabled = true;
        callBluffButton.addEventListener('click', () => game.callBluff(this));
        return callBluffButton;
    }

    createPassButton() {
        const passButton = document.createElement('button');
        passButton.textContent = 'Pass';
        passButton.className = 'pass-button';
        passButton.addEventListener('click', () => game.pass(this));
        return passButton;
    }

    sortCards() {
        const cards = Array.from(this.cardContainer.querySelectorAll('.card-wrapper'));
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
                left: this.cardContainer.offsetLeft + sortedPositions[index].left,
                top: this.cardContainer.offsetTop + sortedPositions[index].top
            };
            this.animateCardSort(card, targetPosition, index * 50);
        });

        setTimeout(() => {
            cards.forEach(card => this.cardContainer.appendChild(card));
        }, cards.length * 50 + 500);
    }

    animateCardSort(card, targetPosition, delay) {
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

    revealCards() {
        const cards = Array.from(this.cardContainer.querySelectorAll('.card'));
        cards.forEach(card => {
            card.classList.add('flipped');
        });
    }

    updateCardCountDisplay() {
        let countDisplay = this.element.querySelector('.player-count');
        if (!countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.className = 'player-count';
            this.element.insertBefore(countDisplay, this.element.firstChild);
        }
        countDisplay.textContent = `Cards: ${this.cardCount}`;
    }

    enableDragging() {
        const cards = this.cardContainer.querySelectorAll('.card-wrapper');
        cards.forEach(card => {
            card.draggable = true;
            card.addEventListener('dragstart', Game.dragStart);
            card.addEventListener('dragend', Game.dragEnd);
        });
    }

    disableDragging() {
        const cards = this.cardContainer.querySelectorAll('.card-wrapper');
        cards.forEach(card => {
            card.draggable = false;
            card.removeEventListener('dragstart', Game.dragStart);
            card.removeEventListener('dragend', Game.dragEnd);
        });
    }

    updatePlaceButton(enabled) {
        const placeButton = this.element.querySelector('.place-button');
        placeButton.disabled = !enabled;
    }

    updateCallBluffButton(disabled) {
        const callBluffButton = this.element.querySelector('.call-bluff-button');
        callBluffButton.disabled = disabled;
    }

    updatePassButton(enabled) {
        const passButton = this.element.querySelector('.pass-button');
        passButton.disabled = !enabled;
    }
}

class Game {
    static suits = ['♠', '♥', '♣', '♦'];
    static ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    static cardsPerPlayer = 26;

    constructor() {
        this.deck = new Deck();
        this.player1 = new Player('Player 1', document.getElementById('player-left'));
        this.player2 = new Player('Player 2', document.getElementById('player-right'));
        this.gameArea = document.createElement('div');
        this.gameArea.id = 'game-area';
        document.body.appendChild(this.gameArea);
        this.cardGrid = document.getElementById('card-grid');
        this.shuffleButton = document.getElementById('shuffle-button');
        this.distributeButton = document.getElementById('distribute-button');
        this.cardSlider = document.getElementById('card-slider');
        this.sliderLabel = document.getElementById('slider-label');
        this.sliderValue = document.getElementById('slider-value');

        this.draggedCard = null;
        this.activePlayer = null;
        this.remainingMoves = 0;
        this.gameAreaCounter = 0;
        this.cardsPLaced = 0;

        this.lastPlay = {
            player: null,
            rank: null,
            count: 0
        };

        this.currentRound = {
            startingPlayer: null,
            rank: null
        };

        this.activePlayer = null;
        this.debugLog("Game initialised");

        this.setupEventListeners();
        this.initializeGame();
        this.displayDeck();
    }

    debugLog(message) {
        console.log(`[DEBUG] ${message}`);
    }

    setupEventListeners() {
        this.shuffleButton.addEventListener('click', () => this.shuffleDeck());
        this.distributeButton.addEventListener('click', () => this.distributeCards());
        this.cardSlider.addEventListener('input', () => {
            this.sliderValue.textContent = this.cardSlider.value;
        });
        this.gameArea.addEventListener('dragover', Game.dragOver);
        this.gameArea.addEventListener('dragenter', Game.dragEnter);
        this.gameArea.addEventListener('dragleave', Game.dragLeave);
        this.gameArea.addEventListener('drop', (e) => this.dropInGameArea(e));
    }

    initializeGame() {
        this.displayDeck();
        this.player1.updatePlaceButton(false);
        this.player2.updatePlaceButton(false);
        this.player1.updateCallBluffButton(true);
        this.player2.updateCallBluffButton(true);
        this.player1.updatePassButton(false);
        this.player2.updatePassButton(false);
        this.player1.disableDragging();
        this.player2.disableDragging();
        this.updateGameArea("Game initialized. Player 1 starts the first round.");
    }

    displayDeck() {
        this.cardGrid.innerHTML = '';
        this.deck.cards.forEach((card, index) => {
            this.cardGrid.appendChild(card.element);
        });
        setTimeout(() => {
            this.deck.cards.forEach((card, index) => {
                this.stackCards(card.element, index);
            });
        }, 10);
    }

    stackCards(card, index) {
        const totalCards = this.deck.cards.length;
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

    shuffleDeck() {
        this.deck.shuffle();
        this.displayDeck();
        this.animateShuffle();
    }

    animateShuffle() {
        const cards = Array.from(this.cardGrid.querySelectorAll('.card-wrapper'));
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    this.stackCards(card, index);
                }, 150);
            }, index * 20);
        });
    }

    distributeCards() { // if distributed without shuffling, shuffle by default
        Game.cardsPerPlayer = parseInt(this.cardSlider.value);
        this.player1.cardCount = Game.cardsPerPlayer;
        this.player2.cardCount = Game.cardsPerPlayer;

        this.deck.cards.slice(0, Game.cardsPerPlayer).forEach((card, index) => {
            setTimeout(() => {
                this.animateDistribution(card.element, this.player1.cardContainer, index);
            }, index * 100);
        });

        this.deck.cards.slice(Game.cardsPerPlayer, Game.cardsPerPlayer * 2).forEach((card, index) => {
            setTimeout(() => {
                this.animateDistribution(card.element, this.player2.cardContainer, index);
            }, (index + Game.cardsPerPlayer) * 100);
        });

        setTimeout(() => {
            const remainingCards = Array.from(this.cardGrid.querySelectorAll('.card-wrapper'));
            remainingCards.forEach((card, index) => {
                this.stackCards(card, index);
            });

            const stackWidth = 90;
            const stackHeight = 120;
            this.cardGrid.style.left = `calc(50% - ${stackWidth / 2}px)`;
            this.cardGrid.style.top = `calc(50% - ${stackHeight / 2}px)`;

            this.cardGrid.style.display = 'none';

            this.gameArea.style.display = 'flex';

            this.hideControlButtons();

            this.player1.updatePlaceButton(true);
            this.player2.updatePlaceButton(false);
            this.player1.updatePassButton(false);
            this.player2.updatePassButton(false);
            this.player1.updateCardCountDisplay();
            this.player2.updateCardCountDisplay();
            this.updateGameArea("Cards distributed. Player 1, start the first round by placing cards.")
        }, (Game.cardsPerPlayer * 2 + 1) * 100);
    }

    animateDistribution(cardWrapper, targetContainer, index) {
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

    hideControlButtons() {
        this.shuffleButton.style.display = 'none';
        this.distributeButton.style.display = 'none';
        this.cardSlider.style.display = 'none';
        this.sliderValue.style.display = 'none';
        this.sliderLabel.style.display = 'none';
    }

    placeCards(player) {
        this.debugLog(`placeCards called by ${player.name}`);
        this.debugLog(`Current round: ${JSON.stringify(this.currentRound)}`);
        this.debugLog(`Active player: ${this.activePlayer ? this.activePlayer.name : 'None'}`);

        if (this.activePlayer && this.activePlayer !== player) {
            console.error("It's not your turn to place cards");
            return;
        }

        const rankDropdown = player.element.querySelector('.rank-dropdown');
        const cardCountInput = player.element.querySelector('.card-count-input');
        const rank = rankDropdown.value;
        const count = parseInt(cardCountInput.value);

        this.debugLog(`Player selected: rank ${rank}, count ${count}`);

        if (rank && count && count > 0) {
            if (this.currentRound.rank === null) {
                this.debugLog("Starting a new round");
                // Starting a new round
                this.startNewRound(player, rank);
                this.updateGameArea(`${player.name} starts a new round with ${count} ${rank}${count > 1 ? 's' : ''}`);
            } else if (rank !== this.currentRound.rank) {
                this.updateGameArea(`Invalid move. You must play ${this.currentRound.rank}s in this round.`);
                return;
            } else {
                this.updateGameArea(`${player.name} plays ${count} ${rank}${count > 1 ? 's' : ''}`);
            }

            this.activePlayer = player;
            this.remainingMoves = count;
            this.cardsPLaced = 0;

            // Flip selected cards face down
            const cards = player.cardContainer.querySelectorAll('.card-wrapper');
            cards.forEach(cardWrapper => {
                const card = cardWrapper.querySelector('.card');
                if (card.dataset.rank === rank) {
                    card.classList.remove('flipped');
                }
            });

            this.lastPlay = {
                player: player,
                rank: rank,
                count: count
            };

            player.enableDragging();
            player.updatePlaceButton(false);
            player.updatePassButton(false);
            const opponent = player === this.player1 ? this.player2 : this.player1;
            opponent.updatePlaceButton(false);
            opponent.updateCallBluffButton(true);
            opponent.updatePassButton(false);
        }

        this.debugLog(`After placeCards: ${JSON.stringify(this.currentRound)}`);
    }

    pass(player) {
        this.debugLog(`pass called by ${player.name}`);

        if (player !== this.activePlayer) {
            console.error("It's not your turn to pass");
            return;
        }

        if (player === this.currentRound.startingPlayer) {
            // End the current round and start a new one
            const nextPlayer = player === this.player1 ? this.player2 : this.player1;
            this.startNewRound(nextPlayer, null);
        } else {
            // Move the turn to the other player
            const nextPlayer = player === this.player1 ? this.player2 : this.player1;
            this.updateGameArea(`${player.name} passes. ${nextPlayer.name}'s turn.`);
            this.setActivePlayer(nextPlayer);
        }

        this.debugLog(`After pass: ${JSON.stringify(this.currentRound)}`);
    }

    startNewRound(startingPlayer) {
        this.debugLog(`startNewRound called: player ${startingPlayer.name}`);

        this.currentRound = {
            startingPlayer: startingPlayer,
            rank: null  // We'll set this when the player actually plays cards
        };
        this.setActivePlayer(startingPlayer);
        this.updateGameArea(`New round starts. ${startingPlayer.name}, choose cards to play.`);

        this.debugLog(`After startNewRound: ${JSON.stringify(this.currentRound)}`);
    }

    startNewRound(startingPlayer, setRank) {
        this.debugLog(`startNewRound called: player ${startingPlayer.name}`);

        this.currentRound = {
            startingPlayer: startingPlayer,
            rank: setRank  // We'll set this when the player actually plays cards
        };
        this.setActivePlayer(startingPlayer);
        this.updateGameArea(`New round starts. ${startingPlayer.name}, choose cards to play.`);

        this.debugLog(`After startNewRound: ${JSON.stringify(this.currentRound)}`);
    }

    setActivePlayer(player) {
        this.debugLog(`setActivePlayer called: ${player.name}`);

        this.activePlayer = player;
        this.player1.updatePlaceButton(player === this.player1);
        this.player1.updatePassButton(player === this.player1);
        this.player2.updatePlaceButton(player === this.player2);
        this.player2.updatePassButton(player === this.player2);
        this.player1.updateCallBluffButton(player !== this.player1 && this.currentRound.rank !== null);
        this.player2.updateCallBluffButton(player !== this.player2 && this.currentRound.rank !== null);
        this.player1.disableDragging();
        this.player2.disableDragging();
        if (player === this.player1) {
            this.player1.enableDragging();
        } else {
            this.player2.enableDragging();
        }

        this.debugLog(`After setActivePlayer: active=${this.activePlayer.name}, round=${JSON.stringify(this.currentRound)}`);
    }

    callBluff(player) {
        if (this.lastPlay.player === player) {
            console.error("Can't call bluff on your own play");
            return;
        }

        const gameAreaCards = Array.from(this.gameArea.querySelectorAll('.card-wrapper')).reverse();
        const revealedCards = gameAreaCards.slice(0, this.lastPlay.count);

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
        const startX = (this.gameArea.clientWidth - gridWidth) / 2;
        const startY = (this.gameArea.clientHeight - gridHeight) / 2;

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
            if (card.dataset.rank !== this.lastPlay.rank) {
                bluffCalled = true;
            }
        });

        let bluffResult;
        let targetPlayer;
        
        if (bluffCalled) {
            bluffResult = "Bluff called successfully! The cards don't match the claim.";
            targetPlayer = this.lastPlay.player; 
            this.startNewRound(player);
        } else {
            bluffResult = "No bluff. The play was honest.";
            targetPlayer = player; 
            this.startNewRound(this.lastPlay.player);
        }
        
        this.updateGameArea(`${player.name} called bluff. ${bluffResult}`);

        // Disable both Call Bluff buttons
        this.player1.updateCallBluffButton(true);
        this.player2.updateCallBluffButton(true);

        // Re-enable both Place buttons
        this.player1.updatePlaceButton(true);
        this.player2.updatePlaceButton(true);

        // Add a delay before moving cards
        setTimeout(() => {
            const allCards = Array.from(this.gameArea.querySelectorAll('.card-wrapper'));
            const targetContainer = targetPlayer.cardContainer;

            const cardsToAdd = allCards.length;

            if (targetPlayer === this.player1) {
                this.player1.cardCount += cardsToAdd;
                this.player2.cardCount -= this.lastPlay.count;
            } else {
                this.player2.cardCount += cardsToAdd;
                this.player1.cardCount -= this.lastPlay.count;
            }

            this.player1.updateCardCountDisplay();
            this.player2.updateCardCountDisplay();

            allCards.forEach((cardWrapper, index) => {
                const card = cardWrapper.querySelector('.card');
                
                // Flip the card back
                card.classList.remove('flipped');
                
                // Animate the card to the target player's area
                setTimeout(() => {
                    cardWrapper.style.transition = 'all 0.5s ease-in-out';
                    cardWrapper.style.position = 'absolute';
                    const targetRect = targetContainer.getBoundingClientRect();
                    const gameAreaRect = this.gameArea.getBoundingClientRect();
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
            this.updateGameArea(`${targetPlayer.name} receives all the cards!`);

            // Re-enable both Place buttons after moving cards
            setTimeout(() => {
                this.player1.updatePlaceButton(true);
                this.player2.updatePlaceButton(true);
            }, allCards.length * 50 + 1000);

        }, 2000); 

        // Reset lastPlay
        this.lastPlay = {
            player: null,
            rank: null,
            count: 0
        };

        // Check for win condition
        if (targetPlayer.cardCount === 0) {
            this.endGame(targetPlayer);
        }
    }

    endGame(winner) {
        this.updateGameArea(`${winner.name} wins the game!`);
        this.player1.updatePlaceButton(false);
        this.player2.updatePlaceButton(false);
        this.player1.updateCallBluffButton(true);
        this.player2.updateCallBluffButton(true);
        this.player1.updatePassButton(false);
        this.player2.updatePassButton(false);
    }

    updateGameArea(text) {
        const existingCards = Array.from(this.gameArea.querySelectorAll('.card-wrapper'));
        this.gameArea.innerHTML = `<p>${text}</p>`;
        existingCards.forEach(card => this.gameArea.appendChild(card));
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.justifyContent = 'flex-start';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.padding = '10px';
        this.gameArea.style.minHeight = '200px';
    }

    dropInGameArea(event) {
        event.preventDefault();
        if (this.activePlayer && this.remainingMoves > 0 && !this.draggedCard.querySelector('.card').classList.contains('flipped')) {
            this.gameArea.appendChild(this.draggedCard);
            const card = this.draggedCard.querySelector('.card');
            card.classList.add('card-locked');
            
            // Decrease the card count for the active player
            this.activePlayer.cardCount--;
            this.activePlayer.updateCardCountDisplay();
            
            // Center and stack cards
            const cardWidth = 90; 
            const cardHeight = 120; 
            const offsetX = (this.gameArea.clientWidth - cardWidth) / 2;
            const offsetY = (this.gameArea.clientHeight - cardHeight) / 2;
            
            this.draggedCard.style.position = 'absolute';
            this.draggedCard.style.left = `${offsetX + this.gameAreaCounter * 2}px`;
            this.draggedCard.style.top = `${offsetY + this.gameAreaCounter * 2}px`;
            this.draggedCard.style.zIndex = this.gameAreaCounter;

            this.gameAreaCounter++;
            
            this.cardsPLaced++;
            this.remainingMoves--;
            
            if (this.remainingMoves === 0) {
                this.finishTurn();
            }
        }
        event.target.classList.remove('dragover');
    }

    finishTurn() {
        this.updateGameArea(`${this.activePlayer.name} finished their turn.`);
        this.activePlayer.disableDragging();
        this.activePlayer.updatePlaceButton(false);
        this.activePlayer.updatePassButton(true); // Re-enable pass button

        const nextPlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;
        this.setActivePlayer(nextPlayer);
        nextPlayer.updatePlaceButton(true);
        nextPlayer.updatePassButton(true);
        nextPlayer.updateCallBluffButton(false); // Enable call bluff only after all cards are placed

        // Check for win condition
        if (this.activePlayer.cardCount === 0) {
            this.endGame(this.activePlayer);
        }
    }

    static dragStart(event) {
        if (game.activePlayer && 
            event.target.closest('.player-area') === game.activePlayer.element && 
            game.remainingMoves > 0 &&
            !event.target.closest('.card').classList.contains('flipped')) {
            game.draggedCard = event.target.closest('.card-wrapper');
            setTimeout(() => {
                game.draggedCard.style.display = 'none';
            }, 0);
        } else {
            event.preventDefault();
        }
    }

    static dragEnd() {
        if (game.draggedCard) {
            game.draggedCard.style.display = 'block';
            game.draggedCard = null;
        }
    }

    static dragOver(event) {
        event.preventDefault();
    }

    static dragEnter(event) {
        event.preventDefault();
        if (event.target.classList.contains('player-area')) {
            event.target.classList.add('dragover');
        }
    }

    static dragLeave(event) {
        if (event.target.classList.contains('player-area')) {
            event.target.classList.remove('dragover');
        }
    }
}

// Initialize the game
const game = new Game();

// Set up game area styles
game.gameArea.style.display = 'none';
game.gameArea.style.position = 'absolute';
game.gameArea.style.left = '50%';
game.gameArea.style.top = '50%';
game.gameArea.style.transform = 'translate(-50%, -50%)';
game.gameArea.style.width = '300px';
game.gameArea.style.minHeight = '200px';
game.gameArea.style.border = '2px dashed #000';
game.gameArea.style.backgroundColor = '#f8f8f8';
game.gameArea.style.zIndex = '100';
game.gameArea.style.fontSize = '18px';
game.gameArea.style.fontFamily = 'Arial, sans-serif';
game.gameArea.style.overflowY = 'auto';
game.gameArea.style.padding = '20px';