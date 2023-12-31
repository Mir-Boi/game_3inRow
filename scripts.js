let config = {

	containerColorBG: "#353336",
	contentColorBG: "#525053",

	countRows: 8,
	countCols: 6,

	offsetBorder: 2,
	borderRadius: 8,
		
	// заменил gemSize на components.wrapper.offsetWidth / 6
	// gemSize: 64,

	imagesGems: ["images/normal/1.png", "images/normal/2.png", "images/normal/3.png", "images/normal/4.png", "images/normal/5.png"],

	gemClass:"gem",
	gemIdPrefix: "gem",
	gameStates: ["pick", "switch", "revert", "remove", "refill"],
	gameState: "",
	
	movingItems: 0,

	countScore: 0
}

let player = {
	selectedRow: -1,
	selectedCol: -1,
	posX: "",
	posY: ""
}

let components = {
	container: document.querySelector(".container"),
	content: document.querySelector(".content"),
	wrapper: document.querySelector(".wrapper"),
	cursor: document.createElement("div"),
	score: document.querySelector(".score"),
	gems: new Array(),
}

var cursorPosition = [];  // по факту это собственный маркер выделенной клетки, т.к. player.selectedRow, player.selectedCol не столь стабилен будто для этого


// start Game
initGame();

// Инициализация всех составляющих игры
function initGame () {
	document.body.style.margin = "0px";
	createPage();
	createContentPage();
	createWrapper();
	createCursor();
	createGrid();
	// createScore();

	// Переключаем статус игры на "выбор"
	config.gameState = config.gameStates[ 0 ];
}

// Создание обертки для страницы
function createPage() {
	components.container.style.backgroundColor = config.containerColorBG;
	// components.container.style.height = "100vh";
	components.container.style.overflow = "hidden";
	components.container.style.display = "flex";
	components.container.style.flexDirection = "column";
	components.container.style.alignItems = "center";
	components.container.style.justifyContent = "center";

	// document.body.append( components.container );
}

// Создание обертки с контентом
function createContentPage () {
	// components.content.style.padding = config.offsetBorder + "px";
	// components.content.style.width = (config.gemSize * config.countCols) + (config.offsetBorder * 2) + "px";
	// components.content.style.height = (config.gemSize * config.countRows) + (config.offsetBorder * 2) + "px";
	// components.content.style.backgroundColor = config.contentColorBG;
	// components.content.style.boxShadow = config.offsetBorder + "px";
	// components.content.style.borderRadius = config.borderRadius + "px";
	// components.content.style.boxSizing = "border-box";

	// components.container.append( components.content );
}

// Создание обертки для монет и очков
function createWrapper () {
	components.wrapper.style.position = "relative";
	components.wrapper.style.height = "100%";
	components.wrapper.addEventListener("click", function(event) { handlerTab(event, event.target) });

	// components.content.append( components.wrapper );
}

// Создание курсора для выделения монет
function createCursor () {
	components.cursor.id = "marker";
	// components.cursor.classList.add("noselect");
	// components.cursor.style.width = config.gemSize - 10 + "px";
	// components.cursor.style.height = config.gemSize - 10 + "px";
	// components.cursor.style.border = "5px solid white";
	// components.cursor.style.borderRadius = "20px";
	// components.cursor.style.position = "absolute";
	// components.cursor.style.display = "none";

	components.wrapper.append( components.cursor );
}
// Показать курсор
function cursorShow () {
	components.cursor.style.display = "block";
}
// Скрыть курсор
function cursorHide () {
	components.cursor.style.display = "none";
}

// Создание блока для очков
// function createScore () {
// 	updateScore();
// }

// Обновить очки на странице
function updateScore () {
	components.score.innerHTML = config.countScore;
}

// Добавление очков
function scoreInc ( count ) {
	if ( count >= 4 ) {
		count *= 2;
	} else if ( count >= 5 ) {
		count = ( count + 1 ) * 2;
	} else if ( count >= 6 ) {
		count *= ( count + 2 ) * 2;
	}

	config.countScore += count;
	updateScore();
}

