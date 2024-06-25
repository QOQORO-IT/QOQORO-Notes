function getDivIdNumber(divId) {
  return parseInt(divId.replace('pagenumber', ''), 10);
}

function isCaretBeforeFirstChildDiv() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let startContainer = range.startContainer;

  // Find the container with id starting with 'pagenumber'
  let container = startContainer;
  while (container && container !== document.body) {
    if (container.id && container.id.startsWith('pagenumber')) {
      break;
    }
    container = container.parentNode;
  }

  // If we didn't find a container with 'pagenumber' id, exit the function
  if (!container || container === document.body) {
    console.log("No container with 'pagenumber' id found");
    return;
  }

  // Find the first div child
  const firstDiv = container.querySelector('div');

  if (firstDiv) {
    // Function to check if we're at the start of an element
    const isAtStartOfElement = (node) => {
      return (node.nodeType === Node.ELEMENT_NODE && range.startOffset === 0) ||
             (node.nodeType === Node.TEXT_NODE && range.startOffset === 0 && 
              (!node.previousSibling || node.previousSibling.nodeType === Node.ELEMENT_NODE));
    };

    // Traverse up from the startContainer to check if we're at the start
    let currentNode = startContainer;
    while (currentNode && currentNode !== firstDiv) {
      if (isAtStartOfElement(currentNode)) {
        currentNode = currentNode.parentNode;
      } else {
        // We're not at the start of this element, so we're not at the very beginning
        return;
      }
    }

    // If we've made it here, we're at the start of the first div
    console.log("Caret is in the very first child div.");
    document.addEventListener('keydown', handleBackspaceDelete);
  }
}

function checkAndWrap(container) {
  const nodes = container.childNodes;
  Array.from(nodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE || (node.nodeName === 'BR' && (!node.parentNode || node.parentNode.className !== 'listener-added'))) {
      const newDiv = document.createElement('div');
      if (node.nodeName.toLowerCase() === 'br') {
        // Remove the BR tag from the DOM
        node.nodeName.remove();
      }
      newDiv.appendChild(node.cloneNode(true));
      container.replaceChild(newDiv, node);
    }
  });
}

function getDivIdNumber(id) {
  return id.replace('pagenumber', '');
}


function handleBackspaceDelete(event) {
  if (event.key === 'Backspace' || event.key === "Delete") {
    Moveto_PrevDiv(event);
  }
  document.removeEventListener('keydown', handleBackspaceDelete);
}

//Crucial Part!!
function setUpMutationObserverUnderflow() {
  const container = document.querySelector('#MainContainer'); // Ensure this selector matches your container
  if (!container) {
    console.error('The container does not exist.');
    return; // Stop the function if the container isn't found
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

  const config = {
    childList: true,
    subtree: true
  };

  observer.observe(container, config);
}

function attachEventListeners(element) {
  element.removeEventListener('keyup', isCaretBeforeFirstChildDiv); // Remove to prevent duplicates
  element.removeEventListener('click', isCaretBeforeFirstChildDiv);
  element.addEventListener('keyup', isCaretBeforeFirstChildDiv);
  element.addEventListener('click', isCaretBeforeFirstChildDiv);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeUnderflow();
});

function initializeUnderflow() {
  const pagebookElements = document.querySelectorAll('.pagebook');
  pagebookElements.forEach(element => {
    attachEventListeners(element);
  });

  setUpMutationObserverUnderflow();
}


