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
        cardBack.className = `card-back ${(this.suit === '♥' || this.suit === '♦') ? 'red' : 'black'}`;

        const topSuit = document.createElement('div');
        topSuit.className = 'suit-top';
        topSuit.textContent = `${this.rank}${this.suit}`;

        const bottomSuit = document.createElement('div');
        bottomSuit.className = 'suit-bottom';
        bottomSuit.textContent = `${this.rank}${this.suit}`;

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
}

class Deck {
    constructor() {
        this.cards = [];
        this.suits = ['♠', '♥', '♣', '♦'];
        this.ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
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

    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}

class Player {
    constructor(name, element) {
        this.name = name;
        this.element = element;
        this.hand = [];
        this.setupPlayerArea();
    }

    setupPlayerArea() {
        this.element.innerHTML = `<h3>${this.name}</h3>`;
        this.cardContainer = document.createElement('div');
        this.cardContainer.className = 'card-container';
        
        this.sortButton = this.createButton('Sort Cards', 'sort-button', () => this.sortCards());
        this.revealButton = this.createButton('Reveal Cards', 'reveal-button', () => this.revealCards());
        this.rankDropdown = this.createRankDropdown();
        this.cardCountInput = this.createCardCountInput();
        this.placeButton = this.createButton('Place', 'place-button', () => game.placeCards(this));
        this.callBluffButton = this.createButton('Call Bluff', 'call-bluff-button', () => game.callBluff(this));

        this.element.appendChild(this.sortButton);
        this.element.appendChild(this.revealButton);
        this.element.appendChild(this.cardContainer);
        this.element.appendChild(this.rankDropdown);
        this.element.appendChild(this.cardCountInput);
        this.element.appendChild(this.placeButton);
        this.element.appendChild(this.callBluffButton);

        this.element.addEventListener('dragover', dragOver);
        this.element.addEventListener('dragenter', dragEnter);
        this.element.addEventListener('dragleave', dragLeave);
        this.element.addEventListener('drop', drop);
    }

    createButton(text, className, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', clickHandler);
        return button;
    }

    createRankDropdown() {
        const dropdown = document.createElement('select');
        dropdown.className = 'rank-dropdown';
        game.deck.ranks.forEach(rank => {
            const option = document.createElement('option');
            option.value = rank;
            option.textContent = rank;
            dropdown.appendChild(option);
        });
        return dropdown;
    }

    createCardCountInput() {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'card-count-input';
        input.placeholder = 'Number of cards';
        return input;
    }

    addCards(cards) {
        this.hand = this.hand.concat(cards);
        cards.forEach(card => this.cardContainer.appendChild(card.element));
    }

    sortCards() {
        const suitOrder = ['♠', '♥', '♣', '♦'];
        const rankOrder = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

        this.hand.sort((a, b) => {
            const suitA = a.suit;
            const suitB = b.suit;
            const rankA = a.rank;
            const rankB = b.rank;

            if (suitA !== suitB) {
                return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
            } else {
                return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
            }
        });

        this.hand.forEach((card, index) => {
            const row = Math.floor(index / 13);
            const col = index % 13;
            const targetPosition = {
                left: this.cardContainer.offsetLeft + col * 20,
                top: this.cardContainer.offsetTop + row * 30
            };
            this.animateCardSort(card.element, targetPosition, index * 50);
        });

        setTimeout(() => {
            this.hand.forEach(card => this.cardContainer.appendChild(card.element));
        }, this.hand.length * 50 + 500);
    }

    animateCardSort(cardElement, targetPosition, delay) {
        const startPosition = cardElement.getBoundingClientRect();
        const deltaX = targetPosition.left - startPosition.left;
        const deltaY = targetPosition.top - startPosition.top;

        cardElement.style.zIndex = '1000';
        cardElement.style.transition = 'none';
        cardElement.style.transform = `translate(0, 0)`;

        setTimeout(() => {
            cardElement.style.transition = 'transform 0.5s ease';
            cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }, delay);

        setTimeout(() => {
            cardElement.style.transition = 'none';
            cardElement.style.transform = 'none';
            cardElement.style.zIndex = '';
        }, delay + 500);
    }

