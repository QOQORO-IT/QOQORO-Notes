let BulletlistCounter = 0;

function convertLists_toDiv(listElement) {
    const div = document.createElement('div');
    div.className = listElement.className;
    div.innerHTML = listElement.innerHTML;
    listElement.parentNode.replaceChild(div, listElement);
    return div;
}

function findBullet_ExistedElement(node) {
    while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'LI' || node.tagName === 'UL' || node.tagName === 'OL' || node.hasAttribute('list_id')) {
            return node;
        }
        if (node.classList.contains('pagebook') || (node.id && node.id.startsWith('pagenumber'))) {
            break;
        }
        node = node.parentNode;
    }
    return null;
}

function convertSelectionToList_bullets(listType = 'ul') {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    expandRangeToLines(range);
    const rects = range.getClientRects();
    if (rects.length > 0) {
        const rect = rects[0];
        const x = rect.left;
        const y = rect.top;

        let node = getElementAtPoint(x, y);
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        // Find the pagebook element
        const pagebook = findPagebook_bullets(node);
        if (!pagebook) return;

        // Check if we're dealing with a list item or list
        const listElement = findBullet_ExistedElement(node);
        if (listElement) {
            let newDiv;
            if (listElement.tagName === 'LI') {
                newDiv = convertLists_toDiv(listElement);
            } else if (listElement.tagName === 'UL' || listElement.tagName === 'OL') {
                newDiv = document.createElement('div');
                // Convert all children of the list to divs
                Array.from(listElement.children).forEach(child => {
                    if (child.tagName === 'LI') {
                        const childDiv = convertLists_toDiv(child);
                        newDiv.appendChild(childDiv);
                    } else {
                        newDiv.appendChild(child.cloneNode(true));
                    }
                });
                listElement.parentNode.replaceChild(newDiv, listElement);
            }

            // Find the correct position to insert the new div
            const nextSibling = getNextSiblingAtPoint(x, y, pagebook);
            pagebook.insertBefore(newDiv, nextSibling);

            return;
        }

        // Rest of the function for creating new lists
        let selectedDivs = getSelectedDivs_bullets(range, pagebook);
        if (selectedDivs.length === 0) {
            console.warn('No complete divs selected');
            selectedDivs = [node];
        }

        const list = document.createElement(listType);
        const listId = `list_${++BulletlistCounter}`;
        list.setAttribute('list_id', listId);

        selectedDivs.forEach((div, index) => {
            const li = document.createElement('li');
            li.innerHTML = div.innerHTML;
            li.setAttribute('list_id', listId);
            if (listType === 'ol') {
                li.setAttribute('list_index', index + 1);
            }
            list.appendChild(li);
        });

        // Find the correct position to insert the new list
        const nextSibling = getNextSiblingAtPoint(x, y, pagebook);
        pagebook.insertBefore(list, nextSibling);

        // Remove the original selected divs
        selectedDivs.forEach(div => div.parentNode.removeChild(div));

        mergeAdjacentLists_bullets(list);
        restoreSelectionToList_bullets(list);
    }
}

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

function getNextSiblingAtPoint(x, y, container) {
    let currentY = 0;
    for (let child of container.children) {
        const rect = child.getBoundingClientRect();
        if (rect.top + rect.height > y) {
            return child;
        }
    }
    return null;
}

function findPagebook_bullets(node) {
    while (node && !node.classList.contains('pagebook')) {
        node = node.parentNode;
    }
    return node;
}

function getSelectedDivs_bullets(range, pagebook) {
    const divs = Array.from(pagebook.querySelectorAll('div'));
    return divs.filter(div => {
        const divRange = document.createRange();
        divRange.selectNodeContents(div);
        return range.intersectsNode(div) && (range.compareBoundaryPoints(Range.START_TO_START, divRange) <= 0 ||
            range.compareBoundaryPoints(Range.END_TO_END, divRange) >= 0);
    });
}

function mergeAdjacentLists_bullets(list) {
    let sibling = list.nextElementSibling;
    while (sibling && sibling.tagName.toLowerCase() === list.tagName.toLowerCase()) {
        const currentListId = list.getAttribute('list_id');
        let listIndex = list.children.length;
        while (sibling.firstChild) {
            const li = sibling.firstChild;
            li.setAttribute('list_id', currentListId);
            if (list.tagName.toLowerCase() === 'ol') {
                listIndex++;
                li.setAttribute('list_index', listIndex);
            }
            list.appendChild(li);
        }
        sibling.parentNode.removeChild(sibling);
        sibling = list.nextElementSibling;
    }
}

function restoreSelectionToList_bullets(list) {
    const range = document.createRange();
    range.selectNodeContents(list);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function expandRangeToLines(range) {
    let { startContainer, startOffset, endContainer, endOffset } = range;

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

    while (endContainer.nodeType === Node.TEXT_NODE && endOffset < endContainer.length) {
        if (endContainer.textContent[endOffset] === '\n') {
            break;
        }
        endOffset++;
    }
    if (endContainer.nodeType === Node.ELEMENT_NODE) {
        endOffset = endContainer.childNodes.length;
    }

    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
}

// Add a keyboard shortcut (Ctrl+L) to trigger the conversion to unordered list
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        convertSelectionToList_bullets('ul');
    }
});

// Add a keyboard shortcut (Ctrl+Shift+L) to trigger the conversion to ordered list
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        convertSelectionToList_bullets('ol');
    }
});

// Expose the function globally (optional)
window.convertSelectionToList_bullets = convertSelectionToList_bullets;