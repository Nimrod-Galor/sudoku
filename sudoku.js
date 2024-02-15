let gridSize = 600;
let cellSize = gridSize / 9;
let grid = [];
let userInput = {
    cellIndex : undefined,
    history : [],
    historyIndex : -1
};

function draw(){
    for(let i=0; i < 81; i++){
        if(grid[i].hide === false){
            document.getElementById(`cell-${i}`).innerHTML = grid[i].val;
        }else if(grid[i].userVal != ''){
            document.getElementById(`cell-${i}`).innerHTML = grid[i].userVal;
        }else{
            document.getElementById(`cell-${i}`).innerHTML = '';
        }
    }
    alertErrors();
}

function initGrid(){
    document.getElementById("pyro").style.display = "none";
    grid = [];
    for(let i=0; i < 81; i++){
        let row = Math.floor(i / 9);
        let col =  (i % 9);
        let block = Math.floor(col / 3) + Math.floor(row / 3) * 3;
        grid[i] = new Cell(row, col, block);// row col block
    }

    generateSudoku();
}

function generateSudoku(){
    gridCopy = grid.filter(a =>  a.val === '');

    if(gridCopy.length === 0){
        // we are Done!
        reveal();
        draw();
        return;
    }

    // sort by entropy
    gridCopy.sort((a, b) => {
        return a.options.length - b.options.length;
    });

    // get only items with min entropy
    const minEntropy = gridCopy[0].options.length;
    gridCopy = gridCopy.filter(a => a.options.length <= minEntropy);

    // pick random cell (from min entropy array)
    const cell = randomFromArray(gridCopy);

    if(cell.options.length === 0){
        //restart
        initGrid();
        return;
    }
    // pick random option (of picked cell)
    const optionPick = randomFromArray(cell.options);
    cell.options = [];
    cell.val = optionPick;

    // update entropy arrays
    for(let i=0; i < 81; i++){
        if(grid[i].col === cell.col || grid[i].row === cell.row || grid[i].block === cell.block){
            // remove option
            let index = grid[i].options.indexOf(optionPick);
            if(index !== -1){
                grid[i].options.splice(index, 1);
            }
            
        }
    }

    generateSudoku();
}

function reveal(){
    let numOftiles = Number(document.getElementById("reveal").value);
    do{
        let rnd = Math.floor(randomFromRange(0, 80));
        if(grid[rnd].hide === true){
            grid[rnd].hide = false;
            numOftiles -= 1;
        }
    }while(numOftiles > 0);
}

function checkSuccess(){
    gridCopy = grid.filter(a => a.hide);

    for(let i = 0; i < gridCopy.length; i++){
        if(gridCopy[i].val != gridCopy[i].userVal){
            return;
        }
    }
    // success
    // fireworks
    document.getElementById("pyro").style.display = "block";
    console.log('success');
}

function userSelectTile(event){
    let cellIndex = event.target.id.match(/\d+/)[0];
    if(grid[cellIndex].hide === false){
        return;
    }

    if(document.getElementById("numPad").checked){
        // use embeded numpad
        let tile = document.getElementById(`cell-${cellIndex}`);
        tile.classList.add('selected');
        tile.addEventListener('blur', eventTileBlur);
        tile.addEventListener('keydown', eventKeyDown);
        tile.focus();
        highlightCellValue(tile);
        userInput.cellIndex = cellIndex;
    }else{
        createInputTile(cellIndex);
    }
}

function eventTileBlur(event){
    event.target.classList.remove("selected");
    event.target.removeEventListener('blur', eventTileBlur);
    event.target.removeEventListener('keydown', eventKeyDown);
}

function createInputTile(cellIndex){
    let tile = document.getElementById(`cell-${cellIndex}`);
    // update dom element and class from current selection
    let inputObj = document.createElement('input');
    inputObj.type = "text";
    inputObj.id = "userInput";
    inputObj.addEventListener('blur', eventCellInputBlur);
    inputObj.addEventListener('keydown', eventKeyDown);
    inputObj.value = grid[cellIndex].userVal;
    tile.innerHTML = '';
    tile.appendChild(inputObj);
    if(grid[cellIndex].userVal === ''){
        inputObj.focus();
    }else{
        inputObj.select();
    }

    tile.classList.add('selected');

    userInput.cellIndex = cellIndex;
}

function eventCellInputBlur(event){
    let selectedCell = document.getElementById(`cell-${userInput.cellIndex}`);
    selectedCell.classList.remove('selected');
    event.target.removeEventListener('keydown', eventKeyDown);
    event.target.removeEventListener('blur', eventCellInputBlur);
    // if(event.target.value === ''){
    //     // user delete value
    //     grid[userInput.cellIndex].userVal = '';
    // }
    event.target.remove();
    //draw();
}

function updateHistory(cellIndex, newValue){
    userInput.history.push({cellIndex, oldValue: grid[cellIndex].userVal, newValue, type: 'history'});

    userInput.historyIndex = userInput.history.length - 1;
    document.getElementById("undoBtn").disabled = false;
}

