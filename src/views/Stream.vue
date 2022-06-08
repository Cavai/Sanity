<template>
  <div id="stream">
    <Spinner v-if="!rawData.length" />
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
      <h2>Stream</h2>
    </div>
    <div class="requests-content">
      <StreamTable v-if="rawData.length" :rawData="rawData" />
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import Header from '@/components/Header.vue';
import Spinner from '@/components/Spinner.vue';
import StreamTable from '@/components/StreamTable.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Stream',
  components: {
    Header,
    Spinner,
    StreamTable,
  },
  created() {

    const pullsData = this.$store.state.cachedPullRequests.map(pull => {
      return {
        id: pull.id,
        title: pull.data.title,
        url: pull.data.html_url,
        type: 'Pull Request',
        repository: pull.repo,
        last_activity: moment(pull.data.updated_at).format('DD MMM YYYY'),
        labels: pull.data.labels,
        author: pull.data.user,
        assignees: pull.data.assignees,
      }
    }).filter(pull => {
      return !pull.author.login.includes('dependabot');
    });

    const issuesData = this.$store.state.cachedIssues.map(issues => {
      return issues.data.map(issue => {
        return {
          id: issue.id,
          title: issue.title,
          url: issue.html_url,
          type: 'Issue',
          repository: issues.repo,
          last_activity: moment(issue.updated_at).format('DD MMM YYYY'),
          labels: issue.labels,
          author: issue.user,
          assignees: issue.assignees,
        }
      })
    });

    this.rawData = [...pullsData, ...issuesData.flat()];
  },
  data() {
    return {
      error: {
        show: false,
        message: 'Service temporarily unavailable',
      },
      rawData: [],
    }
  }
}
</script>

<style>

</style>
