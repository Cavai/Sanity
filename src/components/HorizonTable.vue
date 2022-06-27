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
      <template slot-scope="{ row }" slot="branch">
        <a :href="row.branch_url" target="_blank">{{ row.branch }}</a>
      </template>
      <template slot-scope="{ row }" slot="repository">
        <a :href="row.repository_url" target="_blank">{{ row.repository }}</a>
      </template>
      <template slot-scope="{ row }" slot="details">
        <ul class="commit-stats">
          <Tooltip content="Files changed">
            <li><Icon type="ios-document-outline" />{{ row.files }}</li>
          </Tooltip>
          <Tooltip content="Additions">
            <li style="color: #3bca51">
              <Icon type="ios-add" />{{ row.stats.additions }}
            </li>
          </Tooltip>
          <Tooltip content="Deletions">
            <li style="color: #ff0629">
              <Icon type="ios-remove" />{{ row.stats.deletions }}
            </li>
          </Tooltip>
        </ul>
      </template>
    </Table>
  </div>
</template>

<script>
import moment from "moment";

import octokit from "@/mixins/octokit";

export default {
  name: "HorizonTable",
  mixins: [octokit],
  props: ["commitsData"],
  async mounted() {
    const commits = this.commitsData
      .map((repo) =>
        repo.commits.map((commit) => ({
          ...commit,
          branch: repo.branch,
          repo: repo.repo,
        }))
      )
      .flat()
      .map((commit) => {
        return {
          sha: commit.sha,
          date: moment(new Date(commit.commit.author.date)).format("LLLL"),
          commit: commit.commit.message,
          url: commit.html_url,
          repository: commit.repo,
          repository_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${commit.repo}`,
          branch: commit.branch,
          branch_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${commit.repo}/tree/${commit.branch}`,
        };
      })
      .sort((commit) => {
        return commit.branch === "main" || commit.branch === "master" ? 1 : -1;
      })
      .filter(
        (commit, index, commits) =>
          commits.findIndex((commit2) => commit2.sha === commit.sha) === index
      );

    const commitsDetailsPromises = [];

    commits.forEach((commit) => {
      commitsDetailsPromises.push(
        this.octokit.repos.getCommit({
          owner: process.env.VUE_APP_ORGANISATION,
          repo: commit.repository,
          ref: commit.sha,
        })
      );
    });

    const commitsDetails = await Promise.all(commitsDetailsPromises);

    this.tableData = commits.map((commit, index) => {
      return {
        ...commit,
        stats: commitsDetails[index].data.stats,
        files: commitsDetails[index].data.files.length,
      };
    });
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
          title: "Branch",
          key: "branch",
          slot: "branch",
          sortable: true,
          filters: [
            ...new Set(this.commitsData.map((entry) => entry.branch)),
          ].map((branch) => {
            return {
              label: branch,
              value: branch,
            };
          }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.branch === value;
          },
          width: 250,
        },
        {
          title: "Repository",
          key: "repository",
          slot: "repository",
          sortable: true,
          filters: [
            ...new Set(this.commitsData.map((entry) => entry.repo)),
          ].map((repository) => {
            return {
              label: repository,
              value: repository,
            };
          }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.repository === value;
          },
          width: 250,
        },
        {
          title: "Details",
          key: "details",
          slot: "details",
          width: 200,
        },
      ],
    };
  },
};
</script>

<style></style>
