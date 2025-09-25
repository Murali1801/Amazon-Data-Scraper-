// This script listens for a message from the extension's popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeData") {
        const data = scrapeProductData();
        sendResponse({ data });
    }
    // Return true to indicate that the response will be sent asynchronously.
    return true;
});

/**
 * Scrapes all the required product data from the Amazon page.
 * @returns {object|null} A structured object with the product data or null if title is not found.
 */
function scrapeProductData() {
    /**
     * Helper function to get cleaned text from an element found by selectors.
     * It removes all newlines and collapses extra whitespace to prevent wrapping in Excel.
     * @param {string[]} selectors - An array of CSS selectors to try.
     * @returns {string} The cleaned, trimmed inner text of the found element, or an empty string.
     */
    const queryText = (selectors) => {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                // Replace newlines with a space, then collapse multiple spaces into one.
                return element.innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
            }
        }
        return '';
    };

    // --- Data Scraping ---

    // 1. Product Title
    const title = queryText(['#productTitle']);
    if (!title) return null; // Stop if no product title is found

    // 2. Product URL
    const url = window.location.href;

    // 3. MRP (List Price) - Find the strikethrough price
    const mrpText = queryText([
        '#corePriceDisplay_desktop_feature_div span.a-text-price .a-offscreen',
        '#corePrice_feature_div span.a-text-price .a-offscreen',
        '.basisPrice .a-offscreen'
    ]);
    const mrp = mrpText.replace(/[^0-9.]/g, '').split('.')[0] || '';

    // 4. Reviews (numbers) - e.g., (1,433) -> 1433
    const reviewsText = queryText(['.sc-gvLUYL.jLZItm']);
    const reviews = reviewsText.replace(/[^0-9]/g, '') || '';

    // 5. Ratings (stars) - e.g., 4
    const rating = queryText(['.sc-bYLXKk.jsyDlg']) || '';

    // 6. Rankings (two levels) - Formatted on a single line
    const formattedRank = formatRank();

    // 7. Bought in past month
    const boughtPastMonthText = queryText(['#social-proofing-faceout-title-tk_bought .a-text-bold']);
    const boughtPastMonth = boughtPastMonthText.replace(/[^0-9]/g, '') || '';
    
    // 8. Unit Sales
    const unitSales = queryText(['.sc-puOct.eeNUl']) || '';

    // Assemble the final data object for the popup
    return {
        title,
        url,
        otherData: [
            mrp,
            reviews,
            rating,
            formattedRank,
            boughtPastMonth,
            unitSales
        ]
    };
}

/**
 * Finds and formats the Best Sellers Rank data.
 * @returns {string} A string with each rank on a single line, separated by a space.
 */
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

    // Join with a space to ensure a single line.
    return ranks.join(' ');
}