// TODO: Создание монеты
function createGem ( t, l, row, col, img ) {
	let gem = document.createElement("div");

	gem.classList.add( config.gemClass );
	gem.classList.add("noselect");
	gem.id = config.gemIdPrefix + '_' + row + '_' + col;
	// gem.style.top = t * 15.6 + "vw";
	// gem.style.left = l + "px";
	// Эта формула ниже делает следующее: при создании элементов она берет ширину div-оболочки и делает такой вот отступ
	// Зачем нужно? Разные экраны если, то установится размер нормальный, но только при загрузке сайтов. Полагаюсь на то, что webapp не даёт менять размеров экрана
	gem.style.top = components.wrapper.offsetWidth / config.countCols * t + "px";
	gem.style.left = components.wrapper.offsetWidth / config.countCols * l + "px";
	gem.style.background = "center url("+ img +") no-repeat";
	gem.style.backgroundSize = "88%";

	components.wrapper.append(gem);
}

// Создание и наполнение сетки для монет
function createGrid() {
	// Создание пустой сетки
	for(i = 0; i < config.countRows; i++) {
		components.gems[i] = new Array();
		for(j = 0; j < config.countCols; j++) {
			components.gems[i][j] = -1;
		}
	}

	// Заполняем сетку
	for( i = 0; i < config.countRows; i++ ) {
		for( j = 0; j < config.countCols; j++ ) {

			do{
				components.gems[i][j] = Math.floor(Math.random() * config.imagesGems.length);
			} while( isStreak(i, j) );

			createGem(
				// t= i * config.gemSize, 
				// l=j * config.gemSize, 
				t=i, 
				l=j, 
				row=i, 
				col=j, 
				img=config.imagesGems[ components.gems[i][j] ] );
		}
	}
}

// Проверка на группу сбора
function isStreak( row, col ) {
	return isVerticalStreak( row, col ) || isHorizontalStreak( row, col );
}
// Проверка на группу сбора по колонкам
function isVerticalStreak( row, col ) {
	let gemValue = components.gems[row][col];
	let streak = 0;
	let tmp = row;

	while(tmp > 0 && components.gems[tmp - 1][col] == gemValue){
		streak++;
		tmp--;
	}

	tmp = row;

	while(tmp < config.countRows - 1 && components.gems[tmp + 1][col] == gemValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}
// Проверка на группу сбора по строкам
function isHorizontalStreak( row, col ) {
	let gemValue = components.gems[row][col];
	let streak = 0;
	let tmp = col;

	while(tmp > 0 && components.gems[row][tmp - 1] == gemValue){
		streak++;
		tmp--;
	}

	tmp = col;

	while(tmp < config.countCols - 1 && components.gems[row][tmp + 1] == gemValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}

// TODO: клик
// Обработчик клика
function handlerTab ( event, target ) {
	// Если это элемент с классом config.gameClass
	// и
	// Если подходящее состояние игры
	if( target.classList.contains( config.gemClass ) && config.gameStates[ 0 ]) {
		// определить строку и столбец
		let row = parseInt( target.getAttribute( "id" ).split( "_" )[ 1 ] );
		let col =  parseInt( target.getAttribute( "id" ).split( "_" )[ 2 ] );


		// Если нажали на ту же клетку где и выбрали, то надо снять выделение
		// Вот эта чертовщина это сравнение массивов :)  (если ты нажал на ту же клетку)
		if ([row, col].every(function(element, index) {
			return element == cursorPosition[index]; 
		})){
			cursorHide();  // убрали выделение визуальное
			cursorPosition = [];  // следовательно убрали и обозначение

			// сброс выбранной клетки
			player.selectedRow = -1;  
			player.selectedCol = -1;
			return;
		}
		// console.log(player.selectedRow, player.selectedCol)
		
		cursorShow();  // Выделяем гем курсором
		cursorPosition = [row, col];  // фиксируем место нажатия

		components.cursor.style.top = parseInt( target.style.top ) + "px";
		components.cursor.style.left = parseInt( target.style.left ) + "px";

		// Если это первый выбор, то сохраняем выбор
		if( player.selectedRow == -1 ) {
			player.selectedRow = row;
			player.selectedCol = col;
		} else {
			// Если гем находится радом с первым выбором
			// то меняем их местами
			if ( ( Math.abs( player.selectedRow - row ) == 1 && player.selectedCol == col ) ||
				( Math.abs( player.selectedCol - col ) == 1 && player.selectedRow == row ) ){
					cursorHide();

					// После выбора меняем состояние игры
					config.gameState = config.gameStates[1];

					// сохранить позицию второго выбранного гема
					player.posX = col;
					player.posY = row;

					// поменять их местами
					gemSwitch();

					cursorPosition = [];  // сбрасываем выделение
			} else {
				// Если второй выбор произошел не рядом,
				// то делаем его первым выбором.
				player.selectedRow = row;
				player.selectedCol = col;
			}
		}
	}
}

// Меняем гемы местами
function gemSwitch () {
	let yOffset = player.selectedRow - player.posY;
	let xOffset = player.selectedCol - player.posX;

	// Метка для гемов, которые нужно двигать
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).classList.add("switch");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("dir", "-1");

	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).classList.add("switch");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("dir", "1");

	// меняем местами гемы
	$( ".switch" ).each( function() {
		config.movingItems++;

		$(this).animate( {
			// components.wrapper.offsetWidth / 6 * t
			// top: "+=" + yOffset * config.gemSize * $(this).attr("dir")
				left: "+=" + xOffset * components.wrapper.offsetWidth / config.countCols  * $(this).attr("dir"),
				top: "+=" + yOffset * components.wrapper.offsetWidth / config.countCols * $(this).attr("dir")
			},
			{
				duration: 250,
				complete: function() {
					//Проверяем доступность данного хода
					checkMoving();
				}
			}
		);

		$(this).removeClass("switch");
	});
	

	// поменять идентификаторы гемов
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("id", "temp");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("id", config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol);
	document.querySelector("#temp").setAttribute("id",  config.gemIdPrefix + "_" + player.posY + "_" + player.posX);

	// поменять гемы в сетке
	let temp = components.gems[player.selectedRow][player.selectedCol];
	components.gems[player.selectedRow][player.selectedCol] = components.gems[player.posY][player.posX];
	components.gems[player.posY][player.posX] = temp;
}

