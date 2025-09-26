// Listens for messages from the popup or the background script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeData") {
        // Sent from the popup: Scrape data and send it back.
        const data = scrapeProductData();
        sendResponse({ data });
    } else if (request.action === "scrapeAndCopy") {
        // Sent from the background (shortcut): Scrape and copy directly.
        const data = scrapeProductData();
        if (data) {
            copyDataFromBackground(data);
        }
    }
    return true; // Keep message channel open for async response.
});

// Handles the direct copy action triggered by the shortcut.
function copyDataFromBackground(data) {
    const listener = (e) => {
        e.preventDefault();
        const titleHtml = `<a href="${data.url}">${data.title}</a>`;
        const otherCellsHtml = data.otherData.map(item => `<td>${item}</td>`).join('');
        const tableHtml = `<table><tbody><tr><td>${titleHtml}</td>${otherCellsHtml}</tr></tbody></table>`;
        const plainText = [data.title, ...data.otherData].join('\t');
        e.clipboardData.setData('text/html', tableHtml);
        e.clipboardData.setData('text/plain', plainText);
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
}

// Main function to scrape all data from the page.
function scrapeProductData() {
    const queryText = (selectors) => {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element.innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
            }
        }
        return '';
    };

    const title = queryText(['#productTitle']);
    if (!title) return null;

    const url = window.location.href;
    const priceText = queryText(['.a-price-whole']);
    const price = priceText.replace(/[^0-9]/g, '') || '';
    const reviewsText = queryText(['.sc-gvLUYL.jLZItm']);
    const reviews = reviewsText.replace(/[^0-9]/g, '') || '';
    const rating = queryText(['.sc-bYLXKk.jsyDlg']) || '';
    const formattedRank = formatRank();
    
    const boughtPastMonthText = queryText(['#social-proofing-faceout-title-tk_bought .a-text-bold']);
    let boughtPastMonth = '';
    if (boughtPastMonthText) {
        const rawValue = boughtPastMonthText.split(' ')[0].toLowerCase();
        if (rawValue.includes('k')) {
            const numPart = parseFloat(rawValue.replace('k', ''));
            boughtPastMonth = isNaN(numPart) ? '' : String(numPart * 1000);
        } else {
            boughtPastMonth = rawValue.replace(/[^0-9]/g, '') || '';
        }
    }
    
    const unitSales = queryText(['.sc-puOct.eeNUl']) || '';

    return {
        title,
        url,
        otherData: [price, reviews, rating, formattedRank, boughtPastMonth, unitSales]
    };
}

// Formats the Best Sellers Rank data.
function formatRank() {
    const rankElements = document.querySelectorAll('.sc-ewPHrX');
    if (!rankElements.length) return '';
    const ranks = [];
    rankElements.forEach(element => {
        const category = element.querySelector('.sc-kkdYSi')?.innerText.trim() || '';
        const rankNumber = element.querySelector('.sc-ictqDt')?.innerText.trim() || '';
        if (category && rankNumber) {
            ranks.push(`${category} ${rankNumber}`);
        }
    });
    return ranks.join(' ');
}

