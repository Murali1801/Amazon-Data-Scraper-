document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copyButton');
    const status = document.getElementById('status');

    copyButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0] || !tabs[0].id) {
                status.textContent = 'Cannot access current tab.';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, (response) => {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Error: Refresh page and try again.';
                    console.error("Error from content script:", chrome.runtime.lastError.message);
                    return;
                }
                
                if (response && response.data && typeof response.data === 'object') {
                    copyDataAsRichText(response.data);
                    status.textContent = 'Copied to clipboard!';
                    setTimeout(() => status.textContent = '', 2000);
                } else {
                    status.textContent = 'No data found on the page.';
                }
            });
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
        const titleHtml = `<a href="${data.url}">${data.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`;
        const otherCellsHtml = data.otherData.map(item => `<td>${String(item).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('');
        const tableHtml = `<table><tbody><tr><td>${titleHtml}</td>${otherCellsHtml}</tr></tbody></table>`;
        
        // 2. Create the plain text version as a fallback.
        const plainText = [data.title, ...data.otherData].join('\t');

        // Set both formats on the clipboard. Excel and Sheets prefer the HTML version.
        e.clipboardData.setData('text/html', tableHtml);
        e.clipboardData.setData('text/plain', plainText);
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
}

