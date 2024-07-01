let listCounter = 0;
function convertSelectionToList_bullets() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const pagebook = findPagebook_bullets(range.commonAncestorContainer);
    if (!pagebook) return;
    const selectedDivs = getSelectedDivs_bullets(range, pagebook);
    if (selectedDivs.length === 0) {
        console.warn('No complete divs selected');
        return;
    }
    const ul = document.createElement('ul');
    const listId = `list_${++listCounter}`;
    ul.setAttribute('list_id', listId);

    selectedDivs.forEach((div, index) => {
        const li = document.createElement('li');
        li.innerHTML = div.innerHTML;
        li.setAttribute('list_id', listId);
        ul.appendChild(li);
    });
    // Replace the first selected div with the new ul
    selectedDivs[0].parentNode.replaceChild(ul, selectedDivs[0]);
    // Remove the rest of the selected divs
    for (let i = 1; i < selectedDivs.length; i++) {
        selectedDivs[i].parentNode.removeChild(selectedDivs[i]);
    }
    // Merge adjacent lists
    mergeAdjacentLists_bullets(ul);
    // Restore selection to the end of the new list
    restoreSelectionToList_bullets(ul);
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
function mergeAdjacentLists_bullets(ul) {
    let sibling = ul.nextElementSibling;
    while (sibling && sibling.tagName.toLowerCase() === 'ul') {
        const currentListId = ul.getAttribute('list_id');
        while (sibling.firstChild) {
            const li = sibling.firstChild;
            li.setAttribute('list_id', currentListId);
            ul.appendChild(li);
        }
        sibling.parentNode.removeChild(sibling);
        sibling = ul.nextElementSibling;
    }
}
function restoreSelectionToList_bullets(ul) {
    const range = document.createRange();
    range.selectNodeContents(ul);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}
// Add a keyboard shortcut (Ctrl+L) to trigger the conversion
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        convertSelectionToList_bullets();
    }
});
// Expose the function globally (optional)
window.convertSelectionToList_bullets = convertSelectionToList_bullets;