    revealCards() {
        this.hand.forEach(card => card.element.querySelector('.card').classList.add('flipped'));
    }

    enableDragging() {
        this.hand.forEach(card => {
            card.element.draggable = true;
            card.element.addEventListener('dragstart', dragStart);
            card.element.addEventListener('dragend', dragEnd);
        });
    }

    disableDragging() {
        this.hand.forEach(card => {
            card.element.draggable = false;
            card.element.removeEventListener('dragstart', dragStart);
            card.element.removeEventListener('dragend', dragEnd);
        });
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.player1 = new Player('Player 1', document.getElementById('player-left'));
        this.player2 = new Player('Player 2', document.getElementById('player-right'));
        this.gameArea = document.getElementById('game-area');
        this.cardGrid = document.getElementById('card-grid');
        this.activePlayer = null;
        this.remainingMoves = 0;
        this.gameAreaCounter = 0;
        this.lastPlay = { player: null, rank: null, count: 0 };

        this.setupGameArea();
        this.setupControls();
        this.init();
    }

    setupGameArea() {
        this.gameArea.style.display = 'none';
        this.gameArea.style.position = 'absolute';
        this.gameArea.style.left = '50%';
        this.gameArea.style.top = '50%';
        this.gameArea.style.transform = 'translate(-50%, -50%)';
        this.gameArea.style.width = '300px';
        this.gameArea.style.minHeight = '200px';
        this.gameArea.style.border = '2px dashed #000';
        this.gameArea.style.backgroundColor = '#f8f8f8';
        this.gameArea.style.zIndex = '100';
        this.gameArea.style.fontSize = '18px';
        this.gameArea.style.fontFamily = 'Arial, sans-serif';
        this.gameArea.style.overflowY = 'auto';
        this.gameArea.style.padding = '20px';

        this.gameArea.addEventListener('dragover', dragOver);
        this.gameArea.addEventListener('dragenter', dragEnter);
        this.gameArea.addEventListener('dragleave', dragLeave);
        this.gameArea.addEventListener('drop', (event) => this.dropInGameArea(event));
    }

    init() {
        this.deck.createDeck();
        this.displayDeck();
        this.cardGrid.style.display = 'flex';  // Ensure the card grid is visible
        this.cardGrid.style.flexWrap = 'wrap';
        this.cardGrid.style.justifyContent = 'center';
        this.cardGrid.style.alignItems = 'center';
        this.cardGrid.style.width = '100%';
        this.cardGrid.style.height = '100%';
    }

    setupControls() {
        this.shuffleButton = document.getElementById('shuffle-button');
        this.distributeButton = document.getElementById('distribute-button');
        this.cardSlider = document.getElementById('card-slider');
        this.sliderLabel = document.getElementById('slider-label');
        this.sliderValue = document.getElementById('slider-value');

        this.shuffleButton.addEventListener('click', () => this.shuffleDeck());
        this.distributeButton.addEventListener('click', () => this.distributeCards());
        this.cardSlider.addEventListener('input', () => {
            this.sliderValue.textContent = this.cardSlider.value;
        });
    }

    shuffleDeck() {
        this.deck.shuffle();
        this.displayDeck();
        this.animateShuffle();
    }

    displayDeck() {
        this.cardGrid.innerHTML = '';
        this.deck.cards.forEach((card, index) => {
            this.cardGrid.appendChild(card.element);
            setTimeout(() => {
                this.stackCards(index);
            }, 10);
        });
    }

