// Get modal elements
const modal_newline = document.getElementById('editModal_newline');
const closeBtn_newline = document.querySelector('.close');
const saveBtn_newline = document.getElementById('saveButton_newline');
let editText_newline = document.getElementById('editText_newline');

// Button for normal contenteditable
document.getElementById("add-newline-mathlatex").addEventListener("click", function() {
  const input = document.getElementById("pagenumber");
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.textContent = "Newline Math Textbox"; // Change this to your desired content
  span.className = "Newline_equation"
  span.setAttribute("nonkatexcontent", "Newline Math Textbox")
  span.setAttribute("data-editing", false)

  // Make the span non-editable
  span.contentEditable = "false";

  if (!selection.isCollapsed) {
    range.deleteContents(); // Remove selection if present
  }
  range.insertNode(span);
});

// Function to show the modal
function showModal_newline(clickedSpan) {
  modal_newline.style.display = "block";
  editText_newline.value = clickedSpan.getAttribute("nonkatexcontent");

  clickedSpan.dataset.editing = true; // Store editing flag on the clicked span
}

// Function to hide the modal
function hideModal_newline() {
  modal_newline.style.display = "none";
  // Remove the editing flag from the currently edited span
  document.querySelector('[data-editing="true"]').dataset.editing = false;
}

// Function to save the edited text
function saveEditedText_newline() {
  if (!document.querySelector('[data-editing="true"]')) { return }
  const SavingBtn2 = document.getElementById('saveButton_newline');
  let spanToEdit = document.querySelector('[data-editing="true"]');

  if (spanToEdit) {
    spanToEdit.textContent = editText_newline.value; // Update the span text with the edited text
    // Save the entire content of all divs with the class 'editable-div' to localStorage
    spanToEdit.setAttribute("nonkatexcontent", editText_newline.value)

    katex.render(editText_newline.value, spanToEdit, {
      throwOnError: false,
      displayMode: true
    });



    hideModal_newline();
    document.querySelectorAll('div').forEach(div => {
      localStorage.setItem(div.id, div.innerHTML);
    });
    SavingBtn2.click();
  }
}

// New contextmenu listener - target specific span
document.body.addEventListener('contextmenu', function(evt) {

  // Find the nearest relevant parent span
  let targetSpan = evt.target.closest('.katexspan, .Newline_equation');

  // Determine if the target or its parent is a katex-related element and decide the action
  if (targetSpan) {
    if (targetSpan.classList.contains('Newline_equation')) {
      showModal_newline(targetSpan); // Handle newline equations
    }
  }
}, false);

// New contextmenu listener - target specific span
document.body.addEventListener('contextmenu', function(evt) {
  if ((evt.target.tagName === 'SPAN' && evt.target.className.startsWith('mord')) || (evt.target.tagName === 'SPAN' && evt.target.className.startsWith('mbin')) || (evt.target.tagName === 'svg')) {
    evt.preventDefault(); // Prevent default context menu

    // Get the parent span with class "Newline_equation"
    const parentSpan = evt.target.closest('.Newline_equation');

    // Check if a parent span with class "Newline_equation" is found
    if (parentSpan) {
      console.log(parentSpan.innerHTML); // Print the innerHTML of the parent span
      showModal_newline(parentSpan);
    } else {
      console.log("No parent span with class 'Newline_equation' found."); // Handle cases where no parent span is found
    }
  }
}, false);