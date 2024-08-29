// Get the button element
const addButton = document.getElementById('add-otherNoteLink');

// Add click event listener to the button
addButton.addEventListener('click', () => {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.qnote'; // Only allow .qnote files

  // Add change event listener to the file input
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.qnote')) {
      // Get the full path of the file
      const fullPath = file.path || file.webkitRelativePath || file.name;

      // Create the clickable reference span
      const referenceSpan = document.createElement('span');
      referenceSpan.className = 'clickable-reference-qnote';
      referenceSpan.contentEditable = false;
      referenceSpan.dataset.fullPath = fullPath;
      referenceSpan.style.fontSize = 'medium';
      referenceSpan.style.textDecorationLine = 'underline';
      referenceSpan.style.color = 'blue';
      referenceSpan.style.cursor = 'pointer';

      // Set the text content (filename without extension)
      const fileName = file.name.replace(/\.qnote$/i, '');
      referenceSpan.textContent = `[${fileName}]`;

      // Find the parent div containing "pagebook" in its class
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let parentDiv = selection.getRangeAt(0).commonAncestorContainer;
        while (parentDiv && (!parentDiv.classList || !Array.from(parentDiv.classList).some(cls => cls.includes('pagebook')))) {
          parentDiv = parentDiv.parentElement;
        }

        if (parentDiv) {
          // Insert the span at the cursor position
          const range = selection.getRangeAt(0);
          range.insertNode(referenceSpan);
          range.setStartAfter(referenceSpan);
          range.setEndAfter(referenceSpan);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          console.error('No parent div with "pagebook" in its class found');
        }
      } else {
        console.error('No selection found');
      }
    } else {
      console.error('Please select a valid .qnote file');
    }
  });

  // Trigger the file selection dialog
  fileInput.click();
});