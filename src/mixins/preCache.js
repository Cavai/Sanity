import { Octokit } from "@octokit/rest";

const preCache = {
  data() {
    return {
      octokit: new Octokit({
        auth: this.$store.state.authenticationToken,
        userAgent: "Sanity v0.1",
      })
    }
  },
  methods: {
    async preCacheToolsData() {
      this.octokit.rateLimit.get().then(({ data }) => {
        this.rateLimit = data.rate.remaining;
      });

      try {
        const { data: repos } = await this.octokit.repos.listForOrg({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100,
        });

        const branchesPromises = [];

        repos.forEach((repo) => {
          branchesPromises.push(
            this.octokit.repos.listBranches({
              owner: process.env.VUE_APP_ORGANISATION,
              repo: repo.name,
            })
          );
        });

        const branches = await Promise.all(branchesPromises);

        this.$store.commit(
          "setCachedRepositories",
          repos
            .map((repo, index) => {
              return {
                ...repo,
                branches: branches[index].data,
              };
            })
            .sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
        );

        this.$store.commit("setToolsDataFetched", true);

      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        this.$store.commit("logoutUser");

        return;
      }

      this.showSpinner = false;
    },
    async preCacheData() {
      this.octokit.rateLimit.get().then(({ data }) => {
        this.rateLimit = data.rate.remaining;
      });

      // Repositories
      try {
        const { data: repos } = await this.octokit.repos.listForOrg({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100,
        });

        const branchesPromises = [];

        repos.forEach((repo) => {
          branchesPromises.push(
            this.octokit.repos.listBranches({
              owner: process.env.VUE_APP_ORGANISATION,
              repo: repo.name,
            })
          );
        });

        const branches = await Promise.all(branchesPromises);

        this.$store.commit(
          "setCachedRepositories",
          repos
            .map((repo, index) => {
              return {
                ...repo,
                branches: branches[index].data,
              };
            })
            .sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
        );

        const pullsPromises = repos.map((repo) => {
          return this.octokit.pulls.list({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            state: "open",
            per_page: 100,
          });
        });

        const closedPullsPromises = repos.map((repo) => {
          return this.octokit.pulls.list({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            state: "closed",
            per_page: 100,
          });
        });

        const issuesPromises = repos.map((repo) => {
          return this.octokit.issues.listForRepo({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            per_page: 100,
          });
        });

        // PRs
        const pulls = await Promise.allSettled(pullsPromises);
        const closedPulls = await Promise.allSettled(closedPullsPromises);

        const pullsFiltered = [...pulls, ...closedPulls]
          .map((pullData) => {
            if (pullData.value.data.length) {
              return pullData.value.data.map((pull) => {
                return {
                  id: pull.number,
                  repo: pull.base.repo.name,
                  url: pull.url,
                  data: pull,
                };
              });
            }
          })
          .filter((pulls) => pulls)
          .flat()
          .filter((pull) => {
            return (
              pull.data.state === "open" || pull.data.title.includes("RFC")
            );
          });

        this.$store.commit("setCachedPulls", pullsFiltered);

        // Issues
        const issues = await Promise.allSettled(issuesPromises);
        const issuesFiltered = issues.map((issue) => {
          return {
            repo: issue.value.url
              .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
              .split("/issues")[0],
            url: issue.value.url,
            data: issue.value.data,
          };
        });

        this.$store.commit("setCachedIssues", issuesFiltered);

        this.octokit.rateLimit.get().then(({ data }) => {
          console.log(
            `%c ** REMAINING RATE LIMIT ${data.rate.remaining} **`,
            "background: #0D47A1; color: #FFFFFF"
          );

          console.log(
            `%c ** PRE-CACHING COST ${this.rateLimit - data.rate.remaining} **`,
            "background: #0DA12F; color: #FFFFFF"
          );
        });

        this.$store.commit("setDataFetched", true);
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        this.$store.commit("logoutUser");

        return;
      }

      this.showSpinner = false;
    },
  }
}

export default preCache;
