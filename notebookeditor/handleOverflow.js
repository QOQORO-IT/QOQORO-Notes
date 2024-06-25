document.addEventListener("DOMContentLoaded", function() {
    // Set an interval to regularly check for overflow
    setInterval(handleOverflow_img, 200); // Adjusted comment: checks every 2000 milliseconds (2 seconds)
});

function getDivIdNumber(divId) {
  return parseInt(divId.replace('pagenumber', ''), 10);
}


function extractDivNumbering(divid) {
    const numberString = [...divid].reduce((acc, char) => (/\d/.test(char) ? acc + char : acc), "");
    let number = parseInt(numberString, 10);
    number = number + 1;
    console.log("ini dia", number);
    return number;
}

function isCaretAfterLastChildDiv(event) {
  const div = event.target;
  const lastChild = div.lastElementChild;
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const endContainer = range.endContainer;

    // Check if the selection ends inside the container
    if (commonAncestor === div || div.contains(commonAncestor)) {
      // Check if the cursor is at the end of the last child or after it
      if (endContainer === lastChild) {
        if (range.endOffset === lastChild.textContent.length) {
          checkLastChildNearBottom(div);
        }
      } else if (endContainer.nodeType === Node.TEXT_NODE && endContainer.parentNode === lastChild) {
        if (range.endOffset === endContainer.textContent.length) {
          checkLastChildNearBottom(div);
        }
      }
    }
  }
}

function isCaretBeforeLastChildDiv(event) {
  const div = event.target;
  const lastChild = div.lastElementChild;
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const startContainer = range.startContainer;

    // Check if the selection starts inside the container
    if (commonAncestor === div || div.contains(commonAncestor)) {
      // Check if the cursor is at the beginning of the last child or before it
      if (startContainer === lastChild) {
        if (range.startOffset === 0) {
          checkLastChildNearBottom(div, "before");
        }
      } else if (startContainer.nodeType === Node.TEXT_NODE && startContainer.parentNode === lastChild) {
        if (range.startOffset === 0) {
          checkLastChildNearBottom(div, "before");
        }
      }
    }
  }
}

function Moveto_NextDivMerged() {
    console.log("Prep for moving to next Div Merged Improved!");

  // Handle selection if available
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let potentialContainers = []; // Array to hold potential containers

  // Iterate through the descendants of the current selection
  (function traverse(node) {
    if (node.nodeType === Node.ELEMENT_NODE) { // Only interested in Element nodes
      if (node.id.startsWith('pagenumber')) { // Found a potential container
        potentialContainers.push(node);
      }
      // Recursively traverse child nodes
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
      }
    }
  })(range.commonAncestorContainer);

  if (potentialContainers.length > 0) {
    // Choose the most recent container (assuming the last one is the closest to the selection)
    let divdel = potentialContainers[potentialContainers.length - 1];
    function removeBrTagsAndReturnModifiedDiv(targetDivId) {
      // Ensure the targetDivId exists
      const targetDiv = document.getElementById(targetDivId);
      if (!targetDiv) return null;
    
      // Clone the target div to work with a copy instead of the actual DOM element
      const clonedDiv = targetDiv.cloneNode(true);
    
      // Select all children of the cloned div
      const children = clonedDiv.children;
      
      // Iterate over each child
      for (let i = children.length - 1; i >= 0; i--) { // Start from the end to avoid issues with changing indices during iteration
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
    divdel = removeBrTagsAndReturnModifiedDiv(divdel);
    console.log("Selected container for operation:", divdel.id);

    const divdelId = getDivIdNumber(divdel.id); // Assuming this function exists and works similarly in both original functions
    const nextDivId = divdelId + 1;
    const nextDiv = document.getElementById(`pagenumber${nextDivId}`);

    if (nextDiv) {
      moveContentToNextDiv(divdel, nextDiv); // Assuming this function exists and works similarly in both original functions
    } else {
      console.log("Next div not found. Creating new page.");
      document.getElementById("add-newPage").click();
      setTimeout(() => {
        const newNextDiv = document.getElementById(`pagenumber${nextDivId}`);
        if (newNextDiv) {
          console.log("New page created:", newNextDiv.id);
          moveContentToNextDiv(divdel, newNextDiv); // Adjusted to remove childElement parameter as it's not needed here
        } else {
          console.error("Failed to create new page");
        }
      }, 100);
    }

    // Listen for Enter key to trigger the movement
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        Moveto_NextDivMergedImproved(); // Call the improved merged function again on Enter key
      }
    });
  } else {
    console.error("No suitable container found for operation.");
  }
}


