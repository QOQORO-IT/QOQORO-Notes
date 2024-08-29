// modal.js

(function() {
  function createAndInsertReferenceSpan() {
    const referenceSpan = document.createElement('span');
    referenceSpan.className = 'clickable-reference-qnote';
    referenceSpan.contentEditable = false;
    referenceSpan.dataset.fullPath = ' ';
    referenceSpan.style.fontSize = 'medium';
    referenceSpan.style.textDecorationLine = 'underline';
    referenceSpan.style.color = 'blue';
    referenceSpan.style.cursor = 'pointer';
    referenceSpan.textContent = 'Link to other qnote';

    addRightClickListener(referenceSpan);
    makeSpanRemovable(referenceSpan);

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let parentDiv = selection.getRangeAt(0).commonAncestorContainer;
      while (parentDiv && (!parentDiv.classList || !Array.from(parentDiv.classList).some(cls => cls.includes('pagebook')))) {
        parentDiv = parentDiv.parentElement;
      }
      if (parentDiv) {
        const range = selection.getRangeAt(0);
        range.insertNode(referenceSpan);
        range.setStartAfter(referenceSpan);
        range.setEndAfter(referenceSpan);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.error('No parent div with "pagebook" in its class found');
        alert('Error: Could not find the correct location to insert the reference.');
      }
    } else {
      console.error('No selection found');
      alert('Error: No text cursor position found. Please place your cursor where you want to insert the reference.');
    }
  }

  function addRightClickListener(span) {
    span.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showModal(span);
    });
  }

  function makeSpanRemovable(span) {
    span.addEventListener('dblclick', (e) => {
      if (confirm('Are you sure you want to delete this link?')) {
        span.remove();
      }
    });
  }

  function showModal(span) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '5px';
    modal.style.zIndex = '1001';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter URL';
    input.style.width = '100%';
    input.style.marginBottom = '10px';
    input.value = span.dataset.fullPath.trim();

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.marginRight = '10px';
    saveButton.addEventListener('click', () => {
      const url = input.value.trim();
      span.dataset.fullPath = url;
      span.textContent = url.split('/').pop() || url;
      document.body.removeChild(overlay);
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(input);
    modal.appendChild(saveButton);
    modal.appendChild(cancelButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    input.focus();
  }

  // Expose functions to global scope
  window.qnoteLinkModal = {
    createAndInsertReferenceSpan,
    showModal,
    addRightClickListener,
    makeSpanRemovable
  };
})();