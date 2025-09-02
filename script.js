document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const message = document.getElementById('message');
    const menuBtn = document.querySelector('.menu-btn');
    const menuContent = document.getElementById('menu-options');
    let BOARD_SIZE = 3;
    let tiles = [];
    let emptyTileIndex;

    // ドラッグ＆ドロップ関連の変数
    let isDragging = false;
    let draggedTile = null;
    let initialX, initialY;

    function createNewPuzzle() {
        message.textContent = '';
        puzzleBoard.innerHTML = '';
        // ボードのスタイルを更新
        puzzleBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;

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
            // タイルのフォントサイズをマス数に応じて調整
            if (BOARD_SIZE > 3) {
                tile.style.fontSize = `calc(2rem / ${BOARD_SIZE - 2})`;
            }

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
            tile.addEventListener('mousedown', handlePointerDown);
            tile.addEventListener('touchstart', handlePointerDown, { passive: false });
        });
    }

    function handlePointerDown(e) {
        if (e.target.classList.contains('empty')) return;
        
        isDragging = true;
        draggedTile = e.target;
        
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX;
            initialY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            initialX = e.clientX;
            initialY = e.clientY;
        }

        draggedTile.style.position = 'relative';
        draggedTile.style.zIndex = 100;
        
        document.addEventListener('mousemove', handlePointerMove);
        document.addEventListener('touchmove', handlePointerMove, { passive: false });
        document.addEventListener('mouseup', handlePointerUp);
        document.addEventListener('touchend', handlePointerUp);
    }
    
    function handlePointerMove(e) {
        if (!isDragging) return;
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const dx = clientX - initialX;
        const dy = clientY - initialY;
        
        draggedTile.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    
    function handlePointerUp(e) {
        if (!isDragging) return;
        
        const draggedIndex = parseInt(draggedTile.dataset.index);
        const emptyTile = document.querySelector('.tile.empty');
        const emptyRect = emptyTile.getBoundingClientRect();
        const tileRect = draggedTile.getBoundingClientRect();
        
        if (
            tileRect.left < emptyRect.right &&
            tileRect.right > emptyRect.left &&
            tileRect.top < emptyRect.bottom &&
            tileRect.bottom > emptyRect.top &&
            isMovable(draggedIndex)
        ) {
            swapTiles(draggedIndex, emptyTileIndex);
            renderPuzzle();
            if (isSolved()) {
                message.textContent = 'クリア！おめでとうございます！';
                setTimeout(createNewPuzzle, 1500);
            }
        }
        
        draggedTile.style.position = '';
        draggedTile.style.zIndex = '';
        draggedTile.style.transform = '';
        isDragging = false;
        draggedTile = null;
        
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        document.removeEventListener('touchend', handlePointerUp);
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

    // ハンバーガーメニューの開閉
    menuBtn.addEventListener('click', () => {
        menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
    });

    // サイズ変更の処理
    document.querySelectorAll('#menu-options a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const newSize = parseInt(e.target.dataset.size);
            if (newSize !== BOARD_SIZE) {
                BOARD_SIZE = newSize;
                createNewPuzzle();
            }
            menuContent.style.display = 'none';
        });
    });

    // メニューの外をクリックで閉じる
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !menuContent.contains(e.target)) {
            menuContent.style.display = 'none';
        }
    });

    createNewPuzzle();
});