function checkLastChildNearBottom(div, position = "after") {
  // Calculate divBottom outside the loop to ensure it's accessible
  const divRect = div.getBoundingClientRect();
  const divBottom = divRect.bottom;

  // Define variables outside the loop to ensure they are accessible
  const divStyle = window.getComputedStyle(div);
  const divFontSize = parseFloat(divStyle.fontSize);
  const divPaddingBottom = parseFloat(divStyle.paddingBottom);

  // Iterate over all children of the div
  for (let i = 0; i < div.children.length; i++) {
    let child = div.children[i];

    // Check if the current child is the last child of the div
    if (child === div.lastElementChild || (child.tagName.toLowerCase() === 'br' && i === div.children.length - 1)) {
      // Get computed styles for the current child
      const childStyle = window.getComputedStyle(child);
      const childFontSize = parseFloat(childStyle.fontSize);
      const childMarginBottom = parseFloat(childStyle.marginBottom);

      // Calculate positions
      const childBottom = child.getBoundingClientRect().bottom;

      // Calculate the dynamic threshold for the current child
      const threshold = divFontSize * 0.5 + childFontSize * 0.5 + divPaddingBottom + childMarginBottom;

      if (child.tagName.toLowerCase() == 'br' && !child.hasContent()) {
        child.remove(); // Remove the empty tag from the DOM
    }

      if (divBottom - childBottom <= threshold) {
        if (position === "after") {
          console.log("Caret is after the very last child div and it's near the bottom border of the parent div.");
          document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
              Moveto_NextDivMerged(event);
            }
            document.removeEventListener('keydown', arguments.callee);
          });
        } else {
          
          console.log("Caret is before the very last child div and it's near the bottom border of the parent div.");
          
          document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
              Moveto_NextDivMerged(event);
            }
            document.removeEventListener('keydown', arguments.callee);
          });
        }
        break; // Exit the loop once we've found a matching child
      }
    }
  }
}


// Function to check and attach event listeners to all '.pagebook' divs
function setupEventListeners() {
  document.querySelectorAll('.pagebook').forEach(div => {
      // Check if the div already has event listeners attached
      if (!div.dataset.listenersAdded) {
          // Add event listeners
          div.addEventListener('keyup', isCaretAfterLastChildDiv);
          div.addEventListener('keyup', isCaretBeforeLastChildDiv);
          div.addEventListener('click', isCaretAfterLastChildDiv);
          div.addEventListener('click', isCaretBeforeLastChildDiv);
          setInterval(handleOverflow, 200);

          // Mark this div as having listeners added
          div.dataset.listenersAdded = "true";
      }
  });
}

// Interval to check and attach event listeners every 100 milliseconds (1 second)
setInterval(setupEventListeners, 100);


