document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const message = document.getElementById('message');
    const BOARD_SIZE = 3;
    let tiles = [];
    let emptyTileIndex;

    function createNewPuzzle() {
        message.textContent = '';
        puzzleBoard.innerHTML = '';
        tiles = generateSolvablePuzzle();
        renderPuzzle();
    }

    function generateSolvablePuzzle() {
        const numbers = Array.from({length: BOARD_SIZE * BOARD_SIZE - 1}, (_, i) => i + 1);
        let puzzleArray = [...numbers, null];
        shuffleArray(puzzleArray);

        while (!isSolvable(puzzleArray)) {
            shuffleArray(puzzleArray);
        }

        return puzzleArray;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function isSolvable(arr) {
        let inversions = 0;
        const flatArr = arr.filter(n => n !== null);
        const n = flatArr.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = i + 1; j < n; j++) {
                if (flatArr[i] > flatArr[j]) {
                    inversions++;
                }
            }
        }

        const emptyRow = Math.floor(arr.indexOf(null) / BOARD_SIZE);
        const isEvenGrid = BOARD_SIZE % 2 === 0;

        if (isEvenGrid) {
            return (inversions % 2 === 0) === (emptyRow % 2 === 1);
        } else {
            return inversions % 2 === 0;
        }
    }

    function renderPuzzle() {
        puzzleBoard.innerHTML = '';
        tiles.forEach((number, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (number === null) {
                tile.classList.add('empty');
                emptyTileIndex = index;
            } else {
                tile.textContent = number;
                tile.dataset.index = index;
            }
            puzzleBoard.appendChild(tile);
        });

        document.querySelectorAll('.tile').forEach(tile => {
            tile.addEventListener('click', handleTileClick);
        });
    }

    function handleTileClick(event) {
        const clickedTile = event.target;
        const clickedIndex = parseInt(clickedTile.dataset.index);

        if (isMovable(clickedIndex)) {
            swapTiles(clickedIndex, emptyTileIndex);
            renderPuzzle();
            if (isSolved()) {
                message.textContent = 'クリア！おめでとうございます！';
                setTimeout(createNewPuzzle, 1500);
            }
        }
    }

    function isMovable(clickedIndex) {
        const clickedRow = Math.floor(clickedIndex / BOARD_SIZE);
        const clickedCol = clickedIndex % BOARD_SIZE;
        const emptyRow = Math.floor(emptyTileIndex / BOARD_SIZE);
        const emptyCol = emptyTileIndex % BOARD_SIZE;

        const rowDiff = Math.abs(clickedRow - emptyRow);
        const colDiff = Math.abs(clickedCol - emptyCol);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    function swapTiles(index1, index2) {
        [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
    }

    function isSolved() {
        const correctOrder = Array.from({length: BOARD_SIZE * BOARD_SIZE - 1}, (_, i) => i + 1);
        for (let i = 0; i < correctOrder.length; i++) {
            if (tiles[i] !== correctOrder[i]) {
                return false;
            }
        }
        return tiles[BOARD_SIZE * BOARD_SIZE - 1] === null;
    }

    createNewPuzzle();
});