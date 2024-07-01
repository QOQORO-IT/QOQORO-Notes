// Utility functions
function getDivIdNumber(divId) {
  return parseInt(divId.replace('pagenumber', ''), 10);
}

function getPagebookContainer(node) {
  while (node && node !== document.body) {
    if (node.classList && node.classList.contains('pagebook')) {
      return node;
    }
    node = node.parentNode;
  }
  return null; // Return null if no pagebook container is found
}

// Caret position detection
function isCaretAtStart(node) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  return range.startOffset === 0 && range.collapsed;
}

function isCaretBeforeFirstChildDiv() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const container = getPagebookContainer(range.startContainer);
  if (!container) return false;

  const firstDiv = container.querySelector('div');
  if (!firstDiv) return false;

  let node = range.startContainer;
  while (node && node !== firstDiv) {
    if (!isCaretAtStart(node)) return false;
    node = node.parentNode;
  }

  return node === firstDiv;
}

// Event handlers
function handleBackspaceDelete(event) {
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault();
    moveContentToPreviousPage();
  }
}

function moveContentToPreviousPage() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const currentPage = getPagebookContainer(selection.anchorNode);
  if (!currentPage) return;

  const prevPageId = getDivIdNumber(currentPage.id) - 1;
  const prevPage = document.getElementById(`pagenumber${prevPageId}`);
  if (!prevPage) return;

  const firstChild = currentPage.firstElementChild;
  if (firstChild) {
    if (prevPage.lastElementChild) {
      prevPage.lastElementChild.outerHTML += firstChild.outerHTML;
    } else {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = firstChild.innerHTML;
      newDiv.className = 'listener-added';
      prevPage.appendChild(newDiv);
    }
    currentPage.removeChild(firstChild);
  }

  if (currentPage.innerHTML.trim() === "") {
    currentPage.parentNode.removeChild(currentPage);
  }

  // Move caret to end of previous page
  const range = document.createRange();
  range.selectNodeContents(prevPage.lastElementChild || prevPage);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);

  reOrderDivs();
}

// Mutation observer setup
function setUpMutationObserver() {
  const container = document.querySelector('#MainContainer');
  if (!container) {
    console.error('Main container not found');
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('pagebook')) {
          attachEventListeners(node);
        }
      });
    });
  });

  observer.observe(container, { childList: true, subtree: true });
}

// Event listener attachment
function attachEventListeners(element) {
  element.removeEventListener('keyup', checkCaretPosition);
  element.removeEventListener('click', checkCaretPosition);
  element.addEventListener('keyup', checkCaretPosition);
  element.addEventListener('click', checkCaretPosition);
}

function checkCaretPosition() {
  if (isCaretBeforeFirstChildDiv()) {
    document.addEventListener('keydown', handleBackspaceDelete, { once: true });
  }
}

// Initialization
function initializeUnderflow() {
  document.querySelectorAll('.pagebook').forEach(attachEventListeners);
  setUpMutationObserver();
}

// Reordering divs
function reOrderDivs() {
  document.querySelectorAll('.pagebook').forEach((element, index) => {
    element.id = `pagenumber${index + 1}`;
  });
}

// Ctrl+A and Backspace handling
function setUpGlobalEventListeners() {
  let lastKeyDown = null;
  let lastFocusedDiv = null;

  document.addEventListener('keydown', function(event) {
    if (event.target.getAttribute('contenteditable') === 'true') {
      lastFocusedDiv = event.target;
    }

    if (event.key === 'a' && event.ctrlKey) {
      lastKeyDown = 'Ctrl+A';
    } else if (event.key === 'Backspace' && lastKeyDown === 'Ctrl+A') {
      if (lastFocusedDiv) {
        deletePageContainingDiv(lastFocusedDiv);
      }
      lastKeyDown = null;
    } else {
      lastKeyDown = null;
    }
  });
}

function deletePageContainingDiv(div) {
  const pagebook = getPagebookContainer(div);
  if (pagebook) {
    const nextPage = pagebook.nextElementSibling;
    pagebook.parentNode.removeChild(pagebook);
    if (nextPage) {
      const range = document.createRange();
      range.selectNodeContents(nextPage);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    reOrderDivs();
  }
}

// Main initialization
window.addEventListener('DOMContentLoaded', () => {
  setUpGlobalEventListeners();
  initializeUnderflow();
});