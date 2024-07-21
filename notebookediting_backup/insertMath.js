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


// Get modal elements
const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');
const saveBtn = document.getElementById('saveButton');
const editText = document.getElementById('editText');

// Function to show the modal
function showModal(clickedSpan) {
  modal.style.display = "block";
  editText.value = clickedSpan.textContent; // Set the current span text to the modal's textarea
  clickedSpan.dataset.editing = true; // Store editing flag on the clicked span
}

// Function to show the modal
function showModal2(clickedSpan) {
  modal.style.display = "block";
  clickedSpan.innerText = clickedSpan.getAttribute("nonkatexcontent");
  clickedSpan.innerHTML = clickedSpan.getAttribute("nonkatexcontent");
  editText.value = clickedSpan.textContent; // Set the current span text to the modal's textarea
  clickedSpan.dataset.editing = true; // Store editing flag on the clicked span
}

// Function to hide the modal
function hideModal() {
  modal.style.display = "none";
  // Remove the editing flag from the currently edited span
  document.querySelector('[data-editing="true"]').dataset.editing = false;
}

// Function to save the edited text
function saveEditedText() {
  if (!document.querySelector('[data-editing="true"]')) { return }
  const SavingBtn = document.getElementById("saveButton");
  let spanToEdit = document.querySelector('[data-editing="true"]');

  if (spanToEdit) {
    spanToEdit.textContent = editText.value; // Update the span text with the edited text
    // Save the entire content of all divs with the class 'editable-div' to localStorage
    spanToEdit.setAttribute("nonkatexcontent", editText.value)

    renderMathInElement(spanToEdit, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ]
    });



    hideModal();
    document.querySelectorAll('div').forEach(div => {
      localStorage.setItem(div.id, div.innerHTML);
    });
    SavingBtn.click();
  }
}



// New contextmenu listener - target specific span
document.body.addEventListener('contextmenu', function(evt) {

  // Find the nearest relevant parent span
  let targetSpan = evt.target.closest('.katexspan, .Newline_equation');

  // Determine if the target or its parent is a katex-related element and decide the action
  if (targetSpan) {
    evt.preventDefault(); // Prevent default context menu for all cases

    if (targetSpan.classList.contains('katexspan')) {
      showModal2(targetSpan); // Handle newline equations
    }
  }
}, false);



// New contextmenu listener - target specific span
document.body.addEventListener('contextmenu', function(evt) {
  if ((evt.target.tagName === 'SPAN' && evt.target.className.startsWith('mord')) || (evt.target.tagName === 'SPAN' && evt.target.className.startsWith('mbin')) || (evt.target.tagName === 'svg')) {
    evt.preventDefault(); // Prevent default context menu

    // Get the parent span with class "katexspan"
    const parentSpan = evt.target.closest('.katexspan');

    // Check if a parent span with class "katexspan" is found
    if (parentSpan) {
      console.log(parentSpan.innerHTML); // Print the innerHTML of the parent span
      showModal2(parentSpan);
    } else {
      console.log("No parent span with class 'katexspan' found."); // Handle cases where no parent span is found
    }
  }
}, false);