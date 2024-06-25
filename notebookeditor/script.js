// Button for normal contenteditable
document.getElementById("add-mathlatex").addEventListener("click", function() {
  const input = document.getElementById("pagenumber");
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.textContent = "Math Textbox"; // Change this to your desired content
  span.className = "katexspan"
  span.setAttribute("nonkatexcontent", span.textContent)
  span.setAttribute("data-editing", false)

  // Make the span non-editable
  span.contentEditable = "false";

  if (!selection.isCollapsed) {
    range.deleteContents(); // Remove selection if present
  }
  range.insertNode(span);
});

document.addEventListener('focusout', mainFocusOut, true);
document.addEventListener('keydown', mainFocusOut, true);

function mainFocusOut(e) {
  var target = e.target || e.srcElement;

  // Check if the target is a contenteditable div
  if (target.isContentEditable) {
    for (var i = 0; i < target.childNodes.length; i++) {
      // Closure function to handle each individual text node
      (function(i) {
        var curNode = target.childNodes[i];
        if (curNode.nodeType === Node.TEXT_NODE && curNode.textContent.trim() !== "") {
          var element = document.createElement("div");
          element.appendChild(document.createTextNode(curNode.textContent));
          target.replaceChild(element, curNode);
        }
      })(i);
    }
  }
}


//Drag Logic for Images
document.body.addEventListener('paste', function(event) {
  var items = (event.clipboardData || event.originalMirror.clipboardData).items;
  for (var index in items) {
    var item = items[index];
    if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
      var blob = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
          var aspectRatio = img.width / img.height;
          var newWidth = aspectRatio >= 1 ? 100 : Math.min(100, img.width);
          var newHeight = aspectRatio >= 1 ? img.height / (img.width / 100) : 100;

          var imgElement = document.createElement('img');
          imgElement.src = event.target.result;
          imgElement.style.width = `${newWidth}px`;
          imgElement.style.height = `${newHeight}px`;
          imgElement.style.cssText = 'float: left;';
          imgElement.style.position = 'relative';
          imgElement.className = 'imgacontainer';
          imgElement.style.border = '1px solid black';
          imgElement.style.margin = '2px';
          if (sessionStorage.getItem('pdfTitle')) {
            imgElement.setAttribute('pdfTitle_name', sessionStorage.getItem('pdfTitle'));
          }
          if (sessionStorage.getItem('currentPaging')) {
            imgElement.setAttribute('pdfpage', sessionStorage.getItem('currentPaging'));
          }
          document.body.appendChild(imgElement);

          createContextMenu_forImages(imgElement);

          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          range.insertNode(imgElement);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(blob);
      event.preventDefault();

      // Clear the clipboard data
      navigator.clipboard.writeText('').then(function() {
        console.log('Clipboard cleared');
      }).catch(function(error) {
        console.error('Error clearing clipboard: ', error);
      });
    }
  }
});



function updateGhostDivPosition(ghostDiv, imgElement) {
  // Get the bounding rectangle of the image element
  const rect = imgElement.getBoundingClientRect();

  // Calculate the top and left positions including the window's scroll positions
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  // Set position and size
  ghostDiv.style.top = `${top}px`;
  ghostDiv.style.left = `${left}px`;
  ghostDiv.style.width = `${imgElement.offsetWidth}px`;
  ghostDiv.style.height = `${imgElement.offsetHeight}px`;
}




function addResizeHandles(imgElement, ghostDiv) {
  const edges = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  edges.forEach(edge => {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.id = `handle-${edge}`;
    // Position handles at the corners of the ghostDiv
    handle.style.position = 'absolute';
    handle.style.width = '10px';
    handle.style.height = '10px';
    handle.style.backgroundColor = 'blue';
    handle.style.cursor = `${edge.substring(0,3)}-resize`;

    // Adjust position based on edge
    switch (edge) {
      case 'top-left':
        handle.style.top = '0px';
        handle.style.left = '0px';
        handle.style.display = 'block';
        handle.style.zIndex = '9999';
        break;
      case 'top-right':
        handle.style.top = '0px';
        handle.style.right = '0px';
        handle.style.display = 'block';
        handle.style.zIndex = '9999';
        break;
      case 'bottom-left':
        handle.style.bottom = '0px';
        handle.style.left = '0px';
        handle.style.display = 'block';
        handle.style.zIndex = '9999';
        break;
      case 'bottom-right':
        handle.style.bottom = '0px';
        handle.style.right = '0px';
        handle.style.display = 'block';
        handle.style.zIndex = '9999';
        break;
    }

    ghostDiv.append(handle);
  handle.addEventListener('mousedown', function (e) { startResize(e, imgElement, ghostDiv); }); // Pass image directly
  });
}

