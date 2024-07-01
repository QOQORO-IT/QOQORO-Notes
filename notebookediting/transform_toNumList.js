(function() {
    let listCounter = 0;

    function convertSelectionToNumberedList() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const pagebook = findPagebook(range.commonAncestorContainer);
        if (!pagebook) return;

        const selectedDivs = getSelectedDivs(range, pagebook);
        if (selectedDivs.length === 0) {
            console.warn('No complete divs selected');
            return;
        }

        const ol = document.createElement('ol');
        const listId = `list_${++listCounter}`;
        ol.setAttribute('list_id', listId);

        selectedDivs.forEach((div, index) => {
            const li = document.createElement('li');
            li.innerHTML = div.innerHTML;
            li.setAttribute('list_id', listId);
            li.setAttribute('list_index', index + 1);
            ol.appendChild(li);
        });

        // Replace the first selected div with the new ol
        selectedDivs[0].parentNode.replaceChild(ol, selectedDivs[0]);

        // Remove the rest of the selected divs
        for (let i = 1; i < selectedDivs.length; i++) {
            selectedDivs[i].parentNode.removeChild(selectedDivs[i]);
        }

        // Merge adjacent lists
        mergeAdjacentLists(ol);

        // Restore selection to the end of the new list
        restoreSelectionToList(ol);
    }

    function findPagebook(node) {
        while (node && !node.classList.contains('pagebook')) {
            node = node.parentNode;
        }
        return node;
    }

    function getSelectedDivs(range, pagebook) {
        const divs = Array.from(pagebook.querySelectorAll('div'));
        return divs.filter(div => {
            const divRange = document.createRange();
            divRange.selectNodeContents(div);
            return range.intersectsNode(div) && (range.compareBoundaryPoints(Range.START_TO_START, divRange) <= 0 || 
                   range.compareBoundaryPoints(Range.END_TO_END, divRange) >= 0);
        });
    }

    function mergeAdjacentLists(ol) {
        let sibling = ol.nextElementSibling;
        while (sibling && sibling.tagName.toLowerCase() === 'ol') {
            const currentListId = ol.getAttribute('list_id');
            const startIndex = ol.children.length + 1;

            while (sibling.firstChild) {
                const li = sibling.firstChild;
                li.setAttribute('list_id', currentListId);
                li.setAttribute('list_index', startIndex + sibling.children.length - 1);
                ol.appendChild(li);
            }
            sibling.parentNode.removeChild(sibling);
            sibling = ol.nextElementSibling;
        }
    }

    function restoreSelectionToList(ol) {
        const range = document.createRange();
        range.selectNodeContents(ol);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Add a keyboard shortcut (Ctrl+L) to trigger the conversion
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            convertSelectionToNumberedList();
        }
    });

    // Expose the function globally (optional)
    window.convertSelectionToNumberedList = convertSelectionToNumberedList;
})();