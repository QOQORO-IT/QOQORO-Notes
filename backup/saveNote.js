async function saveToHTMLFile() {
  const mainContainerDivs = document.querySelectorAll('.MainContainer');

  let htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .resize-handle {
            position: absolute;
            width: 15px;
            height: 15px;
            background-color: blue;
            z-index: 1010;
            display: none;
          }
        </style>
      </head>
      <body>
  `;

  for (const div of mainContainerDivs) {
    let divContent = div.innerHTML;
    htmlContent += `<div class="MainContainer">${divContent}</div>`;
  }

  htmlContent += `
      </body>
    </html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });

  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: 'savedContent.qnote',
      types: [{ description: 'QOQORO Note Files', accept: { 'text/html': ['.qnote'] } }]
    });

    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();

    console.log('File saved successfully');
  } catch (err) {
    console.error('Error saving file:', err);
  }
}
