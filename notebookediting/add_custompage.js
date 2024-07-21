// Global modal for all custom pages
let globalCustompageModal;

// Create global modal
function createGlobalModal() {
  if (!globalCustompageModal) {
    globalCustompageModal = document.createElement('div');
    globalCustompageModal.className = 'custompage_modal';
    globalCustompageModal.innerHTML = `
      <div class="custompage_modal-content">
        <span class="custompage_modal-close">&times;</span>
        <textarea id="custompage-editor"></textarea>
        <button id="save-custompage">Save Changes</button>
      </div>
    `;
    document.body.appendChild(globalCustompageModal);

    const closeBtn = globalCustompageModal.querySelector('.custompage_modal-close');
    closeBtn.onclick = closeCustompageModal;

    // Close the modal if the user clicks outside of it
    window.onclick = function(event) {
      if (event.target == globalCustompageModal) {
        closeCustompageModal();
      }
    };
  }
}

// Global function to find the nearest parent with a specific class
function findNearestParentWithClass(element, className) {
  while (element && !element.classList.contains(className)) {
    element = element.parentElement;
  }
  return element;
}

// Global function to reload custom page
function reloadCustompage(button) {
  const customPageMain = findNearestParentWithClass(button, 'custompage-main');
  if (customPageMain) {
    const custompage = customPageMain.querySelector('.custompage');
    const content = custompage.innerHTML;
    custompage.innerHTML = content;
    // Assuming CustomScript_init is defined within the .custompage div
    const initScript = custompage.querySelector('script');
    if (initScript) {
      eval(initScript.textContent);
    }
  }
}

// Global function to edit custom page
function editCustompage(button) {
  const customPageMain = findNearestParentWithClass(button, 'custompage-main');
  if (customPageMain) {
    const custompage = customPageMain.querySelector('.custompage');
    const editor = globalCustompageModal.querySelector('#custompage-editor');
    editor.value = custompage.innerHTML;
    globalCustompageModal.style.display = 'block';

    const saveBtn = globalCustompageModal.querySelector('#save-custompage');
    saveBtn.onclick = function () {
      custompage.innerHTML = editor.value;
      closeCustompageModal();
      // Re-run the init script
      const initScript = custompage.querySelector('script');
      if (initScript) {
        eval(initScript.textContent);
      }
    };
  }
}

// Global function to close custom page modal
function closeCustompageModal() {
  if (globalCustompageModal) {
    globalCustompageModal.style.display = 'none';
  }
}

// Function to create a new custom page
function createNewCustomPage() {
  const newPage = document.createElement('div');
  const pagebookElements = document.querySelectorAll('.custompage-main');
  const newId = `pagenumber${pagebookElements.length + 1}`;
  let Container = document.getElementById('MainContainer');

  newPage.id = newId;
  newPage.className = 'custompage-main';
  newPage.innerHTML = `
    <button class="custompage_button" onclick="reloadCustompage(this)">Reload Custompage</button>
    <button onclick="editCustompage(this)">Edit Custompage</button>
    <div class="custompage">
    <body>
      <div>This is custom page you can edit and run javascript inside</div>

      <script>
        function CustomScript_init() {
          console.log('CustomScript initialized for ${newId}');
        };
        // Initial initialization
        CustomScript_init();
      <\/script>
    </div>
    </body>
  `;

  Container.appendChild(newPage);
  reOrderDivs();
}

// Event listener for adding a new custom page
document.getElementById('add-customPage').addEventListener('click', createNewCustomPage);

// Function to reorder divs (unchanged from your original code)
function reOrderDivs() {
  const pagebookElements = document.querySelectorAll('.pagebook');
  pagebookElements.forEach((element, index) => {
    element.id = `pagenumber${index + 1}`;
  });
}

// Add global styles
function addGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .custompage_button { margin: 3px; }
    .custompage-main { background-color: white; border: 1px solid black; }
    .custompage { margin: 3px; border: 1px dashed black; }
    .custompage_modal {
      display: none; position: fixed; z-index: 1000; left: 0; top: 0;
      width: 100%; height: 100%; overflow: auto;
      background-color: rgba(0, 0, 0, 0.4);
    }
    .custompage_modal-content {
      background-color: #fefefe; margin: 15% auto; padding: 20px;
      border: 1px solid #888; width: 80%; max-width: 800px;
    }
    .custompage_modal-close {
      color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;
    }
    .custompage_modal-close:hover, .custompage_modal-close:focus {
      color: #000; text-decoration: none; cursor: pointer;
    }
    #custompage-editor { width: 100%; height: 300px; margin-bottom: 10px; }
  `;
  document.head.appendChild(style);
}

// Initialize everything
function init() {
  createGlobalModal();
  addGlobalStyles();
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Create a context menu
let contextMenu = null;

function createContextMenu() {
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }
    contextMenu = document.createElement('div');
    contextMenu.id = 'customPageContextMenu';
    contextMenu.style.cssText = `
        position: absolute;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        padding: 5px 0;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(contextMenu);
}

function addContextMenuOption(text, callback) {
    const option = document.createElement('div');
    option.textContent = text;
    option.style.cssText = `
        padding: 5px 20px;
        cursor: pointer;
    `;
    option.addEventListener('click', callback);
    contextMenu.appendChild(option);
}

function deleteCustomPage(customPage) {
    if (!customPage) return;
    if (confirm('Are you sure you want to delete this custom page?')) {
        customPage.remove();
    }
}

function showContextMenu(e, customPage) {
    e.preventDefault();
    createContextMenu();
    addContextMenuOption('Move Upwards', () => movePageUpwards(customPage));
    addContextMenuOption('Move Downwards', () => movePageDownwards(customPage));
    addContextMenuOption('Delete', () => deleteCustomPage(customPage));

    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function movePageUpwards(customPage) {
    if (!customPage) return;

    const mainContainer = document.getElementById('MainContainer');
    let previousSibling = customPage.previousElementSibling;

    while (previousSibling) {
        if (previousSibling.classList.contains('custompage-main') || 
            previousSibling.classList.contains('pagebook')) {
            mainContainer.insertBefore(customPage, previousSibling);
            break;
        }
        previousSibling = previousSibling.previousElementSibling;
    }
}

function movePageDownwards(customPage) {
    if (!customPage) return;

    const mainContainer = document.getElementById('MainContainer');
    let nextSibling = customPage.nextElementSibling;

    while (nextSibling) {
        if (nextSibling.classList.contains('custompage-main') || 
            nextSibling.classList.contains('pagebook')) {
            mainContainer.insertBefore(customPage, nextSibling.nextElementSibling);
            break;
        }
        nextSibling = nextSibling.nextElementSibling;
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('MainContainer');

    mainContainer.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('custompage-main')) {
            showContextMenu(e, e.target);
        }
    });

    document.addEventListener('click', hideContextMenu);
});