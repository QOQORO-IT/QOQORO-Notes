// Function to merge tables based on a unique 'table_id' attribute
function mergeTables_forTables() {
    const pagebooks = document.querySelectorAll('div.pagebook');
    pagebooks.forEach(pagebook => {
        const tableGroups = {};
        // Group tables by table_id
        pagebook.querySelectorAll('table[table_id]').forEach(table => {
            const tableId = table.getAttribute('table_id');
            if (tableId) {
                if (!tableGroups[tableId]) {
                    tableGroups[tableId] = [];
                }
                tableGroups[tableId].push(table);
            }
        });

        // Merge tables with the same table_id
        Object.values(tableGroups).forEach(group => {
            if (group.length > 1) {
                const firstTable = group[0];
                group.slice(1).forEach(table => {
                    while (table.rows.length) {
                        firstTable.appendChild(table.rows[0]);
                    }
                    table.parentNode.removeChild(table);
                });
            }
        });
    });
}

// Run the mergeTables_forTables function every 2 seconds to continually check and merge tables
setInterval(mergeTables_forTables, 2000);