    stackCards(index) {
        const card = this.deck.cards[index].element;
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

    animateShuffle() {
        const cards = Array.from(this.cardGrid.querySelectorAll('.card-wrapper'));
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    this.stackCards(index);
                }, 150);
            }, index * 20);
        });
    }

    distributeCards() {
        const cardsPerPlayer = parseInt(this.cardSlider.value);
        this.player1.addCards(this.deck.deal(cardsPerPlayer));
        this.player2.addCards(this.deck.deal(cardsPerPlayer));

        this.player1.hand.forEach((card, index) => {
            setTimeout(() => {
                this.animateDistribution(card.element, this.player1.cardContainer, index);
            }, index * 100);
        });

        this.player2.hand.forEach((card, index) => {
            setTimeout(() => {
                this.animateDistribution(card.element, this.player2.cardContainer, index);
            }, (index + cardsPerPlayer) * 100);
        });

        setTimeout(() => {
            const remainingCards = Array.from(this.cardGrid.querySelectorAll('.card-wrapper'));
            remainingCards.forEach((card, index) => {
                this.stackCards(index);
            });

            const stackWidth = 90;
            const stackHeight = 120;
            this.cardGrid.style.left = `calc(50% - ${stackWidth / 2}px)`;
            this.cardGrid.style.top = `calc(50% - ${stackHeight / 2}px)`;

            this.cardGrid.style.display = 'none';

            this.gameArea.style.display = 'flex';

            this.hideControlButtons();

            this.updatePlaceButton(this.player1, true);
            this.updatePlaceButton(this.player2, true);
        }, (cardsPerPlayer * 2 + 1) * 100);
    }

    animateDistribution(cardElement, targetContainer, index) {
        const originalRect = cardElement.getBoundingClientRect();
        const targetRect = targetContainer.getBoundingClientRect();

        const clone = cardElement.cloneNode(true);
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
            cardElement.querySelector('.card').classList.add('card-locked');
            targetContainer.appendChild(cardElement);
        }, 550);
    }

    placeCards(player) {
        const rank = player.rankDropdown.value;
        const count = parseInt(player.cardCountInput.value);

        if (rank && count && count > 0) {
            const playerName = player === this.player1 ? 'Player 1' : 'Player 2';
            const text = `${playerName} is playing ${count} ${rank}${count > 1 ? 's' : ''}`;
            this.updateGameArea(text);

            this.activePlayer = player;
            this.remainingMoves = count;

            player.hand.forEach(card => {
                if (card.rank === rank) {
                    card.element.querySelector('.card').classList.remove('flipped');
                }
            });

            this.lastPlay = {
                player: player,
                rank: rank,
                count: count
            };

            player.enableDragging();
            this.updatePlaceButton(player, false);
            this.updatePlaceButton(player === this.player1 ? this.player2 : this.player1, true);
            this.updateCallBluffButton(player === this.player1 ? this.player2 : this.player1, false);
        }
    }

    callBluff(player) {
        if (this.lastPlay.player === player) {
            console.error("Can't call bluff on your own play");
            return;
        }

        const gameAreaCards = Array.from(this.gameArea.querySelectorAll('.card-wrapper')).reverse();
        const revealedCards = gameAreaCards.slice(0, this.lastPlay.count);

        let bluffCalled = false;
        
        const gridCols = Math.ceil(Math.sqrt(revealedCards.length));
        const gridRows = Math.ceil(revealedCards.length / gridCols);
        
        const cardWidth = 90;
        const cardHeight = 120;
        const gridWidth = cardWidth * gridCols + (gridCols - 1) * 10;
        const gridHeight = cardHeight * gridRows + (gridRows - 1) * 10;
        
        const startX = (this.gameArea.clientWidth - gridWidth) / 2;
        const startY = (this.gameArea.clientHeight - gridHeight) / 2;

        revealedCards.forEach((cardWrapper, index) => {
            const card = cardWrapper.querySelector('.card');
            card.classList.remove('card-locked');
            
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);
            const x = startX + col * (cardWidth + 10);
            const y = startY + row * (cardHeight + 10);
            
            cardWrapper.style.transition = 'all 0.5s ease-in-out';
            cardWrapper.style.position = 'absolute';
            cardWrapper.style.left = `${x}px`;
            cardWrapper.style.top = `${y}px`;
            cardWrapper.style.zIndex = 1000 + index;
            
            setTimeout(() => {
                card.style.transition = 'transform 0.6s ease-in-out';
                card.classList.add('flipped');
            }, index * 100);
            
            if (card.dataset.rank !== this.lastPlay.rank) {
                bluffCalled = true;
            }
        });

        const callingPlayerName = player === this.player1 ? 'Player 1' : 'Player 2';
        const calledPlayerName = this.lastPlay.player === this.player1 ? 'Player 1' : 'Player 2';
        
        let bluffResult;
        let targetPlayer;
        
        if (bluffCalled) {
            bluffResult = "Bluff called successfully! The cards don't match the claim.";
            targetPlayer = this.lastPlay.player;
        } else {
            bluffResult = "No bluff. The play was honest.";
            targetPlayer = player;
        }
        
        this.updateGameArea(`${callingPlayerName} called bluff. ${bluffResult}`);

        this.updateCallBluffButton(this.player1, true);
        this.updateCallBluffButton(this.player2, true);

        this.updatePlaceButton(this.player1, true);
        this.updatePlaceButton(this.player2, true);

        setTimeout(() => {
            const allCards = Array.from(this.gameArea.querySelectorAll('.card-wrapper'));
            const targetContainer = targetPlayer.cardContainer;

            allCards.forEach((cardWrapper, index) => {
                const card = cardWrapper.querySelector('.card');
                card.classList.remove('flipped');
                
                setTimeout(() => {
                    cardWrapper.style.transition = 'all 0.5s ease-in-out';
                    cardWrapper.style.position = 'absolute';
                    const targetRect = targetContainer.getBoundingClientRect();
                    const gameAreaRect = this.gameArea.getBoundingClientRect();
                    cardWrapper.style.left = `${targetRect.left - gameAreaRect.left + (index % 5) * 20}px`;
                    cardWrapper.style.top = `${targetRect.top - gameAreaRect.top + Math.floor(index / 5) * 30}px`;
                    cardWrapper.style.zIndex = index;
                    
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

            const receivingPlayerName = targetPlayer === this.player1 ? 'Player 1' : 'Player 2';
            this.updateGameArea(`${receivingPlayerName} receives all the cards!`);

            setTimeout(() => {
                this.updatePlaceButton(this.player1, true);
                this.updatePlaceButton(this.player2, true);
            }, allCards.length * 50 + 1000);

        }, 2000);

        this.lastPlay = {
            player: null,
            rank: null,
            count: 0
        };
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

    finishTurn() {
        const playerName = this.activePlayer === this.player1 ? 'Player 1' : 'Player 2';
        this.updateGameArea(`${playerName} finished their turn.`);
        this.activePlayer.disableDragging();
        this.updatePlaceButton(this.activePlayer, true);
        
        const opponent = this.activePlayer === this.player1 ? this.player2 : this.player1;
        this.updateCallBluffButton(opponent, false);
        
        this.activePlayer = null;
    }

    hideControlButtons() {
        this.shuffleButton.style.display = 'none';
        this.distributeButton.style.display = 'none';
        this.cardSlider.style.display = 'none';
        this.sliderValue.style.display = 'none';
        this.sliderLabel.style.display = 'none';
    }

    updatePlaceButton(player, enabled) {
        player.placeButton.disabled = !enabled;
    }

    updateCallBluffButton(player, disabled) {
        player.callBluffButton.disabled = disabled;
    }

    dropInGameArea(event) {
        event.preventDefault();
        if (this.activePlayer && this.remainingMoves > 0 && !draggedCard.querySelector('.card').classList.contains('flipped')) {
            this.gameArea.appendChild(draggedCard);
            const card = draggedCard.querySelector('.card');
            card.classList.add('card-locked');
            
            const cardWidth = 90;
            const cardHeight = 120;
            const offsetX = (this.gameArea.clientWidth - cardWidth) / 2;
            const offsetY = (this.gameArea.clientHeight - cardHeight) / 2;
            
            draggedCard.style.position = 'absolute';
            draggedCard.style.left = `${offsetX + this.gameAreaCounter * 2}px`;
            draggedCard.style.top = `${offsetY + this.gameAreaCounter * 2}px`;
            draggedCard.style.zIndex = this.gameAreaCounter;

            this.gameAreaCounter++;
            
            this.remainingMoves--;
            
            if (this.remainingMoves === 0) {
                this.finishTurn();
            }
        }
        event.target.classList.remove('dragover');
    }
}

// Global variables and functions
let draggedCard = null;

function dragStart(event) {
    if (game.activePlayer && 
        event.target.closest('.player-area') === game.activePlayer.element && 
        game.remainingMoves > 0 &&
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

// Initialize the game
const game = new Game();