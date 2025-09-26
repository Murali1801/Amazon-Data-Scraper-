document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copyButton');
    const status = document.getElementById('status');

    // Logic for the main copy button in the popup
    copyButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                // Ask the content script to scrape data and send it back
                chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, (response) => {
                    if (chrome.runtime.lastError) {
                        status.textContent = 'Error: Refresh page.';
                        console.error("Error:", chrome.runtime.lastError.message);
                        return;
                    }
                    if (response && response.data) {
                        copyDataAsRichText(response.data);
                        status.textContent = 'Copied to clipboard!';
                    } else {
                        status.textContent = 'No data found.';
                    }
                });
            }
        });
    });
});

/**
 * Copies data to the clipboard with both HTML (for rich text link) and plain text fallbacks.
 * @param {object} data - The data object from content.js, like { title: '...', url: '...', otherData: [...] }.
 */
function copyDataAsRichText(data) {
    const listener = (e) => {
        e.preventDefault();
        
        // 1. Create the HTML version for Excel/Sheets with a clickable link.
        const titleHtml = `<a href="${data.url}">${data.title}</a>`;
        const otherCellsHtml = data.otherData.map(item => `<td>${item}</td>`).join('');
        const tableHtml = `<table><tbody><tr><td>${titleHtml}</td>${otherCellsHtml}</tr></tbody></table>`;
        
        // 2. Create the plain text version as a fallback.
        const plainText = [data.title, ...data.otherData].join('\t');
        
        // Set both formats on the clipboard. Excel prefers the HTML version.
        e.clipboardData.setData('text/html', tableHtml);
        e.clipboardData.setData('text/plain', plainText);
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
}

