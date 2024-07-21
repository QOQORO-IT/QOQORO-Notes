document.addEventListener('DOMContentLoaded', function() {
    // Periodic fetch for folder data
    setInterval(function() {
        fetch('http://127.0.0.1:5000/folders')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('data_table');
                if (data.folders && tbody.getAttribute('data-initialized') !== 'true') {
                    tbody.innerHTML = ''; // Clear for initial setup
                    renderFolders(data.folders, tbody); // Render folders and files
                    tbody.setAttribute('data-initialized', 'true');
                }
            })
            .catch(error => console.error('Error fetching folder list:', error));
    }, 5000); // Update interval

    function renderFolders(folders, container, level = 0, parentPath = '') {
        Object.entries(folders).forEach(([folderName, content]) => {
            if (folderName === 'files') {
                return; // Skip files key
            }
            const currentPath = parentPath ? `${parentPath}/${folderName}` : folderName;
            const folderRow = document.createElement('tr');
            const folderCell = document.createElement('td');
            folderCell.textContent = folderName;
            folderCell.className = 'folder-title';
            folderCell.style.paddingLeft = `${level * 20}px`;
            folderCell.style.cursor = 'pointer';
            folderRow.appendChild(folderCell);
            container.appendChild(folderRow);

            const subfolderContainer = document.createElement('tbody');
            subfolderContainer.style.display = 'none'; // Initially hidden
            container.appendChild(subfolderContainer);

            folderCell.onclick = function(event) {
                event.stopPropagation(); // Prevent bubbling
                subfolderContainer.style.display = subfolderContainer.style.display === '' ? 'none' : '';
            };

            if (content.subfolders && Object.keys(content.subfolders).length > 0) {
                renderFolders(content.subfolders, subfolderContainer, level + 1, currentPath);
            }

            if (Array.isArray(content.files) && content.files.length > 0) {
                content.files.forEach(file => {
                    const fileRow = document.createElement('tr');
                    const fileCell = document.createElement('td');
                    fileCell.textContent = file;
                    fileCell.className = 'file-title';
                    fileCell.style.paddingLeft = `${(level + 1) * 20}px`;
                    fileCell.setAttribute('data-fullpath', `${currentPath}/${file}`);

                    fileCell.onclick = function(event) {
                        event.stopPropagation(); // Prevent click from bubbling to the folder

                        // Check if the file has a ".qnote" extension
                        if (file.endsWith('.qnote')) {
                            let iframe = document.getElementById('notebook2Iframe');
                            if (!iframe) {
                                openTab('Notebook/notebook2.html');
                                iframe = document.getElementById('notebook2Iframe');
                            }

                            function invokeHandleClick(iframe, filePath) {
                                let iframeWindow = iframe.contentWindow;
                                if (iframeWindow && iframeWindow.handleClick_forNote) {
                                    iframeWindow.handleClick_forNote(filePath);
                                } else {
                                    console.error('handleClick_forNote function not found in iframe.');
                                    openTab('Notebook/notebook2.html');
                                }
                            }

                            if (iframe.contentWindow.document.readyState === 'complete') {
                                invokeHandleClick(iframe, `${currentPath}/${file}`);
                            } else {
                                iframe.onload = function() {
                                    invokeHandleClick(iframe, `${currentPath}/${file}`);
                                };
                            }
                            document.getElementById('toggle_notebook').click();
                        }
                        if (file.endsWith('.pdf')) {
                            let iframe = document.getElementById('tab_pdf');
                            if (!iframe) {
                                openTab('SUCC/pypdfium3.html');
                                iframe = document.getElementById('tab_pdf');
                            }

                            function invokeHandleClick(iframe, filePath) {
                                let iframeWindow = iframe.contentWindow;
                                if (iframeWindow && iframeWindow.handleClick) {
                                    iframeWindow.handleClick(filePath, 1);
                                } else {
                                    console.error('handleClick function not found in iframe.');
                                    openTab('SUCC/pypdfium3.html');
                                }
                            }

                            if (iframe.contentWindow.document.readyState === 'complete') {
                                invokeHandleClick(iframe, `${currentPath}/${file}`);
                            } else {
                                iframe.onload = function() {
                                    invokeHandleClick(iframe, `${currentPath}/${file}`);
                                };
                            }
                            document.getElementById('toggle_pdfview').click();
                        }
                    };

                    fileRow.appendChild(fileCell);
                    subfolderContainer.appendChild(fileRow);

                    // Adding context menu on right click
                    fileCell.addEventListener('contextmenu', function(event) {
                        event.preventDefault(); // Prevent default context menu
                        createContextMenu(event, fileCell);
                    });
                });
            }
        });
    }

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'referenceClicked') {
            // Simulate a click to toggle PDF view visibility (if applicable)
            document.getElementById('toggle_pdfview').click();
            let iframe2 = document.getElementById('tab_pdf');
            let iframeWindow = iframe2.contentWindow;
            const { fullPath, page } = event.data;

            if (iframeWindow.handleClick_forNote) {
                iframeWindow.handleClick_forNote(fullPath, page);
            } else {
                console.error("handleClick_forNote function not found.");
            }
        }
    }, false);


    function createContextMenu(event, target) {
        const fullPath = target.getAttribute('data-fullpath');

        const menu = document.createElement('ul');
        menu.style.position = 'absolute';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.backgroundColor = 'white';
        menu.style.border = '1px solid black';
        menu.style.padding = '5px';
        menu.style.borderRadius = '5px';
        menu.style.cursor = 'pointer';
        menu.style.zIndex = '1000';

        // Rename option
        // Rename option
        const renameOption = document.createElement('li');
        renameOption.textContent = 'Rename';
        renameOption.onclick = function() {
            const newName = prompt('Enter new name:');
            if (newName) {
                // Ensure fullPath is derived correctly, assuming it includes the file/folder name
                const fullPath = target.getAttribute('data-fullpath');
                const encodedFullPath = encodeURIComponent(fullPath);
                const encodedNewName = encodeURIComponent(newName);

                fetch(`http://127.0.0.1:5000/rename?oldName=${encodedFullPath}&newName=${encodedNewName}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.error) {
                            alert('Error: ' + result.error);
                        } else {
                            target.textContent = newName; // Update display name
                            alert('Renamed to: ' + newName);
                        }
                    })
                    .catch(error => console.error('Error renaming:', error));
            }
            document.body.removeChild(menu);
        };

        menu.appendChild(renameOption);

        document.body.appendChild(menu);

        // Auto-remove the menu after 3000 ms or on mouse leave
        setTimeout(() => {
            document.body.removeChild(menu);
        }, 3000);
        menu.onmouseleave = function() {
            document.body.removeChild(menu);
        };
    }
});
