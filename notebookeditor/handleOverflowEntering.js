function checkLastChildNearBottomSimple(div, offset = 10) {
  const containerBottom = div.getBoundingClientRect().bottom;
  const children = div.querySelectorAll('div, span');

  for (const child of children) {
      const childBottom = child.getBoundingClientRect().bottom;
      if (childBottom > containerBottom - offset) {
          console.log("See", child);
          console.log("A child element is near or beyond the bottom border of the parent div.");
          child.innerHTML = child.innerHTML.replace(/<br\s*\/?>/gi, ''); // Remove <br> tags
          window.child = child;
          window.div = div;
          window.triggered = "yes";
          break;
      }
  }
}

function Moveto_NextDiv(childElement, containerDiv) {
  console.log("Prep for moving to next Div!");
  console.log("Child element to move:", childElement);

  let divdel = containerDiv;

  if (!divdel || !divdel.id.startsWith('pagenumber')) {
      console.error("Could not find parent div with 'pagenumber' id");
      return;
  }

  console.log("get Divdel", divdel.id);

  const divdelId = getDivIdNumber(divdel.id);
  const nextDivId = divdelId + 1;
  const nextDiv = document.getElementById(`pagenumber${nextDivId}`);

  if (nextDiv) {
      console.log("Next div found:", nextDiv.id);
      moveContentToNextDiv(divdel, nextDiv, childElement);
  } else {
      console.log("Next div not found. Creating new page.");
      document.getElementById("add-newPage").click();
      setTimeout(() => {
          const newNextDiv = document.getElementById(`pagenumber${nextDivId}`);
          if (newNextDiv) {
              console.log("New page created:", newNextDiv.id);
              moveContentToNextDiv(divdel, newNextDiv, childElement);
          } else {
              console.error("Failed to create new page");
          }
      }, 100);
  }
}

function moveContentToNextDiv(currentDiv, nextDiv, childElement) {
  console.log("Moving content to next div");
  console.log("Current div:", currentDiv.id);
  console.log("Next div:", nextDiv.id);
  console.log("Child element to move:", childElement);

  const firstChildNextDiv = nextDiv.firstElementChild;

  if (childElement && firstChildNextDiv) {
      console.log("First child of next div:", firstChildNextDiv);

      // Move the child element and all its following siblings
      nextDiv.innerHTML = childElement.outerHTML + '<br>' + nextDiv.innerHTML;
      childElement.remove();

      // Remove any leading <br> tags from the first child of the next div
      while (firstChildNextDiv.firstChild && firstChildNextDiv.firstChild.nodeName === 'BR') {
          console.log("Removing BR tag");
          firstChildNextDiv.removeChild(firstChildNextDiv.firstChild);
      }

      // nextDiv.focus();
      // console.log("Focus set on next div");

      if (currentDiv.innerHTML.trim() === "") {
          console.log("Removing empty current div");
          currentDiv.parentNode.removeChild(currentDiv);
      }
  } else {
      console.error("Could not move content: childElement or firstChildNextDiv is null");
      console.log("childElement:", childElement);
      console.log("firstChildNextDiv:", firstChildNextDiv);
  }
}

function getDivIdNumber(divId) {
  return parseInt(divId.replace('pagenumber', ''), 10);
}

let shouldProceed = false; // Global variable to control script execution

// Function to setup Enter key listener
function waitForEnterKey() {
  window.addEventListener('keydown', function(event) {
      if (event.keyCode === 13) { // 13 is the keyCode for Enter key
          shouldProceed = true;
          console.log("Enter key pressed, proceeding with script...");
          if (window.triggered == "yes") {
              // Check if the child is not a 'div' and is empty
              if (window.child.tagName.toLowerCase() == 'br' && !window.child.hasContent()) {
                  window.child.remove(); // Remove the empty tag from the DOM
              }

              if (window.child.innerHTML == "" || window.child.innerHTML == null) {
                  return
              }
              Moveto_NextDiv(window.child, window.div)
              window.triggered = "no";
          }
      }
  });
}

// Modified setInterval functions to check conditions before executing
function checkAllPagebooksSimple() {
  if (shouldProceed) {
      const pagebooks = document.querySelectorAll(".pagebook");
      pagebooks.forEach(pagebook => checkLastChildNearBottomSimple(pagebook));
      shouldProceed = false; // Reset flag after execution
  }
}

function removeEmptyDivs() {
  if (shouldProceed) {
      const divs = document.querySelectorAll('div');
      divs.forEach(div => {
          if (!div.classList.contains('tab-indicator') && div.getAttribute('data-irremovable') !== 'true' && div.innerHTML.trim() === '' && !div.classList.contains('resize-handle')) {
              console.log("Removing empty div:", div);
              div.remove();
          }
      });
      shouldProceed = false; // Reset flag after execution
  }
}

// Setup Enter key listener when the script loads
waitForEnterKey();

// Adjusted intervals
setInterval(checkAllPagebooksSimple, 1000); // Adjust the interval time as needed
setInterval(removeEmptyDivs, 1000); // Remove empty divs every 1 second
