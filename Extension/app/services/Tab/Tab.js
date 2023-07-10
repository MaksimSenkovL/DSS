export default class Tab {
    static async getCurrentTabURL() {
        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        return new URL(tab.url);
    }

    static isCurrentTabURLEqualsGitHubURL(url) {
        const GITHUB_PATH = "https://github.com";

        return url.origin.startsWith(GITHUB_PATH) ? true : false;
    }
}
