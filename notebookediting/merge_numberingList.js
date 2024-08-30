function mergeListItems() {
    const pagebooks = document.querySelectorAll('div.pagebook');
    pagebooks.forEach(pagebook => {
        const listGroups = {};
        // Group lists by list_id and type (ol or ul)
        pagebook.querySelectorAll('ol, ul').forEach(list => {
            const listId = list.getAttribute('list_id') || list.querySelector('li[list_id]')?.getAttribute('list_id');
            const listType = list.tagName.toLowerCase();
            if (listId) {
                if (!listGroups[listId]) {
                    listGroups[listId] = {};
                }
                if (!listGroups[listId][listType]) {
                    listGroups[listId][listType] = [];
                }
                listGroups[listId][listType].push(list);
            }
        });
        // Merge lists with the same list_id and type
        Object.values(listGroups).forEach(typeGroup => {
            ['ol', 'ul'].forEach(listType => {
                const group = typeGroup[listType];
                if (group && group.length > 1) {
                    const firstList = group[0];
                    group.slice(1).forEach(list => {
                        while (list.firstChild) {
                            firstList.appendChild(list.firstChild);
                        }
                        list.parentNode.removeChild(list);
                    });
                }
            });
        });
        // Handle orphaned list items
        const orphanedItems = pagebook.querySelectorAll('li[list_id]:not(ol > li, ul > li)');
        orphanedItems.forEach(item => {
            const listId = item.getAttribute('list_id');
            const correspondingList = pagebook.querySelector(`ol[list_id="${listId}"], ul[list_id="${listId}"]`) || 
                                      pagebook.querySelector(`ol li[list_id="${listId}"], ul li[list_id="${listId}"]`)?.closest('ol, ul');
            if (correspondingList) {
                correspondingList.appendChild(item);
            } else {
                // Create a new list if no corresponding list exists
                const newList = document.createElement(item.hasAttribute('list_index') ? 'ol' : 'ul');
                newList.setAttribute('list_id', listId);
                newList.appendChild(item);
                pagebook.insertBefore(newList, item.nextSibling);
            }
        });
        // Reindex and set list_id for all lists and items
        pagebook.querySelectorAll('ol, ul').forEach(list => {
            const listId = list.getAttribute('list_id') || list.querySelector('li[list_id]')?.getAttribute('list_id') || `list_${Date.now()}`;
            list.setAttribute('list_id', listId);
            const firstLi = list.querySelector('li[list_index]');
            let startIndex = firstLi ? parseInt(firstLi.getAttribute('list_index'), 10) : 1;
            if (list.tagName.toLowerCase() === 'ol') {
                list.setAttribute('start', startIndex);
            }
            list.querySelectorAll('li').forEach((item, index) => {
                item.setAttribute('list_id', listId);
                if (list.tagName.toLowerCase() === 'ol') {
                    const listIndex = startIndex + index;
                    item.setAttribute('list_index', listIndex);
                } else {
                    item.removeAttribute('list_index');
                }
            });
        });

        // Remove outer div tags except those with the class "pagebook"
        pagebook.querySelectorAll('div > ol, div > ul').forEach(list => {
            let parent = list.parentNode;
            while (parent && !parent.classList.contains('pagebook')) {
                const grandparent = parent.parentNode;
                grandparent.insertBefore(list, parent);
                if (parent.childNodes.length === 0) {
                    grandparent.removeChild(parent);
                }
                parent = grandparent;
            }
        });
    });
}

// Run the mergeListItems function every 2 seconds
setInterval(mergeListItems, 2000);