// Проверка перемещенных гемов
function checkMoving () {
	config.movingItems--;

	// Действуем тольпо после всех перемещений
	if( config.movingItems == 0 ) {

		// Действия в зависимости от состояния игры
		switch( config.gameState ) {

			// После передвижения гемов проверяем на появление групп сбора
			case config.gameStates[1]:
			case config.gameStates[2]:
				// проверяем, появились ли группы сбора
				if( !isStreak( player.selectedRow, player.selectedCol ) && !isStreak( player.posY, player.posX ) ) {
					// Если групп сбора нет, нужно отменить совершенное движение
					// а если действие уже отменяется, то вернуться к исходному состоянию ожидания выбора
					if( config.gameState != config.gameStates[2] ){
						config.gameState = config.gameStates[2];
						gemSwitch();
					} else {
						config.gameState = config.gameStates[0];
						player.selectedRow = -1;
						player.selectedCol = -1;
					}
				} else {
					// Если группы сбора есть, нужно их удалить
					config.gameState = config.gameStates[3]

					// Отметим все удаляемые гемы
					if( isStreak( player.selectedRow, player.selectedCol ) ) {
						removeGems( player.selectedRow, player.selectedCol );
					}

					if(isStreak(player.posY, player.posX)) {
						removeGems( player.posY, player.posX );
					}

					// Убираем с поля
					gemFade();
				}
				break;
			// После удаления нужно заполнить пустоту
			case config.gameStates[3]:
				checkFalling();
				break;
			case config.gameStates[4]:
				placeNewGems();
				break;
		}

	}

}

