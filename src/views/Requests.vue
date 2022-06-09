<template>
  <div id="requests">
    <Spinner v-if="showSpinner && !rawData.length" />
    <Alert
      v-if="error.show"
      :type="error.type"
      show-icon
      class="error_container"
    >
      {{ error.title }}
      <span slot="desc">{{ error.message }}</span>
    </Alert>
    <Header />
    <div class="sub-header">
      <h2>Requests</h2>
    </div>
    <div class="requests-content">
      <RequestsTable v-if="rawData.length" :rawData="rawData" />
      <span class="no-data" v-if="!showSpinner && !rawData.length"
        >No data</span
      >
    </div>
  </div>
</template>

<script>
import octokit from "@/mixins/octokit";

import Header from "@/components/Header.vue";
import RequestsTable from "@/components/RequestsTable.vue";
import Spinner from "@/components/Spinner.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Requests",
  components: {
    Header,
    RequestsTable,
    Spinner,
  },
  mixins: [octokit],
  data() {
    return {
      additionalData: [],
      error: {
        show: false,
        title: "Service temporarily unavailable",
        message: "Please try again in a few minutes.",
        type: "error",
      },
      rawData: [],
      showSpinner: true,
    };
  },
  methods: {
    async getInitialData() {
      try {
        const commits = await this.prepareCommits();
        const aggregator = this.$store.state.cachedPullRequests
          .filter((pull) => pull.data.title.includes("RFC"))
          .map((pull, index) => {
            return {
              ...pull,
              commits: commits[index],
            };
          });

        // Request labels
        const labels = ["STAGE-1", "STAGE-2", "STAGE-3"];

        const requestsData = this.$store.state.cachedIssues.find(
          (repo) => repo.repo === "Requests"
        );

        if (!requestsData) {

          this.showAlert(
            `Your organisation doesn't have Requests repository`,
            `Requests repository is required for Sanity work.`,
            'warning',
          );

          return false;
        }

        const requestsDataFiltered = requestsData.data.filter(
          (issue) =>
            issue.labels.filter((label) => labels.includes(label.name)).length
        );

        this.rawData = requestsDataFiltered.map((request) => {
          const matchedPRs = aggregator.filter((pr) =>
            pr.data.title.includes(request.title.split("]")[0])
          );

          return {
            ...request,
            pulls: matchedPRs.map((pr) => ({ ...pr.data, commits: pr.commits })),
            commits: matchedPRs.map((pr) => pr.commits).flat(),
          };
        });

        this.showSpinner = false;
      } catch(error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          'error'
        );

        return;
      }
    },
    async prepareCommits() {
      try {

        if (!sessionStorage.getItem("cachedCommits")) {
          const commitsPromises = this.$store.state.cachedPullRequests
            .filter((pull) => pull.data.title.includes("RFC"))
            .map((pull) => {
              return this.octokit.pulls.listCommits({
                owner: process.env.VUE_APP_ORGANISATION,
                repo: pull.repo,
                pull_number: pull.id,
                per_page: 50,
              });
            });

          const commits = await Promise.allSettled(commitsPromises);
          sessionStorage.setItem(
            "cachedCommits",
            JSON.stringify(commits.map((commit) => commit.value.data))
          );
        }

      } catch(error) {

        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          'error'
        );

        return;
      }

      return JSON.parse(sessionStorage.getItem("cachedCommits"));
    },
    showAlert(title, message, type) {
      this.error.title = title ?? this.error.title;
      this.error.message = message ?? this.error.message;
      this.error.type = type ?? this.error.type;

      this.showSpinner = false;
      this.error.show = true;
    },
  },
};
</script>
