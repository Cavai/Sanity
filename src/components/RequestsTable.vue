<template>
  <div id="requests-table">
    <Table :columns="requestsHeaders" :data="data1"></Table>
  </div>
</template>

<script>
export default {
  name: 'RequestsTable',
  data () {
    return {
      requestsHeaders: [
        {
          title: 'Name',
          key: 'issue',
        },
        {
          title: 'Commits',
          key: 'commits',
        },
        {
          title: 'Last Commit',
          key: 'last_commit',
        },
        {
          title: 'Progress',
          key: 'progress',
        },
        {
          title: "Stage",
          key: "stage",
        },
        {
          title: "Engineer(s)",
          key: "engineers",
        }
      ],
      data1: [
        {
          issue: 'Issue #1',
          commits: '-*-*-',
          last_commit: '2022-05-10',
          progress: '10/20 (50%)',
          stage: 'STAGE-1',
          engineers: 'CavaiDev'
        },
        {
          issue: 'Issue #2',
          commits: '-*-*-',
          last_commit: '2022-05-10',
          progress: '10/20 (50%)',
          stage: 'STAGE-1',
          engineers: 'CavaiDev'
        },
        {
          issue: 'Issue #3',
          commits: '-*-*-',
          last_commit: '2022-05-10',
          progress: '10/20 (50%)',
          stage: 'STAGE-1',
          engineers: 'CavaiDev'
        },
        {
          issue: 'Issue #4',
          commits: '-*-*-',
          last_commit: '2022-05-10',
          progress: '10/20 (50%)',
          stage: 'STAGE-1',
          engineers: 'CavaiDev'
        },
      ]
    }
}
}
</script>