// Отмечаем элементы для удаления и убираем их из сетки
function removeGems( row, col ) {
	let gemValue = components.gems[ row ][ col ];
	let tmp = row;

	document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + col ).classList.add( "remove" );
	let countRemoveGem = document.querySelectorAll( ".remove" ).length;

	if ( isVerticalStreak( row, col ) ) {
		while ( tmp > 0 && components.gems[ tmp - 1 ][ col ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + ( tmp - 1 ) + "_" + col ).classList.add( "remove" );
			components.gems[ tmp - 1 ][ col ] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = row;

		while ( tmp < config.countRows - 1 && components.gems[ tmp + 1 ][ col ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + ( tmp + 1 ) + "_" + col ).classList.add( "remove" );
			components.gems[ tmp + 1 ][ col ] = -1;
			tmp++;
			countRemoveGem++;
		}
	}

	if ( isHorizontalStreak( row, col ) ) {
		tmp = col;

		while ( tmp > 0 && components.gems[ row ][ tmp - 1 ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + ( tmp - 1 ) ).classList.add( "remove" );
			components.gems[ row ][ tmp - 1 ] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = col;

		while( tmp < config.countCols - 1 && components.gems[ row ][ tmp + 1 ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + ( tmp + 1 ) ).classList.add( "remove" );
			components.gems[ row ][ tmp + 1 ] = -1;
			tmp++;
			countRemoveGem++;
		}
	}

	components.gems[ row ][ col ] = -1;

	scoreInc( countRemoveGem );
}

// Удаляем гемы
function gemFade() {
	$( ".remove" ).each(function() {
		config.movingItems++;

		$(this).animate( {
				opacity: 0
			},
			{
				duration: 200,
				complete: function() {
					$(this).remove();
					checkMoving();
				}
			}
		);
	});
}

// Заполняем пустоту
function checkFalling() {
	let fellDown = 0;

	for( j = 0; j < config.countCols; j++ ) {
		for( i = config.countRows - 1; i > 0; i-- ) {

			if(components.gems[i][j] == -1 && components.gems[i - 1][j] >= 0) {
				document.querySelector( "#" + config.gemIdPrefix + "_" + (i - 1) + "_" + j ).classList.add( "fall" );
				document.querySelector( "#" + config.gemIdPrefix + "_" + (i - 1) + "_" + j ).setAttribute( "id", config.gemIdPrefix + "_" + i + "_" + j );
				components.gems[ i ][ j ] = components.gems[ i - 1 ][ j ];
				components.gems[ i - 1 ][ j ] = -1;
				fellDown++;
			}

		}
	}

	$( ".fall" ).each( function() {
		config.movingItems++;

		$( this ).animate( {
				top: "+=" + components.wrapper.offsetWidth / config.countCols
			},
			{
				duration: 100,
				complete: function() {
					$( this ).removeClass( "fall" );
					checkMoving();
				}
			}
		);
	});

	// Если все элементы передвинули,
	// то сменить состояние игры
	if( fellDown == 0 ){
		config.gameState = config.gameStates[4];
		config.movingItems = 1;
		checkMoving();
	}
}


// Создание новых гемов
// TODO: newGems
function placeNewGems() {
	let gemsPlaced = 0;

	// Поиск мест, в которых необходимо создать гем
	for( i = 0; i < config.countCols; i++ ) {
		if( components.gems[ 0 ][ i ] == -1 ) {
			components.gems[ 0 ][ i ] = Math.floor( Math.random() * config.imagesGems.length );

			
			createGem(
				t=0, 
				// l=i * config.gemSize, 
				l=i, 
				row=0, 
				col=i, 
				img=config.imagesGems[ components.gems[ 0 ][ i ] ] 
			);
			gemsPlaced++;
		}
	}

	// Если мы создали гемы, то проверяем необходимость их сдвинуть вниз.
	if( gemsPlaced ) {
		config.gameState = config.gameStates[ 3 ];
		checkFalling();
	} else {
		// Проверка на группы сбора
		let combo = 0

		for ( i = 0; i < config.countRows; i++ ) {
			for ( j = 0; j < config.countCols; j++ ) {

				if ( j <= config.countCols - 3 && components.gems[ i ][ j ] == components.gems[ i ][ j + 1 ] && components.gems[ i ][ j ] == components.gems[ i ][ j + 2 ] ) {
					combo++;
					removeGems( i, j );
				}
				if ( i <= config.countRows - 3 && components.gems[ i ][ j ] == components.gems[ i + 1 ][ j ] && components.gems[ i] [ j ] == components.gems[ i + 2 ][ j ] ) {
					combo++;
					removeGems( i, j );
				}

			}
		}

		// удаляем найденные группы сбора
		if( combo > 0 ) {
			config.gameState = config.gameStates[ 3 ];
			gemFade();
		} else { 
			// Запускаем основное состояние игры
			config.gameState = config.gameStates[ 0 ];
			player.selectedRow= -1;
		}
	}
}

Telegram.WebApp.expand();
Telegram.WebApp.enableClosingConfirmation();  // вышел - проиграл