function historyUndo(){
    // update grid
    let cellIndex = userInput.history[userInput.historyIndex].cellIndex;
    let oldValue = userInput.history[userInput.historyIndex].oldValue;
    let newValue = userInput.history[userInput.historyIndex].newValue;
    grid[cellIndex].userVal = oldValue;
    // update history
    userInput.history.push({cellIndex, oldValue: newValue, newValue: oldValue, type: 'undo'});
    userInput.historyIndex -= 1;

    if(userInput.historyIndex < 0){
        document.getElementById("undoBtn").disabled = true;
    }
    document.getElementById("redoBtn").disabled = false;
    draw();
}

function historyRedo(){
    // update history
    userInput.historyIndex += 1;
    // update grid
    let cellIndex = userInput.history[userInput.historyIndex].cellIndex;
    //let oldValue = userInput.history[userInput.historyIndex].oldValue;
    let newValue = userInput.history[userInput.historyIndex].newValue;
    grid[cellIndex].userVal = newValue;
    
    if(userInput.historyIndex >= userInput.history.length || userInput.history[userInput.historyIndex + 1].type === 'undo'){
        document.getElementById("redoBtn").disabled = true;
        //userInput.historyIndex = userInput.history.length - 1;
    }
    draw();
}

function eventKeyDown(event){
    console.log(event.code);
    let val = event.code;
    let reg = event.code.match(/\d/);
    if(reg != null){
        val = Number(reg[0]);
    }
    
    switch(val){
        case 'Backspace':
        case 'Delete':
            document.getElementById(`cell-${userInput.cellIndex}`).classList.remove('selected', 'alert');
            grid[userInput.cellIndex].userVal = '';
            updateHistory(userInput.cellIndex, '');
        break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            updateValue(val);
        break;
        case 'ArrowLeft':
            getNextFreeCell(-1);
        break;
        case 'ArrowUp':
            getNextFreeCell(-9);
        break;
        case 'ArrowRight':
            getNextFreeCell(1);
        break;
        case 'ArrowDown':
            getNextFreeCell(9);
        break;
        default:
            event.preventDefault();
            return;
    }

    // if(event.target.nodeName === 'DIV'){
    //     event.target.blur();
    // }

    event.target.blur();
    draw();
}

function updateValue(val){
    updateHistory( userInput.cellIndex, val);
    grid[userInput.cellIndex].userVal = val;
    let selectedCell = document.getElementById(`cell-${userInput.cellIndex}`);
    selectedCell.classList.remove('selected');
    //userInput.cellIndex = undefined;
    checkSuccess();
    // if(document.getElementById("alertError").checked && grid[userInput.cellIndex].val != val){
    //     // alert error
    //     selectedCell.classList.remove('selected');
    //     selectedCell.classList.add('alert');
    // }else{
    //     // remove dome input and class
    //     let inputObj = document.getElementById("userInput");
    //     if(inputObj){
    //         inputObj.removeEventListener('keydown', eventKeyDown);
    //         inputObj.removeEventListener('blur', eventCellInputBlur);
    //         inputObj.remove();
    //     }
    //     selectedCell.classList.remove('selected', 'alert');
    //     selectedCell.innerHTML = val;
    //     userInput.cellIndex = undefined;
    //     checkSuccess();
    // }
}

function getNextFreeCell(step){
    //remove curen selected cell class
    document.getElementById(`userInput`).blur();
    // find next free tile index
    let index = Number(userInput.cellIndex);
    do{
        index += step;

        if(index < 0){
            if(step === -1){// cols
                index = 80;
            }else{// rows
                index += 81;
            }
        }else if(index > 80){
            if(step === 1){// cols
                index = 0;
            }else{// rows
                index -= 81;
            }
        }
    }while(!grid[index].hide || grid[index].userVal != '');

    createInputTile(index);
}


function clickNumpad(event){
    console.log(`key: ${event.target.dataset.key}`);
    if(userInput.cellIndex){
        updateValue(event.target.dataset.key);
        event.target.blur();
        draw();
        userInput.cellIndex = undefined;
    }
}

function alertErrors(){
    let showAlerts = document.getElementById('alertError').checked;
    for(let i =0; i < grid.length; i++){
        if(showAlerts && grid[i].hide && grid[i].userVal != '' && grid[i].userVal != grid[i].val){//error
            document.getElementById(`cell-${i}`).classList.add('alert');
        }else{
            document.getElementById(`cell-${i}`).classList.remove('alert');
        }
    }
}

function toggleNumpad(event){
    if(event.target.checked){
        document.getElementById("numpad").classList.add('open');
    }else{
        document.getElementById("numpad").classList.remove('open');
    }
}

function randomFromArray(arr){
    let index = randomFromRange(0, arr.length - 1);
    return arr[index];
}

function randomFromRange(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

function highlightCellValue(node){
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

addEventListener("DOMContentLoaded", (event) => {initGrid()});
