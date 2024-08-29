let tableDimensions = new Map();

document.addEventListener('DOMContentLoaded', function() {
  const editor = document.getElementById('MainContainer');

  editor.addEventListener('keydown', handleKeyDown);
  editor.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // Save initial table dimensions
  saveTablDimensions();

  // Set up a MutationObserver to detect changes in the parent div
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        restoreTableDimensions();
      }
    });
  });

  // Start observing the parent div for configured mutations
  observer.observe(editor, { childList: true, subtree: true });
});

let isResizing = false;
let currentCell = null;
let resizeType = null;
let initialX, initialY, initialWidth, initialHeight;

function saveTablDimensions() {
  const tables = document.querySelectorAll('#MainContainer table');
  tables.forEach((table, tableIndex) => {
    const tableData = {
      width: table.style.width,
      height: table.style.height,
      cells: []
    };
    table.querySelectorAll('td').forEach((cell, cellIndex) => {
      tableData.cells.push({
        width: cell.style.width,
        height: cell.style.height
      });
    });
    tableDimensions.set(tableIndex, tableData);
  });
}

function restoreTableDimensions() {
  const tables = document.querySelectorAll('#MainContainer table');
  tables.forEach((table, tableIndex) => {
    const tableData = tableDimensions.get(tableIndex);
    if (tableData) {
      table.style.width = tableData.width;
      table.style.height = tableData.height;
      table.querySelectorAll('td').forEach((cell, cellIndex) => {
        if (tableData.cells[cellIndex]) {
          cell.style.width = tableData.cells[cellIndex].width;
          cell.style.height = tableData.cells[cellIndex].height;
        }
      });
    }
  });
}

function handleKeyDown(event) {
  if (event.key === 'Backspace' || event.key === 'Delete') {
    const cell = getCaretNode();
    if (cell && cell.tagName === 'TD') {
      const selection = window.getSelection();
      if (selection.toString() === cell.textContent) {
        event.preventDefault();
        cell.innerHTML = ''; // Clear the cell content
      }
    }
  }
}

function handleMouseDown(e) {
  const cell = e.target.closest('td');
  if (!cell) return;

  const rect = cell.getBoundingClientRect();
  const isNearRightEdge = e.clientX > rect.right - 5;
  const isNearBottomEdge = e.clientY > rect.bottom - 5;

  if (isNearRightEdge || isNearBottomEdge) {
    isResizing = true;
    currentCell = cell;
    initialX = e.clientX;
    initialY = e.clientY;
    initialWidth = cell.offsetWidth;
    initialHeight = cell.offsetHeight;

    if (isNearRightEdge && isNearBottomEdge) {
      resizeType = 'both';
    } else if (isNearRightEdge) {
      resizeType = 'horizontal';
    } else {
      resizeType = 'vertical';
    }

    highlightResizeBorder(cell, resizeType);
    e.preventDefault(); // Prevent text selection
  }
}

function highlightResizeBorder(cell, type) {
  if (type === 'horizontal' || type === 'both') {
    cell.style.borderRightWidth = '2px';
    cell.style.borderRightColor = '#0078D7';
  }
  if (type === 'vertical' || type === 'both') {
    cell.style.borderBottomWidth = '2px';
    cell.style.borderBottomColor = '#0078D7';
  }
}

function resetBorders(cell) {
  cell.style.borderRightWidth = '';
  cell.style.borderRightColor = '';
  cell.style.borderBottomWidth = '';
  cell.style.borderBottomColor = '';
}

function handleMouseMove(e) {
  if (!isResizing || !currentCell) return;

  const dx = e.clientX - initialX;
  const dy = e.clientY - initialY;

  if (resizeType === 'horizontal' || resizeType === 'both') {
    const newWidth = Math.max(initialWidth + dx, 0); // Allow zero width
    currentCell.style.width = `${newWidth}px`;
  }

  if (resizeType === 'vertical' || resizeType === 'both') {
    const newHeight = Math.max(initialHeight + dy, 0); // Allow zero height
    currentCell.style.height = `${newHeight}px`;
  }
}

function handleMouseUp() {
  if (currentCell) {
    resetBorders(currentCell);
  }
  isResizing = false;
  currentCell = null;
  resizeType = null;
}

function getCaretNode() {
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    let node = range.startContainer;
    return node.nodeType === 3 ? node.parentNode : node;
  }
}

function clearSelectedCells() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;

  // Check if the selection is within a single table
  const table = container.nodeName === 'TABLE' ? container : findParent('table', container);
  if (!table) return;

  const cells = table.getElementsByTagName('td');
  Array.from(cells).forEach(cell => {
    // Check if the cell is within the selection range
    if (selection.containsNode(cell, true)) {
      cell.innerHTML = ''; // Clear the content of the cell
    }
  });
}

function findParent(tagname, el) {
  while (el) {
    if (el.nodeName.toLowerCase() === tagname.toLowerCase()) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

function addTableAtCaret() {
  const table = document.createElement('table');
  table.border = '1';
  table.style.borderCollapse = 'separate';
  table.style.borderSpacing = '0';
  const uniqueId = 'table_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  table.setAttribute("table_id", uniqueId);

  let tr = table.insertRow(-1);
  for (let i = 0; i < 3; i++) {
    let td = tr.insertCell(-1);
    td.innerHTML = 'Cell';
    td.style.border = '1px solid black';
    td.style.padding = '5px';
    td.style.position = 'relative';
    td.style.minWidth = '10px';
    td.style.minHeight = '10px';
  }
  let node = getCaretNode();
  if (node && node.nodeName === 'DIV') {
    node.appendChild(table);
  }
}

function addRow() {
  let cell = getCaretNode();
  let table = findParent('table', cell);
  if (table) {
    let newRow = table.insertRow(-1);
    for (let i = 0; i < table.rows[0].cells.length; i++) {
      let newCell = newRow.insertCell(-1);
      newCell.innerHTML = ' ';
      newCell.style.border = '1px solid black';
      newCell.style.padding = '5px';
    }
  }
}

function addColumn() {
  let cell = getCaretNode();
  let table = findParent('table', cell);
  if (table) {
    for (let i = 0; i < table.rows.length; i++) {
      let newCell = table.rows[i].insertCell(-1);
      newCell.innerHTML = ' ';
      newCell.style.border = '1px solid black';
      newCell.style.padding = '5px';
    }
  }
}

function deleteRow() {
  let cell = getCaretNode();
  let row = findParent('tr', cell);
  if (row && row.parentNode.rows.length > 1) {
    row.parentNode.removeChild(row);
  }
}

function deleteColumn() {
  let cell = getCaretNode();
  let table = findParent('table', cell);
  if (table && table.rows[0].cells.length > 1) {
    let columnIndex = cell.cellIndex;
    for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].deleteCell(columnIndex);
    }
  }
}