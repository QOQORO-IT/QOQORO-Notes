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
        for (const child of mainContainer.children) {
          oldContainer.appendChild(child.cloneNode(true));
        }
        console.log(oldContainer.innerHTML);
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