function Moveto_PrevDiv(event) {
  console.log("Check for moving to prev Div!");
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;

  let divdel = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentNode : startContainer;
  while (divdel && !divdel.id.startsWith('pagenumber')) {
    divdel = divdel.parentNode;
  }

  if (divdel) {
    const divdelId = getDivIdNumber(divdel.id);
    const prevDivId = divdelId - 1;
    const prevDiv = document.getElementById(`pagenumber${prevDivId}`);

    if (divdel.innerHTML === "" || divdel.innerHTML === "<div><br></div>") {
      console.log("Empty div detected!")
      const nextDivId = divdelId + 1;
      let nextDiv = document.getElementById(`pagenumber${nextDivId}`);
      console.log(`Here ${divdelId}`)
      try {
        nextDiv.id = `pagenumber${divdelId}`;
      } catch(e) {
        divdelId = divdelId - 1
        nextDiv.id = `pagenumber${divdelId}`;
      }
      
      divdel.parentNode.removeChild(divdel);
    } else {
      const firstChild = divdel.firstElementChild;
      if (firstChild || firstChild.classList.contains('listener-added')) {
        if (prevDiv) {
          // Move the content of the first child to the previous div
          if (prevDiv.lastElementChild) {
            prevDiv.lastElementChild.innerHTML += firstChild.innerHTML;
          } else {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = firstChild.innerHTML;
            newDiv.className = 'listener-added';
            
            function removeBrTagsAndReturnModifiedDiv(targetDivId) {
              // Ensure the targetDivId exists
              const targetDiv = document.getElementById(targetDivId);
              if (!targetDiv) return null;
            
              // Clone the target div to work with a copy instead of the actual DOM element
              const clonedDiv = targetDiv.cloneNode(true);
            
              // Select all children of the cloned div
              const children = clonedDiv.children;
              
              // Iterate over each child
              for (let i = children.length; i >= 0; i--) { // Start from the end to avoid issues with changing indices during iteration
                const child = children[i];
                
                // Check if the child is a <br> tag
                if (child.tagName.toLowerCase() === 'br') {
                  // Remove the <br> tag from the cloned DOM
                  child.remove();
                }
              }
            
              // Return the modified cloned div
              return clonedDiv;
            }
            
            // Example usage
            newDiv = removeBrTagsAndReturnModifiedDiv(newDiv);
            
            prevDiv.appendChild(newDiv);
          }

          // Remove the first child from the current div
          divdel.removeChild(firstChild);

          // If the current div is now empty, remove it
          if (divdel.innerHTML.trim() === "") {
            divdel.parentNode.removeChild(divdel);
          }

          // Move the caret to the end of the previous div
          const newRange = document.createRange();
          newRange.selectNodeContents(prevDiv.lastElementChild);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    reOrderDivs();
  }
}

function setUpEventListeners() {
  let lastKeyDown = null;
  let lastFocusedDiv = null;

  document.addEventListener('keydown', function(event) {
    // Track the last focused div on keydown
    if (event.target.getAttribute('contenteditable') === 'true') {
      lastFocusedDiv = event.target;
    }

    // Detect Ctrl+A
    if (event.key === 'a' && event.ctrlKey) {
      lastKeyDown = 'Ctrl+A';
    } 
    // If Backspace is pressed after Ctrl+A
    else if (event.key === 'Backspace' && lastKeyDown === 'Ctrl+A') {
      if (lastFocusedDiv) {
        deletePageContainingDiv(lastFocusedDiv);
      }
      lastKeyDown = null; // Reset after handling
    } 
    else {
      lastKeyDown = null; // Reset if any other key is pressed in between
    }
  });
}

function deletePageContainingDiv(div) {
  // Traverse up to find the parent div that matches the id pattern 'pagenumber'
  while (div && !div.id.startsWith('pagenumber')) {
    div = div.parentNode;
  }

  if (div) {
    const nextPage = div.nextElementSibling;
    div.parentNode.removeChild(div);
    if (nextPage) {
      // Focus on the next page
      let range = new Range();
      range.selectNodeContents(nextPage);
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    reOrderDivs();  // Reorder div IDs after deletion
  }
}

function reOrderDivs() {
  const pagebookElements = document.querySelectorAll('.pagebook');
  pagebookElements.forEach((element, index) => {
    element.id = `pagenumber${index + 1}`;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setUpEventListeners();
  initializeUnderflow();
});
