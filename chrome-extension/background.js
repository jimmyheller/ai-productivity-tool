// chrome-extension/background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Productivity Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
    if (chrome.sidePanel) {
        chrome.sidePanel.setOptions({
            tabId: tab.id,
            path: 'panel.html',
            enabled: true
        });
        chrome.sidePanel.open({ tabId: tab.id });
    }
});
