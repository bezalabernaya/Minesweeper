window.addEventListener('load', main, false);


function main() {
rest.onclick = function(){
	min = 0;
hour = 0;
init()}
//Секундомер
//изначальные переменные
min = 0;
hour = 0;
//Оставляем вашу функцию
function init() {
    sec = 0;
    setInterval(tick, 1000);
}

//Основная функция tick()
function tick() {
  if (running) {
    sec++;
    if (sec >= 60) { //задаем числовые параметры, меняющиеся по ходу работы программы
        min++;
        sec = sec - 60;
    }
    if (min >= 60) {
        hour++;
        min = min - 60;
    }
    if (sec < 10) { //Визуальное оформление
        if (min < 10) {
            if (hour < 10) {
                document.getElementById('timer').innerHTML ='0' + hour + ':0' + min + ':0' + sec;
            } else {
                document.getElementById('timer').innerHTML = hour + ':0' + min + ':0' + sec;
            }
        } else {
            if (hour < 10) {
                document.getElementById('timer').innerHTML = '0' + hour + ':' + min + ':0' + sec;
            } else {
                document.getElementById('timer').innerHTML = hour + ':' + min + ':0' + sec;
            }
        }
    } else {
        if (min < 10) {
            if (hour < 10) {
                document.getElementById('timer').innerHTML = '0' + hour + ':0' + min + ':' + sec;
            } else {
                document.getElementById('timer').innerHTML = hour + ':0' + min + ':' + sec;
            }
        } else {
            if (hour < 10) {
                document.getElementById('timer').innerHTML = '0' + hour + ':' + min + ':' + sec;
            } else {
                document.getElementById('timer').innerHTML = hour + ':' + min + ':' + sec;
            }
        }
    }
    
  }
}

init();
}




let matrix = null;
let running = null;
let k = null;


let columns = 9;
let rows = 9;
let mines = 10

function rad()
{var rarr=document.getElementsByName('difficulty');
//задаем количество мин и размер поля в зависимости от сложности
  
    if(rarr[0].checked){
         columns = 9;
         rows = 9;
         mines = 10
    }
    if(rarr[1].checked){
        //То выбран первый radio 
     columns = 16;
     rows = 16;
     mines = 40
    }
    if(rarr[2].checked){
         columns = 16;
         rows = 30;
         mines = 99  
    } 

}

init(columns, rows, mines);

document
    .querySelector('.restart')
    .addEventListener('click', () => init(columns, rows, mines));

function init (columns, rows, mines) {
    rad();
    matrix = getMatrix(columns, rows); //создаем матрицу
    running = true;
    for (let i = 0; i < mines; i++) { //расставляем мины
        setRandomMine(matrix);
    }

    update();
}


let closeWin = document.querySelector('.close.youwin');
let win = document.querySelector('.win');

closeWin.addEventListener('click', function (evt) {//закрыть уведомление по клику
    evt.preventDefault();
    win.classList.toggle('appear');
});

let closeOver = document.querySelector('.close.over');
let gameover = document.querySelector('.gameover');

closeOver.addEventListener('click', function (evt) {//закрыть уведомление по клику
    evt.preventDefault();
    gameover.classList.toggle('appear');
	
});


function update () {//обновляем игровое поле
    if (!running) {
        return;
    }

    const gameElement = matrixToHtml(matrix);//создаем игровой элемент

    const appElement = document.querySelector('#app');//добавляем его в app
    appElement.innerHTML = '';
    appElement.append(gameElement);

    document.getElementsByClassName('gameover modal')[0].style.display = "none"//скрываем картинку о победе или поражении по умолчанию
    document.getElementsByClassName('win modal')[0].style.display = "none"
    appElement
        .querySelectorAll('img')//получаем информацию о нажатиях мыши
        .forEach(imgElement => {
            imgElement.addEventListener('mousedown', mousedownHandler);
            imgElement.addEventListener('mouseup', mouseupHandler);
            imgElement.addEventListener('mouseleave', mouseleaveHandler)
        });

    if (isLoose(matrix)) {
        let gameover = document.querySelector('.gameover');
        gameover.classList.add('appear');
        running = false;
        document.getElementsByClassName('gameover modal')[0].style.display = "block"//проявляем изображение
		
    }

    else if (isWin(matrix)) {
        document.getElementsByClassName('win modal')[0].style.display = "block" //проявляем изображение
        let win = document.querySelector('.win');
        win.classList.add('appear');
        running = false;
		
    }
}

function mousedownHandler (event) {
    //получаем информацию о том, какая кнопка мыши нажата
    const {cell, left, right } = getInfo(event);

    if (left) {
        cell.left = true;
    }

    if (right) {
        cell.right = true;
    }

    if (cell.left && cell.right) {
        bothHandler(cell);
    }

    update();
}

function mouseupHandler (event) {//информация о нажатии левой/правой/обеих кнопок мыши фиксируется
    const {left, right, cell } = getInfo(event);

    const both = cell.right && cell.left && (left || right);
    const leftMouse = !both && cell.left && left;
    const rightMouse = !both && cell.right && right;

    if (both) {
        forEach(matrix, x => x.potencial = false);
    }

    if (left) {
        cell.left = false;
    }

    if (right) {
        cell.right = false;
    }

    if (leftMouse) {
        leftHandler(cell)
    }

    else if (rightMouse) {
        rightHandler(cell)
    }

    update();
}

function mouseleaveHandler (event) {//возвращем информацию о то, что мышь больше не наведена на клетку
    const info = getInfo(event);

        info.cell.left = false;
        info.cell.right = false;

    update();
}

function getInfo (event) {//говорим что на мыши нажато и по какой клетке
    const element = event.target;
    const cellId = parseInt(element.getAttribute('data-cell-id'));

    return {
        left: event.which === 1,
        right: event.which === 3,
        cell: getCellById(matrix, cellId)
    }
}

function leftHandler (cell) {
    if (cell.show || cell.flag) {//открываем клетку нажатием левой кнопки мыши
        return;
    }
    cell.show = true;

    openSpace(matrix, cell.x, cell.y);
}

function rightHandler (cell) {//ставим в клетку флаг нажатием правой кнопки мыши
    if (!cell.show) {
         cell.flag = !cell.flag;
    }
}

function bothHandler (cell) {//показываем где могут быть мины
    if (!cell.show || !cell.number) {
        return;
    }

    const cells = getAroundCells(matrix, cell.x, cell.y);
    const flags = cells.filter(x => x.flag).length;

    if (flags === cell.number) {//открываем поле вокруг если флагов вокруг столько сколько должно быть мин
        cells
            .filter(x => !x.flag && !x.show)
            .forEach(cell => {
                cell.show = true
                openSpace(matrix, cell.x, cell.y)
            })
    }

    else {//показываем где могут быть мины
        cells
            .filter(x => !x.flag && !x.show)
            .forEach(cell => cell.potencial = true)
    }
}