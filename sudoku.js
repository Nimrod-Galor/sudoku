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
}

function initGrid(){
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
    console.log('success');
}

function userSelectTile(event){
    let cellIndex = event.target.id.match(/\d+/)[0];
    if(grid[cellIndex].hide === false){
        return;
    }

    // update dom element and class from current selection
    let inputObj = document.createElement('input');
    inputObj.type = "text";
    inputObj.id = "userInput";
    inputObj.addEventListener('blur', eventCellBlur);
    inputObj.addEventListener('keydown', eventKeyDown);
    inputObj.value = grid[cellIndex].userVal;
    event.target.innerHTML = '';
    event.target.appendChild(inputObj);
    if(grid[cellIndex].userVal === ''){
        inputObj.focus();
    }else{
        inputObj.select();
    }
    
    event.target.classList.add('selected');

    userInput.cellIndex = cellIndex;
}

function eventCellBlur(event){
    let selectedCell = document.getElementById(`cell-${userInput.cellIndex}`);
    selectedCell.classList.remove('selected', 'alert');
    event.target.removeEventListener('keydown', eventKeyDown);
    event.target.removeEventListener('blur', eventCellBlur);
    if(event.target.value === ''){
        // user delete value
        grid[userInput.cellIndex].userVal = '';
    }
    event.target.remove();
    draw();
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
    //console.log(event.code);
    if(event.code === 'Backspace' || event.code === 'Delete'){
        updateHistory( userInput.cellIndex, '');
        return;
    }

    let reg = event.code.match(/\d/);
    if(reg === null){
        event.preventDefault();
        return;
    }
    let val = Number(reg[0]);
    switch(val){
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            updateHistory( userInput.cellIndex, val);
            grid[userInput.cellIndex].userVal = val;
            let selectedCell = document.getElementById(`cell-${userInput.cellIndex}`);
            
            if(document.getElementById("alertError").checked && grid[userInput.cellIndex].val != val){
                // alert error
                selectedCell.classList.remove('selected');
                selectedCell.classList.add('alert');
            }else{
                // remove dome input and class
                event.target.removeEventListener('keydown', eventKeyDown);
                event.target.removeEventListener('blur', eventCellBlur);
                event.target.remove();
                selectedCell.classList.remove('selected', 'alert');
                selectedCell.innerHTML = val;
                checkSuccess();
            }
            
        break;
        default:
            event.preventDefault();
            return;
    }
}

function randomFromArray(arr){
    let index = randomFromRange(0, arr.length - 1);
    return arr[index];
}

function randomFromRange(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

addEventListener("DOMContentLoaded", (event) => {initGrid()});
