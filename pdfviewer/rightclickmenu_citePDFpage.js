// Custom context menu for text selection
document.addEventListener('contextmenu', function(event) {
    const selection = window.getSelection();
    if (selection.toString()) {
        event.preventDefault();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const customMenu = document.getElementById('customMenu');
        customMenu.style.top = `${rect.bottom + window.scrollY}px`;
        customMenu.style.left = `${rect.left + window.scrollX}px`;
        customMenu.style.display = 'block';
    }
});


// Hide custom menu on click elsewhere
document.addEventListener('click', function(event) {
    const customMenu = document.getElementById('customMenu');
    if (event.target.id !== 'customMenu' && !customMenu.contains(event.target)) {
        customMenu.style.display = 'none';
    }
});

function createBookmarkDiv(pdfUrl, container_id) {
    var containernya = document.getElementById(container_id);

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.id = `bookmark-${window.scrollY}`; // Use scrollY as part of the ID
    canvas.style.position = 'absolute'; // Keeps the canvas at the same place even when scrolled
    canvas.style.bottom = '20px';
    canvas.style.right = '20px';
    canvas.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; // Set background color to red
    canvas.style.borderRadius = '5px';
    canvas.style.cursor = 'move'; // Change cursor to indicate it's draggable
    canvas.style.zIndex = '999'; // Make sure it floats above everything
    canvas.width = 200; // Set initial width
    canvas.height = 150; // Set initial height
    canvas.classList.add("areabookmarker");

    let resizer = null;

    // Function to handle dragging
    function handleDrag(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (event) => {
            if (event.target.className === 'resizer') return;
            isDragging = true;
            offsetX = event.clientX - element.offsetLeft;
            offsetY = event.clientY - element.offsetTop;
            // Prevent text selection while dragging
            event.preventDefault();
        });

        document.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            element.style.left = `${event.clientX - offsetX}px`;
            element.style.top = `${event.clientY - offsetY}px`;

            // Update the resizer position if it exists
            if (resizer) {
                const rect = element.getBoundingClientRect();
                resizer.style.left = `${rect.left + element.clientWidth - 10}px`;
                resizer.style.top = `${rect.top + element.height + window.scrollY}px`;
            }

            // Optional: Prevent default browser behavior
            event.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Function to handle resizing
    function handleResize(element, resizer) {
        let isResizing = false;
        let initialWidth, initialHeight, initialMouseX, initialMouseY;

        resizer.addEventListener('mousedown', function(event) {
            isResizing = true;
            initialWidth = element.clientWidth;
            initialHeight = element.clientHeight;
            initialMouseX = event.clientX;
            initialMouseY = event.clientY;
            document.body.style.cursor = 'se-resize'; // Change cursor while resizing
            event.preventDefault();
        });

        document.addEventListener('mousemove', function(event) {
            if (!isResizing) return;
            const width = initialWidth + (event.clientX - initialMouseX);
            const height = initialHeight + (event.clientY - initialMouseY);
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
            // Adjust canvas size accordingly
            element.width = width;
            element.height = height;

            // Update the resizer position
            const rect = element.getBoundingClientRect();
            resizer.style.left = `${rect.left + width - 10}px`;
            resizer.style.top = `${rect.top + element.height + window.scrollY}px`;
        });

        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default'; // Reset cursor
            }
        });
    }

    // Create and position the resizer
    function createResizer(canvas) {
        console.log("Creating resizer");
        resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.background = 'rgba(0, 0, 0, 0.5)';
        resizer.style.position = 'absolute';
        resizer.style.cursor = 'se-resize';
        resizer.style.zIndex = 1000;

        // Position the resizer at the bottom right corner of the canvas
        const rect = canvas.getBoundingClientRect();
        resizer.style.left = `${rect.left + canvas.clientWidth - 10}px`;
        resizer.style.top = `${window.scrollY + rect.top + canvas.clientHeight}px`;

        document.body.appendChild(resizer);

        // Apply resizable functionality
        handleResize(canvas, resizer);
    }

    // Add double-click event to create the resizer
    canvas.addEventListener('dblclick', () => {
        console.log("Canvas double-clicked");
        if (!resizer) {
            createResizer(canvas);
        }
    });

    // Event listener to remove the resizer when clicking outside the canvas
    document.addEventListener('click', (event) => {
        if (resizer && !canvas.contains(event.target)) {
            resizer.remove();
            resizer = null;
        }
    });


    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        captureScreenWithoutMyCanvas(canvas);
    });


    // Apply draggable functionality
    handleDrag(canvas);

    // Append the canvas to the body
    containernya.appendChild(canvas);

    // Center the canvas on the screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const canvasWidth = canvas.offsetWidth; // Get the actual width after appending
    const canvasHeight = canvas.offsetHeight; // Get the actual height after appending

    canvas.style.left = `${(screenWidth - canvasWidth) / 2}px`;
    canvas.style.top = `${(screenHeight - canvasHeight) / 2}px`;

    return canvas;
}


