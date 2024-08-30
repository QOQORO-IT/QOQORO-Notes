function alignText(alignment, event) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let currentNode = range.commonAncestorContainer;

        // If the selection is directly in the text node, get its parent
        if (currentNode.nodeType === 3) {
            currentNode = currentNode.parentNode;
        }

        // Traverse up the DOM tree
        while (currentNode && !currentNode.classList.contains('pagebook')) {
            if (currentNode.tagName.toLowerCase() === 'li') {
                // Found an li, align its parent ol or ul
                let listParent = currentNode.parentNode;
                while (listParent && !['ol', 'ul'].includes(listParent.tagName.toLowerCase())) {
                    listParent = listParent.parentNode;
                }
                if (listParent) {
                    listParent.style.textAlign = alignment;
                    // Adjust list style position for better alignment
                    listParent.style.listStylePosition = (alignment === 'left') ? 'outside' : 'inside';
                    break;
                }
            } else if (currentNode.nodeType === 1) {
                // For any other element node, apply alignment directly
                currentNode.style.textAlign = alignment;
                break;
            }
            currentNode = currentNode.parentNode;
        }

        // Prevent the event from bubbling up
        event.stopPropagation();
    }
}


// Functions to align selected text
document.querySelector('.icon-button[aria-label="Align Left"]').addEventListener('click', function() {
    alignText('left');
});
document.querySelector('.icon-button[aria-label="Align Center"]').addEventListener('click', function() {
    alignText('center');
});
document.querySelector('.icon-button[aria-label="Align Right"]').addEventListener('click', function() {
    alignText('right');
});
document.querySelector('.icon-button[aria-label="Justify"]').addEventListener('click', function() {
    alignText('justify');
});
