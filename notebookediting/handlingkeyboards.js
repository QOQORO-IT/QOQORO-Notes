document.getElementById('editableDiv').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default newline behavior

        // Get current selection
        let selection = window.getSelection();

        // Check if the selection is on the <div><br></div> structure
        let range = selection.getRangeAt(0);
        let startContainer = range.startContainer.parentNode;
        let endContainer = range.endContainer.parentNode;

        if (startContainer.tagName === 'DIV' && startContainer.innerHTML === '<br>' &&
            endContainer.tagName === 'DIV' && endContainer.innerHTML === '<br>') {

            // Replace <div><br></div> with <div><br>&nbsp;</div>
            let newContent = document.createElement('div');
            newContent.innerText = " "

            // Replace the current content with new content
            let parentDiv = startContainer.parentNode;
            parentDiv.replaceChild(newContent, startContainer);
        }
    }
});