(function() {
    function createOverlay(pagebook) {
        const overlay = document.createElement('div');
        overlay.className = 'pagebook-overlay';
        overlay.id = 'pagebook-overlay-' + pagebook.id;
        overlay.style.position = 'absolute';
        overlay.style.left = `${pagebook.offsetLeft}px`;
        overlay.style.top = `${pagebook.offsetTop + pagebook.offsetHeight * 1.05}px`;
        overlay.style.width = `${pagebook.offsetWidth}px`;
        overlay.style.height = '1.5px';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.01)';
        overlay.style.zIndex = '9000';
        pagebook.parentNode.appendChild(overlay);
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
                    const listItems = Array.from(node.children).filter(child => child.tagName === 'LI');
                    listItems.forEach((li, index) => {
                        const listChunk = document.createElement(node.tagName);
                        listChunk.appendChild(li.cloneNode(true));
                        chunks.push(listChunk.outerHTML);

                        // Add a line break after each list item except the last one
                        if (index < listItems.length - 1) {
                            chunks.push('<br>');
                        }
                    });
                } else if (node.tagName === 'DIV') {
                    chunks.push(node.outerHTML);
                } else {
                    Array.from(node.childNodes).forEach(processNode);
                }
            }
        }

        Array.from(doc.body.childNodes).forEach(processNode);
        return chunks;
    }

    function adjustText(textContent) {
        const finalCaretPosition = saveCaretPosition(textContent);
        const overlay = document.getElementById('pagebook-overlay-' + textContent.id);
        if (!overlay) return;

        let overflowDetected = textContent.scrollHeight > textContent.offsetHeight;
        console.log(`Overflow detected: ${overflowDetected}`);

        if (!overflowDetected) {
            console.log("No overflow detected, caret position should not change");
            return;
        }

        console.log("Overflow detected, caret position may change");

        const nextPage_id = getDivIdNumber(textContent.id);
        const overflowContainer = document.getElementById(`pagenumber${nextPage_id + 1}`);
        if (!overflowContainer) return;

        const fullHTML = textContent.innerHTML;
        let visibleHTML = '';
        let overflowHTML = '';

        const chunks = extractAndChunkHTML(fullHTML);
        console.log("Chunks:", chunks);

        textContent.innerHTML = '';
        let isOverflowing = false;

        for (const chunk of chunks) {
            if (!isOverflowing) {
                textContent.innerHTML += chunk;
                isOverflowing = textContent.scrollHeight > textContent.offsetHeight;
                if (isOverflowing) {
                    // Remove the last added chunk from textContent
                    textContent.innerHTML = textContent.innerHTML.slice(0, -(chunk.length));
                    overflowHTML += chunk;
                } else {
                    visibleHTML += chunk;
                }
            } else {
                overflowHTML += chunk;
            }
        }

        if (overflowHTML) {
            // Ensure we're not duplicating content
            const existingContent = overflowContainer.innerHTML;
            if (!existingContent.includes(overflowHTML)) {
                overflowContainer.innerHTML = overflowHTML + existingContent;
            }
            restoreCaretPosition(textContent, finalCaretPosition);

            if (initialCaretPosition && finalCaretPosition) {
                if (initialCaretPosition.offset !== finalCaretPosition.offset) {
                    console.log("Caret position has changed due to overflow adjustment");
                } else {
                    console.log("Caret position remained the same after overflow adjustment");
                }
            }
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
