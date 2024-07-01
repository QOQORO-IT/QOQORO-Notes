function handleToolboxMouseDown(event) {
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'SELECT' && event.target.tagName !== 'BUTTON') {
      event.preventDefault();
  }
}

function applyTextStyling() {
  var fontSize = document.getElementById('fontSizeInput').value + 'px';
  var fontFamily = document.getElementById('fontFamilySelect').value;

  document.execCommand('fontSize', false, '7'); // Hack to set a baseline font size
  var fontElements = document.querySelectorAll('font[size="7"]');
  for (var i = 0; i < fontElements.length; i++) {
      fontElements[i].removeAttribute('size');
      fontElements[i].style.fontSize = fontSize;
      fontElements[i].style.fontFamily = fontFamily;
  }
}

function applyStylesToContainer() {
  var fontSize = document.getElementById('fontSizeInput').value + 'px';
  var fontFamily = document.getElementById('fontFamilySelect').value;

  var containerElements = document.querySelectorAll('#MainContainer *');
  for (var i = 0; i < containerElements.length; i++) {
      containerElements[i].style.fontSize = fontSize;
      containerElements[i].style.fontFamily = fontFamily;
  }
}