function startResize(e, img, ghostDiv) {
  e.stopPropagation();
  let startX = e.clientX;
  let startY = e.clientY;

  function resize(e) {
    let newWidth = Math.max(20, img.width + (e.clientX - startX));
    let newHeight = Math.max(20, img.height + (e.clientY - startY));
    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;
    startX = e.clientX;
    startY = e.clientY;
    updateGhostDivPosition(ghostDiv, img); // Update position and size of ghostDiv
  }

  function stopResize() {
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
    ghostDiv.remove(); // Remove ghostDiv when resizing stops
  }

  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stopResize); // Pass the function reference, not the function call
  e.preventDefault();
}




function createContextMenu_forImages() {
  const menu = document.createElement('div');
  menu.id = 'context-menu_image';
  menu.style.position = 'absolute';
  menu.style.border = '1px solid black';
  menu.style.display = 'none';
  document.body.appendChild(menu);

  const deleteOption = document.createElement('div');
  deleteOption.innerText = 'Delete Image';
  deleteOption.classList.add("child")
  deleteOption.style.padding = '2.5px';
  deleteOption.style.cursor = 'pointer';
  deleteOption.addEventListener('click', () => {
    if (currentContainer) {
      currentContainer.remove();
      menu.style.display = 'none';
    }
  });

  const floatOption = document.createElement('div');
  floatOption.innerText = 'Toggle Float';
  floatOption.classList.add("child")
  floatOption.style.padding = '2.5px';
  floatOption.style.cursor = 'pointer';
  floatOption.addEventListener('click', () => {
    if (currentContainer) {
      const currentFloat = currentContainer.style.float;
      currentContainer.style.float = currentFloat === 'left' ? 'right' : 'left';
      currentContainer.style.left = '0px'; // Ensure the left position is 0
      adjustHandles(currentContainer); // Adjust handle positions
      menu.style.display = 'none';
    }
  });

  const gotoRefImg = document.createElement('div');
  
  // Context Menu Item for 'Go to Original PDF'
  gotoRefImg.innerText = 'Go to Original Pdf';
  gotoRefImg.classList.add("child");
  gotoRefImg.style.padding = '2.5px';
  gotoRefImg.style.cursor = 'pointer';
  gotoRefImg.addEventListener('click', () => {
    if (currentContainer) {
      alert(currentContainer.getAttribute('pdfpage'));
      let pdfTitle = currentContainer.getAttribute('pdfTitle_name'); // Ensure it uses sessionStorage to fetch the title
      window.parent.postMessage({
        type: 'referenceClicked',
        fullPath: pdfTitle,
        page: currentContainer.getAttribute('pdfpage')
      }, '*');
      menu.style.display = 'none';
    }
  });

  const toggleHandlers = document.createElement('div');

  // Context Menu Item for 'Go to Original PDF'
  toggleHandlers.innerText = 'Resize Image';
  toggleHandlers.classList.add("child");
  toggleHandlers.style.padding = '2.5px';
  toggleHandlers.style.cursor = 'pointer';
  toggleHandlers.addEventListener('click', () => {
    const ghostDiv = document.createElement("div");
    ghostDiv.classList.add("ghost-div");
    alert("Here is " + window.imgcontainer.classList);
      document.body.appendChild(ghostDiv);
    // Initial positioning
    updateGhostDivPosition(ghostDiv, window.imgcontainer);
    addResizeHandles(window.imgcontainer, ghostDiv);
  });


  menu.appendChild(deleteOption);
  menu.appendChild(floatOption);
  menu.appendChild(gotoRefImg);
  menu.appendChild(toggleHandlers);

  window.addEventListener('click', () => {
    menu.style.display = 'none';
  });

  window.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.imgacontainer')) {
      e.preventDefault();
      currentContainer = e.target.closest('.imgacontainer');
      menu.style.top = `${e.clientY + window.scrollY}px`; // Add scrollY to the clientY
      menu.style.left = `${e.clientX + window.scrollX}px`; // Add scrollX to the clientX
      menu.style.display = 'block';
      window.imgcontainer = currentContainer;
    } else {
      menu.style.display = 'none';
      window.imgcontainer = null;
    }
  });

}


document.addEventListener('DOMContentLoaded', function() {
  createContextMenu_forImages();
});


// Function to only remove empty divs
function removeEmptyDivs() {
  const divs = document.querySelectorAll('div');
  divs.forEach(div => {
    if (!div.classList.contains('tab-indicator') && div.getAttribute('data-irremovable') !== 'true' && div.innerHTML.trim() === '' && !div.classList.contains('resize-handle') && !div.classList.contains('ghost-div')) {
      div.remove();
    }
  });
}

// Continue to remove empty divs periodically
setInterval(removeEmptyDivs, 1000);



