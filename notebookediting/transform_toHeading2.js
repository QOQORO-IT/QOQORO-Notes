let headingCounter = 0;

function expandRangeToLines(range) {
    let { startContainer, startOffset, endContainer, endOffset } = range;

    // Expand start to beginning of the line/block
    while (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
        startOffset--;
        if (startContainer.textContent[startOffset] === '\n') {
            startOffset++;
            break;
        }
    }
    if (startContainer.nodeType === Node.ELEMENT_NODE) {
        startOffset = 0;
    }

    // Expand end to end of the line/block
    while (endContainer.nodeType === Node.TEXT_NODE && endOffset < endContainer.length) {
        if (endContainer.textContent[endOffset] === '\n') {
            break;
        }
        endOffset++;
    }
    if (endContainer.nodeType === Node.ELEMENT_NODE) {
        endOffset = endContainer.childNodes.length;
    }

    // Set the new range
    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
}

function convertSelectionToHeading2() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    // Get the caret position
    const rects = range.getClientRects();
    if (rects.length > 0) {
        const rect = rects[0];
        const x = rect.left;
        const y = rect.top;

        // Function to get the element at a specific point
        function getElementAtPoint(x, y) {
            if (document.caretPositionFromPoint) {
                const position = document.caretPositionFromPoint(x, y);
                return position ? position.offsetNode : null;
            } else if (document.caretRangeFromPoint) {
                const range = document.caretRangeFromPoint(x, y);
                return range ? range.startContainer : null;
            }
            return null;
        }

        expandRangeToLines(range);

        // Get the element at the caret position
        let node22 = getElementAtPoint(x, y);

        // if (node22) {
        //     alert(node22.id || `Element has no id ${node22.parentElement.innerHTML}`);
        // }

        if (!node22.id){node22 = node22.parentElement};

        // Check if we're dealing with a heading
        const headingElement = findHeadingElement(node22);
        if (headingElement) {
            convertHeadingToDiv(headingElement);
            return;
        }

        const contents = range.extractContents();
        const h2 = document.createElement('h2');
        const headingId = `heading_${++headingCounter}`;
        h2.setAttribute('heading_id', headingId);

        // Process the extracted contents
        h2.textContent = contents.textContent.trim();

        // Find the pagebook container
        const pagebook = findPagebook(range.commonAncestorContainer);
        if (!pagebook) {
            console.warn('No pagebook container found');
            range.insertNode(h2);
            return;
        }

        // Replace the parent div with the new heading
        replaceParentDivWithHeading(h2, range, pagebook);

        // Clean up surrounding empty nodes
        cleanupSurroundingNodes(h2);

        // Restore selection to the end of the new heading
        restoreSelectionToHeading(h2);
    }
}

function findHeadingElement(node) {
    while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'H2' || node.hasAttribute('heading_id')) {
            return node;
        }
        if (node.classList.contains('pagebook') || node.id && node.id.startsWith('pagenumber')) {
            break;
        }
        node = node.parentNode;
    }
    return null;
}

function convertHeadingToDiv(headingElement) {
    const div = document.createElement('div');
    div.className = headingElement.className;
    if (!div.classList.contains('listener-added')) {
        div.classList.add('listener-added');
    }
    div.innerHTML = headingElement.innerHTML;

    // Replace the heading with the new div
    headingElement.parentNode.replaceChild(div, headingElement);
}

function findPagebook(node) {
    while (node && node.parentElement) {
        if (node.parentElement.id && node.parentElement.id.startsWith('pagenumber')) {
            return node.parentElement;
        }
        if (node.parentElement.classList.contains('pagebook') ||
            node.parentElement.classList.contains('pagebook listener-added')) {
            return node.parentElement;
        }
        node = node.parentElement;
    }
    return null;
}

function replaceParentDivWithHeading(h2, range, pagebook) {
    let currentNode = range.commonAncestorContainer;
    while (currentNode !== pagebook) {
        if (currentNode.parentNode === pagebook && currentNode.nodeType === Node.ELEMENT_NODE) {
            // Transfer any classes from the div to the h2
            h2.className = currentNode.className;
            pagebook.replaceChild(h2, currentNode);
            return;
        }
        currentNode = currentNode.parentNode;
    }
    // If we're here, it means the selection was at the root of the pagebook
    pagebook.appendChild(h2);
}

function cleanupSurroundingNodes(node) {
    let current = node.nextSibling;
    while (current && (current.nodeType === Node.TEXT_NODE && !current.textContent.trim() ||
        current.nodeType === Node.ELEMENT_NODE && !current.textContent.trim())) {
        const next = current.nextSibling;
        current.parentNode.removeChild(current);
        current = next;
    }

    current = node.previousSibling;
    while (current && (current.nodeType === Node.TEXT_NODE && !current.textContent.trim() ||
        current.nodeType === Node.ELEMENT_NODE && !current.textContent.trim())) {
        const prev = current.previousSibling;
        current.parentNode.removeChild(current);
        current = prev;
    }
}

function restoreSelectionToHeading(h2) {
    const range = document.createRange();
    range.selectNodeContents(h2);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Add a keyboard shortcut (Ctrl+H) to trigger the conversion
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        convertSelectionToHeading2();
    }
});

// Expose the function globally (optional)
window.convertSelectionToHeading2 = convertSelectionToHeading2;