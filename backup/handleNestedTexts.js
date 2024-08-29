function restructurePageContent() {
  // Find all elements with IDs starting with "pagenumber"
  const pageElements = document.querySelectorAll('div[id^="pagenumber"]');

  // pageElements.forEach(pageElement => {
  //   const innerDiv = pageElement.querySelector('div.
  //   }
}

// Run the function immediately
restructurePageContent();

// Set up an interval to run the function every 1000 milliseconds (1 second)
setInterval(restructurePageContent, 1000);