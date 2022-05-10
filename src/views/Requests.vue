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
      <RequestsTable />
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
      }
    }
  },
  methods: {
    getInitialData() {
      const labels = ['STAGE-1', 'STAGE-2', 'STAGE-3'];

      const requestsData = this.$store.state.cachedIssues.find(repo => repo.repo === 'Requests');
      const requestsIssues = requestsData.data.filter(issue => issue.labels.filter(label => labels.includes(label.name)).length);

      console.log(requestsIssues);
    }
  }
}
</script>
