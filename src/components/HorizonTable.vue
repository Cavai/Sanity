<template>
  <div id="horizon-table">
    <Table
      :columns="columns"
      :data="tableData"
      :disabled-hover="true"
      :update-show-children="true"
    >
    <template slot-scope="{ row }" slot="commit">
      <a :href="row.url" target="_blank">
        {{ row.commit }}
      </a>
    </template>
    <template slot-scope="{ row }" slot="repository">
      <a :href="row.repository_url" target="_blank">{{ row.repository }}</a>
    </template>
    </Table>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: "HorizonTable",
  props: ['commitsData'],
  created() {
    this.tableData = this.commitsData
                      .map(repo => repo.commits
                      .map(commit => ({...commit, repo: repo.repo})))
                      .flat()
                      .map(commit => {
    return {
            date: moment(new Date(commit.commit.author.date)).format("LLLL"),
            commit: commit.commit.message,
            url: commit.html_url,
            repository: commit.repo,
            repository_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${commit.repo}`,
          }
        })
  },
  data() {
    return {
      tableData: [],
      columns: [
        {
          title: "Date",
          key: "date",
          width: 300,
          sortable: true,
          sortMethod(a, b, type) {
            if (type === "asc") {
              return moment(a).unix() - moment(b).unix();
            } else {
              return moment(b).unix() - moment(a).unix();
            }
          },
        },
        {
          title: "Commit",
          key: "commit",
          slot: "commit",
          minWidth: 300,
        },
        {
          title: "Repository",
          key: "repository",
          slot: "repository",
          sortable: true,
          width: 250,
        },
      ],
    };
  },
};
</script>

<style></style>
