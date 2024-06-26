// Function to monitor for overflow in a contenteditable div
function monitorForOverflow(div) {
    // Store the interval ID for later clearing
    const intervalId = setInterval(() => {
        handleOverflow(div);
    }, 300); // Adjust the interval as needed

    // Return the interval ID so we can clear it later
    return intervalId;
}

// Function to handle overflow in a div
function handleOverflow(div) {
    if (isOverflown(div)) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;

        let divdel = startNode.nodeType === Node.TEXT_NODE ? startNode.parentNode : startNode;
        while (divdel && !divdel.id.startsWith('pagenumber')) {
            divdel = divdel.parentNode;
        }
        if (!divdel) return;

        let divdelId = getDivIdNumber(divdel.id);
        let nextDivId = divdelId + 1;
        let nextDiv = document.getElementById(`pagenumber${nextDivId}`);

        let lastElement = div.lastElementChild;
        if (!lastElement) return;

        if (!nextDiv) {
            document.getElementById("add-newPage").click();
            let divdel = startNode.nodeType === Node.TEXT_NODE ? startNode.parentNode : startNode;
            while (divdel && !divdel.id.startsWith('pagenumber')) {
                divdel = divdel.parentNode;
            }
            if (!divdel) console.log("ERROR!!!!");
            let divdelId = getDivIdNumber(divdel.id);
            let nextDivId = divdelId + 1;
            let newDiv = document.getElementById(`pagenumber${nextDivId}`);
            moveElement(lastElement, div, newDiv);
        } else {
            moveElement(lastElement, div, nextDiv);
        }
    }
}

// Function to move an element from one div to another
function moveElement(element, currentDiv, targetDiv) {
    currentDiv.removeChild(element);


    targetDiv.firstElementChild.innerHTML = element.innerHTML + " " + targetDiv.firstElementChild.innerHTML;
    saveContent(currentDiv.id, currentDiv.innerHTML);
    saveContent(targetDiv.id, targetDiv.innerHTML);
    handleOverflow(targetDiv);
}

// Function to check if an element is overflown
function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

// Function to extract numbering from a div ID
function extractDivNumbering(divid) {
    const numberString = [...divid].reduce((acc, char) => (/\d/.test(char) ? acc + char : acc), "");
    let number = parseInt(numberString, 10);
    number = number + 1;
    return number;
}

// Function to find the next div based on the current div's ID
function findNextDiv(divid) {
    const jj = extractDivNumbering(divid.id);
    return jj != null ? document.querySelector(`div[id^="div${jj}"]`) : null;
}

// Function to get the numeric part of a div ID
function getDivIdNumber(id) {
    return parseInt(id.replace(/\D/g, ''), 10);
}

// Monitor for overflow and set intervals for cleanup
document.addEventListener('DOMNodeInserted', function(event) {
    document.querySelectorAll('.pagebook').forEach(div => {
        const intervalId = monitorForOverflow(div);

        div.addEventListener('blur', () => {
            clearInterval(intervalId);
        });

        window.addEventListener('beforeunload', () => {
            clearInterval(intervalId);
        });
    });
});

// Set interval to clean up empty divs
setInterval(function() {
    document.querySelectorAll('.pagebook').forEach(div => {
        if (div.textContent.trim() === "" && div.children.length === 0) {
            div.remove();
        }
    });
}, 1000);
