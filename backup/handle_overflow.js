(function() {
    function createOverlay(pagebook) {
        const overlay = document.createElement('div');
        overlay.className = 'pagebook-overlay';
        overlay.id = 'pagebook-overlay-' + pagebook.id;
        overlay.style.position = 'absolute';
        overlay.style.left = `${pagebook.offsetLeft}px`;
        overlay.style.top = `${pagebook.getBoundingClientRect().bottom}px`;
        overlay.style.width = `${pagebook.offsetWidth}px`;
        overlay.style.height = '1.5px';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.01)';
        overlay.style.zIndex = '9000';
        document.body.appendChild(overlay);
        return overlay;
    }

    function getDivIdNumber(divId) {
        return parseInt(divId.replace('pagenumber', ''), 10);
    }

    function extractAndChunkHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const chunks = [];

        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    chunks.push(text);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    chunks.push('<br>');
                } else if (node.tagName === 'UL' || node.tagName === 'OL') {
                    processList(node);
                } else if (node.tagName === 'DIV') {
                    const tableInDiv = node.querySelector('table');
                    if (tableInDiv) {
                        processTable(tableInDiv);
                    } else {
                        // Handle empty divs with line breaks
                        if (node.innerHTML.trim() === '<br>' || node.innerHTML.trim() === '') {
                            chunks.push(node.outerHTML);
                        } else {
                            // Process div contents separately
                            chunks.push(node.outerHTML);
                        }
                    }
                } else if (node.tagName === 'TABLE') {
                    processTable(node);
                } else if (node.tagName === 'SPAN' || isInlineElement(node)) {
                    // Preserve span and other inline elements
                    chunks.push(node.outerHTML);
                } else {
                    Array.from(node.childNodes).forEach(processNode);
                }
            }
        }

        function isInlineElement(node) {
            const inlineElements = ['A', 'STRONG', 'EM', 'B', 'I', 'U', 'SUB', 'SUP'];
            return inlineElements.includes(node.tagName);
        }

        function processTable(table) {
            const rows = Array.from(table.querySelectorAll('tr'));
            rows.forEach((row, index) => {
                const tempTable = document.createElement('table');
                // Copy attributes from original table
                for (let attr of table.attributes) {
                    tempTable.setAttribute(attr.name, attr.value);
                }
                const tempTbody = document.createElement('tbody');
                tempTbody.appendChild(row.cloneNode(true));
                tempTable.appendChild(tempTbody);
                chunks.push(tempTable.outerHTML);
            });
        }

        function processList(list) {
            const listItems = Array.from(list.children).filter(child => child.tagName === 'LI');
            listItems.forEach((li, index) => {
                const listChunk = document.createElement(list.tagName);
                listChunk.appendChild(li.cloneNode(true));
                chunks.push(listChunk.outerHTML);
            });
        }

        Array.from(doc.body.childNodes).forEach(processNode);
        return chunks;
    }


    function adjustText(textContent) {
        const nextPageId = getDivIdNumber(textContent.id);
        const overflowContainer = document.getElementById(`pagenumber${nextPageId + 1}`);
        if (!overflowContainer) return;

        // Handle table-specific logic
        const table = textContent.querySelector('table');
        if (table) {
            const rows = Array.from(table.rows);
            let keepRows = [];
            let moveRows = [];

            rows.forEach((row, index) => {
                if (index < rows.length / 2) {
                    keepRows.push(row);
                } else {
                    moveRows.push(row);
                }
            });


        }

        // Continue with generic handling
    const finalCaretPosition = saveCaretPosition(textContent);
        const overlay = document.getElementById('pagebook-overlay-' + textContent.id);
        if (!overlay) return;

        let overflowDetected = textContent.scrollHeight > textContent.offsetHeight;

        if (!overflowDetected) {
            console.log("No overflow detected, caret position should not change");
            return;
        }

        console.log("Overflow detected, caret position may change");
        localStorage.setItem('originalContent_' + textContent.id, textContent.innerHTML);

        const fullHTML = textContent.innerHTML;
        const chunks = extractAndChunkHTML(fullHTML);
        // alert(chunks)
        let visibleHTML = '';
        let overflowHTML = '';

        textContent.innerHTML = fullHTML;

        for (let i = 0; i < chunks.length; i++) {
            const testHTML = visibleHTML + chunks[i];
            textContent.innerHTML = testHTML;

            if (textContent.scrollHeight > textContent.offsetHeight) {
                overflowHTML = chunks.slice(i).join('');
                break;
            } else {
                visibleHTML = testHTML;
            }
        }

        if (overflowHTML) {
            textContent.innerHTML = visibleHTML;
            const parser = new DOMParser();
            const doc = parser.parseFromString('<div>' + overflowHTML + '</div>', 'text/html');
            const overflowContent = doc.body.firstChild;

            // Use prepend to add the overflow content as the first child of the overflow container
            overflowContainer.prepend(overflowContent);

            restoreCaretPosition(textContent, finalCaretPosition);
        } else {
            console.log("No more overflowing elements detected, stopping adjustment");
        }
    }


    // Improved saveCaretPosition function
    function saveCaretPosition(element) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return {
                offset: preCaretRange.toString().length,
                containerHTML: element.innerHTML
            };
        }
        return null;
    }

    // Improved restoreCaretPosition function
    function restoreCaretPosition(element, savedPosition) {
        if (!savedPosition) return;

        const range = document.createRange();
        const sel = window.getSelection();

        // If the content hasn't changed, we can restore the exact position
        if (element.innerHTML === savedPosition.containerHTML) {
            let charIndex = 0;
            let foundStart = false;

            function traverseNodes(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const nextCharIndex = charIndex + node.length;
                    if (!foundStart && savedPosition.offset >= charIndex && savedPosition.offset <= nextCharIndex) {
                        range.setStart(node, savedPosition.offset - charIndex);
                        range.setEnd(node, savedPosition.offset - charIndex);
                        foundStart = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverseNodes(node.childNodes[i]);
                        if (foundStart) break;
                    }
                }
            }

            traverseNodes(element);
        } else {
            // If content has changed, set caret at the end
            range.selectNodeContents(element);
            range.collapse(false);
        }

        sel.removeAllRanges();
        sel.addRange(range);
    }


    // Modified handleOverflow_all function
    function initializeOverflowHandling() {
        const containers = document.querySelectorAll('.pagebook');
        containers.forEach(container => {
            container.addEventListener('input', function() {
                adjustText(this);
                if (!document.getElementById('pagebook-overlay-' + container.id)) {
                    createOverlay(container);
                }
            });
        });

    }

    function adding_Overlay() {
        const containers = document.querySelectorAll('.pagebook');
        for (const container of containers) {
            container.addEventListener('input', function() {
                adjustText(this);
                if (!document.getElementById('pagebook-overlay-' + container.id)) {
                    createOverlay(container);
                }
            });
        }
    }

    setInterval(adding_Overlay, 1000);

    function getDivIdNumber(id) {
        // Extract the numeric part of the id
        return parseInt(id.match(/\d+/)[0], 10);
    }

    // Start the overflow handling
    initializeOverflowHandling();
})();


function getDivIdNumber(id) {
    // Extract the numeric part of the id
    return parseInt(id.match(/\d+/)[0], 10);
}
