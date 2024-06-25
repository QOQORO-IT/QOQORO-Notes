function addClickListeners_forPasteRefs() {
    const divs = document.querySelectorAll('div');
    divs.forEach(div => {
        if (!div.classList.contains('listener-added')) {
            div.classList.add('listener-added');
            div.addEventListener('click', function(event) {
                if (event.target.classList.contains('clickable-reference')) {
                    event.preventDefault();  // Prevent default behavior to maintain correct caret position
  
                    const fullPath = event.target.getAttribute('data-full-path');
                    const pageMatch = event.target.textContent.match(/\[(.*?),\s*(?:page|Page)\s*(\d+)\]/);
                    if (pageMatch) {
                        const pageOfSelection = pageMatch[2];
                        console.log('Clicked on reference:', fullPath, 'Page', pageOfSelection);
  
                        window.parent.postMessage({
                            type: 'referenceClicked',
                            fullPath: fullPath,
                            page: pageOfSelection
                        }, '*');  // Recommended to use specific origin in production
                    }
                }
            });
        }
    });
  }
  
  // Call addClickListeners_forPasteRefs once on document ready or on a suitable event
  document.addEventListener('DOMContentLoaded', addClickListeners_forPasteRefs);
  