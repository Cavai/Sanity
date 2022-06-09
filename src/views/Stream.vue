<template>
  <div id="stream">
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
      <h2>Stream</h2>
    </div>
    <div class="stream-content">
      <StreamTable v-if="rawData.length" :rawData="rawData" />
      <span class="no-data" v-if="!showSpinner && !rawData.length"
        >No data</span
      >
    </div>
  </div>
</template>

<script>
import moment from "moment";

import Header from "@/components/Header.vue";
import Spinner from "@/components/Spinner.vue";
import StreamTable from "@/components/StreamTable.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Stream",
  components: {
    Header,
    Spinner,
    StreamTable,
  },
  created() {
    try {
      const pullsData = this.$store.state.cachedPullRequests
        .map((pull) => {
          return {
            id: pull.id,
            title: pull.data.title,
            url: pull.data.html_url,
            type: "Pull Request",
            repository: pull.repo,
            repository_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${pull.repo}`,
            last_activity: moment(pull.data.updated_at).format("DD MMM YYYY"),
            labels: pull.data.labels,
            author: pull.data.user,
            assignees: pull.data.assignees,
          };
        })
        .filter((pull) => {
          return !pull.author.login.includes("dependabot");
        });

      const issuesData = this.$store.state.cachedIssues.map((issues) => {
        return issues.data.map((issue) => {
          return {
            id: issue.id,
            title: issue.title,
            url: issue.html_url,
            type: "Issue",
            repository: issues.repo,
            repository_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${issues.repo}`,
            last_activity: moment(issue.updated_at).format("DD MMM YYYY"),
            labels: issue.labels,
            author: issue.user,
            assignees: issue.assignees,
          };
        });
      });

      this.rawData = [...pullsData, ...issuesData.flat()];
    } catch (error) {
      this.showAlert(
        `An error has occured with the data fetch`,
        `Please try again in a few minutes.`,
        "error"
      );

      return;
    }

    this.showSpinner = false;
  },
  data() {
    return {
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

<style></style>
