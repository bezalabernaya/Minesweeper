function getMatrix (columns, rows) {//создаем матрицу
    const matrix = [];

    let idCounter = 1;//счетчик id
    for (let y = 0; y < rows; y++) {//создание строк
        const row = [];

        for (let x = 0; x < columns; x++) {//создание ячеек
            row.push({
                id: idCounter++,//увеличение id
                //присваеваем характеристики ячейкам
                left: false,
                right: false,
                show: false,
                flag: false,
                mine: false,
                potencial: false,
                number: 0,
                x,
                y
            })
        }

        matrix.push(row);
    }

    return matrix;
}

function getRandomFreeCell (matrix) {//находим пустую клетку
    const freeCells = [];

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const cell = matrix[y][x];//проверяем свободна ли клетка

            if (!cell.mine) {//если да добавляем индек с в массив
                freeCells.push(cell);
            }
        }
    }

    const index = Math.floor(Math.random() * freeCells.length);
    return freeCells[index];
}

function setRandomMine (matrix) {//создаем мину в пустой клетке
    const cell = getRandomFreeCell(matrix);
    cell.mine = true;

    const cells = getAroundCells(matrix, cell.x, cell.y);

    for (const cell of cells) {
        cell.number++;
    }
}

function getCell (matrix, x, y) {//возвращаем клетку, если она есть
    if(!matrix[y] || !matrix[y][x]) {
        return false;
    }

    return matrix[y][x]
}

function getAroundCells (matrix, x, y) {//создаем массив клеток вокруг клетки с координатами х и у
    const cells = [];
    
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0) {
                continue;
            }

            const cell = getCell(matrix, x + dx, y + dy);

            if (!cell) {
                continue;
            }

            cells.push(cell);
        }
    }

    return cells;
}

function getCellById (matrix, id) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length;x++) {
            const cell = matrix[y][x] 

            if (cell.id === id) {
                return cell;
            }
        }
    }
    return false;
}

function matrixToHtml (matrix) {//преобразуем матрицу в dom-дерево
    const gameElement = document.createElement('div');//создаем основной элемент - сапер
    gameElement.classList.add('sapper');

    for (let y = 0; y < matrix.length; y++) {//создаем отдельный элемент для каждой строки внутри сапера
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        for (let x = 0; x < matrix[y].length; x++) {//создаем отдельный элемент по каждую клетку
            const cell = matrix[y][x];
            const imgElement = document.createElement('img');

            imgElement.draggable = false;//запрещаем двигать картинки
            imgElement.oncontextmenu = () => false;//запрещаем открывать контекстное меню
            imgElement.setAttribute('data-cell-id', cell.id)//присваеваем id изображениям
            rowElement.append(imgElement);

            if (cell.flag) {//вставляем в клетку картинку в зависимости от содержимого
                imgElement.src = '11.png';
                continue;
            }

            if (cell.potencial) {
                imgElement.src = '12.png';
                continue;
            }

            if (!cell.show) {
                imgElement.src = '10.png';
                continue;
            }

            if (cell.mine) {
                imgElement.src = '9.png';
                continue;
            }

            if (cell.number) {
                imgElement.src = cell.number + '.png';
                continue;
            }

            imgElement.src = '0.png';
            
        }

        gameElement.append(rowElement);
    }

    return gameElement;
}

function forEach (matrix, handler) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length;x++) {
            handler(matrix[y][x]);
        }
    }
}

function openSpace (matrix, x, y) {//открываем клетки где нет мин, флагов, и чисел по соседству с щелкнутой
    const cell = getCell(matrix, x, y);

    if (cell.flag || cell.number || cell.mine) {
        return;
    }

    forEach(matrix, x => x._marked = false);

    cell._marked = true;

    let flag = true;
    while (flag) {
        flag = false;

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length;x++){
                const cell = matrix[y][x];

                if (!cell._marked || cell.number) {
                    continue;
                }

                const cells = getAroundCells(matrix, x, y);
                for (const cell of cells) {
                    if (cell._marked) {
                        continue;
                    }

                    if (!cell.flag && !cell.mine) {
                        cell._marked = true;
                        flag = true;
                    }
                }
            }
        }
    }

    forEach(matrix, x => {
        if (x._marked) {
            x.show = true;
        }

        delete x._marked});
}

function isWin (matrix) {//условия победы
    const flags = [];
    const mines = [];

    forEach(matrix, cell => {
        if (cell.flag) {
            flags.push(cell);
        }

        if (cell.mine) {
            mines.push(cell);
        }
    })
   
    if (flags.length !== mines.length) {
        return false;
    }

    for (const cell of mines) {
        if (!cell.flag) {
            return false;
        }
    }

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length;x++){
            const cell = matrix[y][x];

            if(!cell.mine && !cell.show) {
                return false;
            }
        }
	
    }
   
    return true;

}

function isLoose (matrix) {//условия поражения
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length;x++){
            const cell = matrix[y][x];

            if(cell.mine && cell.show) {
                return true;
				
            }
        }
    }
}