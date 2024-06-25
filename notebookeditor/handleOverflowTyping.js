function monitorForOverflow(div) {
    const intervalId = setInterval(() => {
        handleOverflow_Typing(div);
    }, 300);
    return intervalId;
}

let createNewPageCount = 0;
let overflowEnabled = true;

function shouldSkipElement(element) {
    return element.tagName === 'SPAN' || element.tagName === 'IMG' || element.className.includes('katexspan');
}

function moveElementCompletely(element, nextDiv) {
    const clone = element.cloneNode(true); // Clone the element deeply
    nextDiv.appendChild(clone); // Append the cloned element to the next div
    element.remove(); // Remove the original element
}

function iterativeTextSplit(element, container) {
    if (shouldSkipElement(element) || element.querySelector('span, img, .katexspan')) {
        // Check if element itself or its children should be skipped
        return element.outerHTML; // Return without altering the inner structure
    }

    let textContent = element.textContent;
    if (textContent.length <= 1) {
        return ""; // Skip if text is too short to split
    }

    let start = 0, end = textContent.length;
    while (start < end - 1) {
        let mid = Math.floor((start + end) / 2);
        element.textContent = textContent.substring(0, mid);
        if (isOverflown(container)) {
            end = mid;
        } else {
            start = mid;
        }
    }
    element.textContent = textContent.substring(0, start);
    return textContent.substring(start);
}

function handleOverflowAndNewPage(currentDiv, remainingText) {
    let nextDiv = getNextDiv(currentDiv);
    if (!nextDiv && createNewPageCount < 2) {
        createNewPage();
        setTimeout(() => {
            nextDiv = getNextDiv(currentDiv);
            moveTextToDiv(remainingText, nextDiv);
        }, 100);
    } else if (nextDiv) {
        moveTextToDiv(remainingText, nextDiv);
    } else {
        console.log("Overflow handling disabled after maximum page limit reached.");
    }
}

function moveAndAdjustText(element, currentDiv) {
    if (shouldSkipElement(element)) {
        handleOverflowAndNewPage(currentDiv, element.outerHTML);
        return;
    }

    const remainingText = iterativeTextSplit(element, currentDiv);
    if (remainingText.length > 0) {
        handleOverflowAndNewPage(currentDiv, remainingText);
    }
}

function createNewPage() {
    document.getElementById("add-newPage").click();
    createNewPageCount++;
}

function moveTextToDiv(text, div) {
    const newTextElement = document.createElement('div');
    newTextElement.innerHTML = text;
    div.insertBefore(newTextElement, div.firstChild);
}

function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function getNextDiv(currentDiv) {
    const nextDivId = parseInt(currentDiv.id.replace(/\D/g, ''), 10) + 1;
    return document.getElementById(`pagenumber${nextDivId}`);
}
