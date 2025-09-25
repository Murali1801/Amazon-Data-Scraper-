# Amazon Data Scraper

This is a Chrome extension that scrapes product data from Amazon product pages and copies it to the clipboard in a format suitable for pasting into spreadsheet applications.

## Features

*   Scrapes the following product data:
    *   Product Title (with a hyperlink to the product page)
    *   Product URL
    *   MRP (Manufacturer's Suggested Retail Price)
    *   Total number of reviews
    *   Star rating
    *   Best Sellers Rank
    *   Number of units bought in the past month
*   Copies data in a rich text format, which preserves the hyperlink when pasted into applications like Excel or Google Sheets.
*   Supports multiple Amazon domains, including:
    *   `amazon.com`
    *   `amazon.in`
    *   `amazon.co.uk`
    *   `amazon.de`
    *   `amazon.ca`
    *   `amazon.com.au`
    *   `amazon.fr`
    *   `amazon.it`
    *   `amazon.es`
    *   `amazon.co.jp`

## Installation

1.  Download or clone this repository to your local machine.
2.  Open the Google Chrome browser and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** by clicking the toggle switch at the top right of the page.
4.  Click the **Load unpacked** button and select the directory where you saved the project files.
5.  The extension should now be installed and visible in your extensions list.

## Usage

1.  Navigate to any product page on a supported Amazon website.
2.  Click on the Amazon Data Scraper extension icon in your Chrome toolbar.
3.  Click the **Copy Data** button in the popup.
4.  The product data will be copied to your clipboard. You can then paste it into a spreadsheet or any other destination.

## File Structure

*   `manifest.json`: The manifest file for the Chrome extension. It defines the extension's name, version, permissions, and other metadata.
*   `popup.html`: The HTML file for the extension's popup.
*   `popup.js`: The JavaScript file for the extension's popup. It handles user interaction and communication with the content script.
*   `content.js`: The content script that is injected into Amazon product pages. It scrapes the product data from the page.
*   `style.css`: The stylesheet for the extension's popup.
*   `amzn.html`: An HTML file, likely for testing or development purposes.
*   `images/`: A directory containing the extension's icons.
