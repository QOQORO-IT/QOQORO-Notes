// Define a custom event for content loaded
const contentLoadedEvent = new Event('customContentLoaded');

// Function to load saved content from a file
function loadSavedContent() {
  const fileUpload = document.getElementById('fileUpload');
  const file = fileUpload.files[0];
  const oldContainer = document.querySelector('.MainContainer');
  if (file) {
    const reader = new FileReader();
    oldContainer.innerHTML = "";
    reader.onload = function(e) {
      const content = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const mainContainer = doc.querySelector('.MainContainer');
      if (mainContainer) {
        oldContainer.innerHTML = mainContainer.innerHTML;

        // Execute all scripts
        const scripts = oldContainer.getElementsByTagName('script');
        Array.from(scripts).forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Dispatch the custom event
        document.dispatchEvent(contentLoadedEvent);
      } else {
        console.warn("The uploaded HTML doesn't contain a '.MainContainer' element.");
      }
    };
    reader.readAsText(file);
  } else {
    console.error("Please select an HTML file to upload.");
  }
}

// Event listener for the load button click
document.getElementById('LoadNote').addEventListener('click', function () {
  const fileInput = document.getElementById('fileUpload');
  fileInput.click();
});

// Event listener for file upload
document.getElementById('fileUpload').addEventListener('change', loadSavedContent);

// Function to initialize addons
function initializeAddons() {
  console.log('Initializing addons...');

  // Get all addon containers
  const addonContainers = document.querySelectorAll('[id$="_addon"]');

  addonContainers.forEach(container => {
    const addonId = container.id;
    const initFunctionName = `${addonId}Init`;

    // Check if init function exists and call it
    if (typeof window[initFunctionName] === 'function') {
      console.log(`Initializing ${addonId}...`);
      window[initFunctionName]();
    }

    // Set up event listeners for buttons
    container.querySelectorAll('button').forEach(button => {
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr) {
        const functionName = onclickAttr.split('(')[0];
        button.removeAttribute('onclick');
        button.addEventListener('click', function() {
          if (typeof window[functionName] === 'function') {
            window[functionName]();
          } else {
            console.error(`${functionName} is not defined`);
          }
        });
      }
    });
  });
}

// Event listener for custom content loaded event
document.addEventListener('customContentLoaded', initializeAddons);