function handleOverflow() {
    const containers = document.querySelectorAll('.pagebook');
    containers.forEach(container => {
        const containerBottom = container.getBoundingClientRect().bottom;
        const children = container.querySelectorAll('div, span'); // Query for div and span only.

        let overflowDetected = false;
        for (const child of children) {
            const childBottom = child.getBoundingClientRect().bottom;
            if (childBottom > containerBottom) {
                overflowDetected = true;
                let divdel = child;

                // Traverse up to find an element with id starting with 'pagenumber'
                while (divdel && !divdel.id.startsWith('pagenumber')) {
                    divdel = divdel.parentNode;
                }

                if (divdel) {
                    const divdelId = extractDivNumbering(divdel.id);
                    const nextDivId = divdelId + 1; // Increment the ID for the next div
                    const nextDiv = document.getElementById(`pagenumber${nextDivId}`);

                    if (nextDiv) {
                        nextDiv.innerHTML = child.outerHTML + nextDiv.innerHTML; // Append child HTML to nextDiv
                        child.remove(); // Remove the child from the current container
                    } else {
                        console.log(`No next pagenumber${nextDivId} found. Attempting to create new page.`);
                        // Trigger the creation of a new page
                        document.getElementById("add-newPage").click();

                        // Delay the retrieval of the new div to ensure it has been added to the DOM
                        setTimeout(() => {
                            const newDiv = document.getElementById(`pagenumber${nextDivId}`);
                            if (newDiv) {
                                newDiv.innerHTML = child.outerHTML + newDiv.innerHTML;
                                child.remove(); // Remove the child from the current container
                            } else {
                                console.error("Failed to create or retrieve the new page.");
                            }
                        }, 100); // Adjust delay based on expected DOM update timing
                    }
                }
                break; // Stop the loop after handling the first overflow condition
            }
        }

        if (overflowDetected) {
            console.log('Overflow detected and handled.');
        }
    });
}

// Helper function to extract div numbering from an ID
function extractDivNumbering(id) {
    return parseInt(id.replace(/^\D+/g, ''), 10);
}


function handleOverflow_img() {
  const containers = document.querySelectorAll('.pagebook');
  for (const container of containers) {
      const containerBottom = container.getBoundingClientRect().bottom;
      const images = container.querySelectorAll('img'); // Focus on img tags

      let overflowDetected = false;
      for (const img of images) {
          const imgTop = img.getBoundingClientRect().top;
          if (imgTop >= containerBottom) { // Check if the top of the img touches or exceeds the bottom of the container
              overflowDetected = true;
              let divdel = img; // Initialize divdel with the current img

              // Traverse up to find an element with id starting with 'pagenumber'
              while (divdel && !divdel.id.startsWith('pagenumber')) {
                  divdel = divdel.parentNode;
              }

              if (divdel) {
                  const divdelId = extractDivNumbering(divdel.id);
                  const nextDivId = divdelId + 1; // Correct incrementing to point to the next container
                  const nextDiv = document.getElementById(`pagenumber${nextDivId}`);

                  if (nextDiv) {
                      nextDiv.innerHTML = img.outerHTML + nextDiv.innerHTML; // Move the img to the next div using innerHTML
                      img.remove(); // Remove the img from the current container
                      console.log(`Moved image to ${nextDiv.id}.`);
                  } else {
                      console.log(`No next pagenumber${nextDivId} found. Attempting to create new page.`);
                      // Trigger the creation of a new page
                      document.getElementById("add-newPage").click();

                      // Delay the retrieval of the new div to ensure it has been added to the DOM
                      setTimeout(() => {
                          const newDiv = document.getElementById(`pagenumber${nextDivId}`);
                          if (newDiv) {
                              newDiv.innerHTML = " " + img.outerHTML + newDiv.innerHTML;
                              img.remove(); // Remove the img from the current container
                              console.log(`Moved image to ${newDiv.id}.`);
                          } else {
                              console.error("Failed to create or retrieve the new page.");
                          }
                      }, 100); // Adjust delay based on expected DOM update timing
                  }
              }
              break; // Stop the loop after handling the first overflow condition
          }
      }

      if (overflowDetected) {
          console.log('Overflow detected and handled for images.');
      }
  }
}

// Helper function to extract div numbering from an ID
function extractDivNumbering(id) {
  return parseInt(id.replace(/^\D+/g, ''), 10);
}