// Copy text functionality
document.getElementById('copyText').addEventListener('click', function() {
    const selection = window.getSelection();
    if (selection.toString()) {
        const range = selection.getRangeAt(0);
        const textLayer = range.startContainer.parentNode.closest('.textLayer');
        const pageOfSelection = textLayer.getAttribute('data-page-number');

        // Extract the filename and create a display version
        const fullPath = currentFilename;
        const filenameParts = fullPath.split(/[/\\]/);
        const filenameOnly = filenameParts.pop();
        const displayFilename = filenameOnly.length > 5 ? filenameOnly.slice(0, 5) + "..." : filenameOnly;

        // Create clickable reference element
        const clickableReference = document.createElement('span');
        clickableReference.className = 'clickable-reference';
        clickableReference.textContent = `[${displayFilename}, page ${pageOfSelection}]`;
        clickableReference.style.textDecoration = 'underline';
        clickableReference.style.color = 'blue';
        clickableReference.style.cursor = 'pointer';
        clickableReference.setAttribute('contenteditable', 'false');
        clickableReference.setAttribute('data-full-path', fullPath);

        // Onclick handler for the reference (modify to your needs)
        clickableReference.onclick = function() {
            const path = this.getAttribute('data-full-path');
            console.log('Clicked on reference:', path, 'Page', pageOfSelection);
            // Add your desired behavior when clicking the reference here
        };

        // Extract the selected text without nested spans
        let extractedText = "";
        if (selection.rangeCount > 0) {
            const container = document.createElement("div");
            container.appendChild(range.cloneContents());
            extractedText = container.textContent;
        }

        // Create a text node for the selected text
        const textNode = document.createTextNode(extractedText + ' ');

        // Create the wrapper div and append text and reference separately
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(textNode);
        tempDiv.appendChild(clickableReference);

        // Append to body, select contents, and copy
        document.body.appendChild(tempDiv);
        const range2 = document.createRange();
        range2.selectNodeContents(tempDiv);
        const selectionObject = window.getSelection();
        selectionObject.removeAllRanges();
        selectionObject.addRange(range2);

        // Execute the copy command
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Error executing copy:', err);
        }

        // Clean up after copying
        document.body.removeChild(tempDiv);
        selectionObject.removeAllRanges();
    }
    document.getElementById('customMenu').style.display = 'none';
});



function captureScreenWithoutMyCanvas(originalCanvas) {
    // Store the original properties
    alert(originalCanvas.className)
    const originalDisplay = originalCanvas.style.display;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const rect = originalCanvas.getBoundingClientRect();
    const adjustedRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
    };

    // Temporarily hide the canvas
    originalCanvas.style.display = 'none';

    // Render the entire body to a canvas
    html2canvas(document.body, {
        x: adjustedRect.left,
        y: adjustedRect.top,
        width: adjustedRect.width,
        height: adjustedRect.height,
        scale: window.devicePixelRatio  // Consider device pixel ratio for high-DPI displays
    }).then(canvas => {

        // Restore the original display property of the canvas
        originalCanvas.style.display = originalDisplay;

        canvas.toBlob(blob => {
        // Try focusing the iframe and document before attempting clipboard operations
        window.focus();
        document.body.focus();

        // Create an image element from the blob for clipboard API and add custom attributes
        const img = new Image();
        img.setAttribute('data-pdf-title', 'uploads/untitledofmanymanytexts.pdf');
        img.setAttribute('data-pdf-page', sessionStorage.getItem('currentPaging'));
        img.onload = () => {
            // Write the image to the clipboard with the custom attributes
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                console.log('Image with custom attributes copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy image to clipboard', err);
            });
        };
        img.src = URL.createObjectURL(blob);
    }, 'image/png');

    originalCanvas.style.display = 'block';
    // Show the canvas again
    sessionStorage.setItem('currentPaging', getCurrentPageInView());
    sessionStorage.setItem('pdfTitle', currentFilename);
    });

}


