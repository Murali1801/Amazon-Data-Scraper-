// Listens for the keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
    if (command === "copy-data-shortcut") {
      // Get the currently active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          // Send a message to the content script to scrape and copy the data directly
          chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeAndCopy" });
        }
      });
    }
  });
  
  