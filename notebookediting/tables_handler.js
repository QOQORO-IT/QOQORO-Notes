document.addEventListener('DOMContentLoaded', function() {
  const editor = document.getElementById('MainContainer');

  editor.addEventListener('keydown', function(event) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
          const cell = getCaretNode();
          if (cell.tagName === 'TD') {
              const selection = window.getSelection();
              if (selection.toString() === cell.textContent) {
                  event.preventDefault();
                  cell.innerHTML = ''; // Clear the cell content
              }
          }
      }
  });
});

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
  let tr = table.insertRow(-1);
  for (let i = 0; i < 3; i++) {
      let td = tr.insertCell(-1);
      td.innerHTML = 'Cell';
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
          newCell.innerHTML = 'New cell';
      }
  }
}

function addColumn() {
  let cell = getCaretNode();
  let table = findParent('table', cell);
  if (table) {
      for (let i = 0; i < table.rows.length; i++) {
          let newCell = table.rows[i].insertCell(-1);
          newCell.innerHTML = 'New cell';
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
