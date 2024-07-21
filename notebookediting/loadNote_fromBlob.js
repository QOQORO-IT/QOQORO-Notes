// Function to load saved content from a Blob
function loadSavedContentFromBlob(blob) {
    const oldContainer = document.querySelector('.MainContainer');
    const reader = new FileReader();

    oldContainer.innerHTML = "";

    reader.onload = function(e) {
      const content = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      const mainContainer = doc.querySelector('.MainContainer');

      if (mainContainer) {
        for (const child of mainContainer.children) {
          oldContainer.appendChild(child.cloneNode(true));
        }
        console.log(oldContainer.innerHTML);
      } else {
        console.warn("The uploaded HTML doesn't contain a '.MainContainer' element.");
      }
    };

    reader.readAsText(blob);
  }

  // Define the handleClick function and attach it to the window object
  window.handleClick = function(filename) {
    console.log("Clicked:", filename);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://127.0.0.1:5000/get_file_content?filename=${filename}`);
    xhr.responseType = 'blob'; // Set response type to Blob

    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = xhr.response;

        // Load the saved content from the Blob
        loadSavedContentFromBlob(blob);

      } else {
        console.error('Error fetching file content:', xhr.statusText);
      }
    };

    xhr.onerror = function () {
      console.error('Network error:', xhr.statusText);
    };

    xhr.send();
  }

    // Define the handleClick function and attach it to the window object
    window.handleClick_forNote = function(filename) {
      console.log("Clicked:", filename);
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `http://127.0.0.1:5000/get_file_content?filename=${filename}`);
      xhr.responseType = 'blob'; // Set response type to Blob
  
      xhr.onload = function () {
        if (xhr.status === 200) {
          const blob = xhr.response;
  
          // Load the saved content from the Blob
          loadSavedContentFromBlob(blob);
  
        } else {
          console.error('Error fetching file content:', xhr.statusText);
        }
      };
  
      xhr.onerror = function () {
        console.error('Network error:', xhr.statusText);
      };
  
      xhr.send();
    }

    function note_Linker() {
      window.handleClick_forNote("HSE/Audit Sistem Manajemen K3_Kemenaker/Referensi Audit Sistem Manajemen K3 (SMK3)_test2.qnote");
    }