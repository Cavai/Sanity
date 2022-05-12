<template>
  <div id="requests">
    <Alert
      v-if="error.show"
      type="error"
      show-icon
      class="error_container"
    >
      {{ error.message }}
      <span slot="desc">
        Please try again in a few minutes.
      </span>
    </Alert>
    <Header />
    <div class="sub-header">
      <h2>Requests</h2>
    </div>
    <div class="requests-content">
      <RequestsTable :rawData="rawData" />
    </div>
  </div>
</template>

<script>
import octokit from '@/mixins/octokit';

import Header from '@/components/Header.vue';
import RequestsTable from '@/components/RequestsTable.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Requests',
  components: {
    Header,
    RequestsTable,
  },
  mixins: [octokit],
  data() {
    return {
      error: {
        show: false,
        message: 'Service temporarily unavailable',
      },
      rawData: [],
      additionalData: [],
    }
  },
  methods: {
    async prepareCommits() {
      if (!sessionStorage.getItem('cachedCommits')) {
        const commitsPromises = this.$store.state.cachedPullRequests.map(pull => {
            return this.octokit.pulls.listCommits({
              owner: "Cavai",
              repo: pull.repo,
              pull_number: pull.id,
              per_page: 100
            });
          });

          const commits = await Promise.allSettled(commitsPromises);
          sessionStorage.setItem('cachedCommits', JSON.stringify(commits.map(commit => commit.value.data)));
      }

      return JSON.parse(sessionStorage.getItem('cachedCommits'));
    },
    async getInitialData() {
      const commits = await this.prepareCommits();
      const aggregator = this.$store.state.cachedPullRequests.map((pull, index) => {
        return {
          ...pull,
          commits: commits[index]
        }
      });

      const labels = ['STAGE-1', 'STAGE-2', 'STAGE-3'];

      const requestsData = this.$store.state.cachedIssues.find(repo => repo.repo === 'Requests');
      const requestsDataFiltered = requestsData.data.filter(issue => issue.labels.filter(label => labels.includes(label.name)).length);

      this.rawData = requestsDataFiltered.map(request => {
        const matchedPRs = aggregator.filter(pr => pr.data.title.includes(request.title.split(']')[0]));
        return {
          ...request,
          pulls: matchedPRs.map(pr => pr.data),
          commits: matchedPRs.map(pr => pr.commits),
        }
      });
    }
  }
}
</script>
