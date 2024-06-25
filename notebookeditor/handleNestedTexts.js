function restructurePageContent() {
    // Find all elements with IDs starting with "pagenumber"
    const pageElements = document.querySelectorAll('div[id^="pagenumber"]');
  
    pageElements.forEach(pageElement => {
      const innerDiv = pageElement.querySelector('div.listener-added[style="text-align: left;"]');
      
      if (innerDiv) {
        // Move all child elements from innerDiv to pageElement
        while (innerDiv.firstChild) {
          pageElement.appendChild(innerDiv.firstChild);
        }
        
        // Remove the now-empty innerDiv
        innerDiv.remove();
      }
    });
  }
  
  // Run the function immediately
  restructurePageContent();
  
  // Set up an interval to run the function every 1000 milliseconds (1 second)
  setInterval(restructurePageContent, 1000);