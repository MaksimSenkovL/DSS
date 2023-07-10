export default class GitHubAPIRequester {
    static async getRepositoryInfo(url) {
        const projectLabel = this.#extractProjectLabel(url);

        let response = await fetch(this.#createURLForFullRepositoryInfo(projectLabel));

        response = await response.json();

        const contirbutorsCount = await this.#countContributors(projectLabel);

        const repositoryInfo = {
            label: response.name,
            forks: response.forks,
            stars: response.stargazers_count,
            watch: response.subscribers_count,
            href: url.href,
            contributors: contirbutorsCount,
        };

        return repositoryInfo;
    }

    static #extractProjectLabel(url) {
        const pathName = url.pathname.split("/");

        const projectLabel = `${pathName[1]}/${pathName[2]}`;

        return projectLabel;
    }
    static #createURLForFullRepositoryInfo(projectLabel) {
        return `https://api.github.com/repos/${projectLabel}`;
    }

    static async #countContributors(projectLabel) {
        const contributorsPerPage = 30;

        const firstContributorsInfoRequest = await fetch(this.#createURLForContributorsInfo(projectLabel));

        const linkToLastPage = new Headers(firstContributorsInfoRequest.headers)
            .get("link")
            .split(" ")[2]
            .slice(1, this.length - 2);

        const totalPages = new URL(linkToLastPage).searchParams.get("page");

        const lastContributorsInfoRequest = await fetch(linkToLastPage);
        const contributorsOnLastPage = await lastContributorsInfoRequest.json();

        const totalCount = contributorsPerPage * totalPages + contributorsOnLastPage.length;

        return totalCount;
    }

    static #createURLForContributorsInfo(projectLabel) {
        return `https://api.github.com/repos/${projectLabel}/contributors`;
    }
}
