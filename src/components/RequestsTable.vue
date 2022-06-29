<template>
  <div id="requests-table">
    <Table
      ref="requests-table"
      :key="reRender"
      row-key="id"
      :columns="requestsHeaders"
      :data="tableData"
      :disabled-hover="true"
      :update-show-children="true"
      :load-data="handleCommitData"
      @on-sort-change="sortTable"
    >
      <template slot-scope="{ row }" slot="issue">
        <Tooltip content="Pull request">
          <span v-if="row.pull" class="issue-icon"
            ><Icon type="md-git-pull-request"
          /></span>
        </Tooltip>
        <Tooltip content="Commit">
          <span v-if="row.commit" class="issue-icon"
            ><Icon type="md-git-commit"
          /></span>
        </Tooltip>
        <span style="display: flex; align-items: center" v-if="row.commitData">
          <Avatar :src="row.commitData.author.avatar" size="small" />
          &nbsp;
          <router-link
            tag="strong"
            class="engineer-login"
            style="cursor: pointer"
            :to="`/horizon/${row.commitData.author.login.toLowerCase()}`"
          >
            {{ row.commitData.author.login }}
          </router-link>
          &nbsp;
          <Tooltip :content="row.commitData.timestamp">
            <a :href="row.url" target="_blank">
              {{ row.issue }}
            </a>
          </Tooltip>
        </span>
        <a v-else :href="row.url" target="_blank">
          {{ row.issue }}
        </a>
        <Tooltip content="Merged pull request">
          <span v-if="row.state === 'closed'" class="issue-icon icon-violet"
            ><Icon type="md-git-merge"
          /></span>
        </Tooltip>
      </template>
      <template slot-scope="{ row }" slot="commits">
        <span v-if="row.commits !== null"
          ><SparkLine :commits="row.commits" :key="reRenderSparkLine"
        /></span>
        <div v-if="row.commitData">
          <ul class="commit-stats">
            <Tooltip content="Files changed">
              <li>
                <Icon type="ios-document-outline" />{{
                  row.commitData.stats.files
                }}
              </li>
            </Tooltip>
            <Tooltip content="Additions">
              <li style="color: #3bca51">
                <Icon type="ios-add" />{{ row.commitData.stats.additions }}
              </li>
            </Tooltip>
            <Tooltip content="Deletions">
              <li style="color: #ff0629">
                <Icon type="ios-remove" />{{ row.commitData.stats.deletions }}
              </li>
            </Tooltip>
          </ul>
        </div>
      </template>
      <template slot-scope="{ row }" slot="progress">
        <span v-if="row.tasks_done !== null"
          >{{ row.tasks_done }}/{{ row.tasks_done + row.tasks_not_done }}</span
        >
        <strong v-if="row.tasks_done !== null"
          >&nbsp;({{
            calculatePercent(row.tasks_done, row.tasks_not_done).toFixed(2)
          }}
          %)</strong
        >
      </template>
      <template slot-scope="{ row }" slot="stage">
        <div class="labels-container" v-if="row.stage !== null">
          <div class="label" :style="generateLabelStyles(row.stage.color)">
            {{ row.stage.name }}
          </div>
        </div>
        <Tooltip content="Repository" v-if="row.stage === null">
          <span v-if="row.commitData">
            <Icon type="md-folder" />
            &nbsp;
            <a :href="row.commitData.repo_url" target="_blank">{{
              row.commitData.repo
            }}</a>
          </span>
        </Tooltip>
      </template>
      <template slot-scope="{ row }" slot="engineers">
        <div class="engineers-container" v-if="row.engineers !== null">
          <div v-for="engineer in row.engineers" :key="engineer.login">
            <Avatar :src="engineer.avatar_url" size="small" />
            <router-link
              tag="span"
              class="engineer-login"
              style="cursor: pointer"
              :to="`/horizon/${engineer.login.toLowerCase()}`"
            >
              {{ engineer.login }}
            </router-link>
          </div>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import isDarkColor from "is-dark-color";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import { EventBus } from "@/helpers/eventBus";

import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";

import SparkLine from "@/components/SparkLine.vue";

export default {
  name: "RequestsTable",
  mixins: [notifications, octokit],
  props: {
    rawData: {
      type: Array,
    },
    engineersFilter: {
      type: Array,
    },
  },
  components: {
    SparkLine,
  },
  created() {
    EventBus.$on("export-requests", () => {
      try {
        this.$refs["requests-table"].exportCsv({
          filename: `${
            process.env.VUE_APP_ORGANISATION
          }-REQUESTS-${moment().format("DD-MM-YY")}`,
          separator: ";",
          columns: ["name", "last_commit", "progress", "stage", "engineers"],
          data: [
            {
              name: "NAME",
              last_commit: "LAST_COMMIT",
              progress: "PROGRESS",
              stage: "STAGE",
              engineers: "ENGINEER(S)",
            },
            ...this.tableData.map((entry) => ({
              name: entry.issue,
              last_commit:
                entry.last_commit !== "-" ? entry.last_commit : "N/A",
              progress: `${entry.tasks_done}/${
                entry.tasks_not_done
              } (${this.calculatePercent(
                entry.tasks_done,
                entry.tasks_not_done
              ).toFixed(2)} %)`,
              stage: entry.stage.name,
              engineers:
                entry.engineers.map((engineer) => engineer.login).join(", ") ||
                "N/A",
            })),
          ],
        });
      } catch (error) {
        this.notificationError(
          "An error occured during exporting table. Please try again."
        );
      }
    });

    this.tableData = [
      ...this.rawData.map((request) => {
        let tasksDone = 0,
          tasksNotDone = 0;

        if (request.body) {
          const workPhases = request.body.split("# Work Phases")[1];
          tasksDone = this.countInString("- [x]", workPhases);
          tasksNotDone = this.countInString("- [ ]", workPhases);
        }

        const commits =
          request.commits.length &&
          request.commits
            .flat()
            .map((commit) => commit.commit.author.date)
            .sort((a, b) => moment(b).format("X") - moment(a).format("X"));

        return {
          id: request.id,
          issue: request.title,
          url: request.html_url,
          commits,
          last_commit: commits ? moment(commits[0]).format("DD MMM YYYY") : "-",
          tasks_done: tasksDone,
          tasks_not_done: tasksNotDone,
          stage: {
            name: request.labels.find((label) => label.name.includes("STAGE"))
              .name,
            color: request.labels.find((label) => label.name.includes("STAGE"))
              .color,
          },
          engineers: request.assignees,
          children: request.pulls.length
            ? request.pulls.map((pull) => ({
                id: uuidv4(),
                issue: pull.title,
                url: pull.html_url,
                commits: null,
                last_commit: null,
                tasks_done: null,
                stage: null,
                engineers: null,
                pull: true,
                state: pull.state,
                children:
                  pull.commits.length && pull.state === "open"
                    ? pull.commits.map((commit) => ({
                        id: uuidv4(),
                        issue: commit.commit.message,
                        url: commit.html_url,
                        commits: null,
                        last_commit: null,
                        tasks_done: null,
                        stage: null,
                        engineers: null,
                        commit: true,
                        repo: pull.base.repo.name,
                        commit_sha: commit.sha,
                        _loading: false,
                        children: [],
                      }))
                    : [],
              }))
            : [],
        };
      }),
    ];

    this.reRender = !this.reRender;
  },
  data() {
    return {
      reRender: false,
      reRenderSparkLine: false,
      requestsHeaders: [
        {
          title: "Name",
          slot: "issue",
          sortable: true,
          tree: true,
          minWidth: 200,
        },
        {
          title: "Commits",
          slot: "commits",
          width: 160,
        },
        {
          title: "Last Commit",
          key: "last_commit",
          sortable: "custom",
          width: 160,
        },
        {
          title: "Progress",
          slot: "progress",
          sortable: "custom",
          width: 170,
        },
        {
          title: "Stage",
          slot: "stage",
          key: "stage",
          sortable: true,
          filters: [
            {
              label: "STAGE-1",
              value: "STAGE-1",
            },
            {
              label: "STAGE-2",
              value: "STAGE-2",
            },
            {
              label: "STAGE-3",
              value: "STAGE-3",
            },
            {
              label: "STAGE-4",
              value: "STAGE-4",
            },
          ],
          filterMultiple: true,
          filterMethod(value, row) {
            return row.stage === value;
          },
          width: 150,
        },
        {
          title: "Engineer(s)",
          slot: "engineers",
          filters: [
            ...new Set(
              this.rawData
                .map((pull) => pull.assignees.map((assignee) => assignee.login))
                .flat()
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            ),
          ].map((engineer) => {
            return {
              label: engineer,
              value: engineer,
            };
          }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.engineers
              .map((engineer) => engineer.login)
              .includes(value);
          },
          width: 150,
        },
      ],
      tableData: [],
      stageLabelColors: ["00ffff", "fffe00", "ff0ea7"],
    };
  },
  methods: {
    calculatePercent(value, value2) {
      const result = (value * 100) / (value + value2);
      return isNaN(result) ? 0 : result;
    },
    countInString(searchFor, searchIn = "") {
      let results = 0;
      let a = searchIn.indexOf(searchFor);

      while (a != -1) {
        searchIn = searchIn.slice(a * 1 + searchFor.length);
        results++;
        a = searchIn.indexOf(searchFor);
      }

      return results;
    },
    generateLabelStyles(color) {
      const value = `#${color}`;
      return {
        backgroundColor: value,
        borderColor: value === "#ffffff" ? "gray" : "transparent",
        color: isDarkColor(value) || color === "ff0ea7" ? "white" : "black",
      };
    },
    async handleCommitData(item, callback) {
      const commitData = await this.octokit.repos.getCommit({
        owner: process.env.VUE_APP_ORGANISATION,
        repo: item.repo,
        ref: item.commit_sha,
      });

      callback([
        {
          id: uuidv4(),
          issue: `commited ${moment(
            new Date(commitData.data.commit.author.date)
          ).fromNow()}`,
          url: commitData.data.html_url,
          commits: null,
          last_commit: null,
          tasks_done: null,
          stage: null,
          engineers: null,
          commitData: {
            author: {
              login: commitData.data.author.login,
              avatar: commitData.data.author.avatar_url,
            },
            stats: {
              files: commitData.data.files.length,
              additions: commitData.data.stats.additions,
              deletions: commitData.data.stats.deletions,
            },
            timestamp: moment(commitData.data.commit.author.date).format(
              "DD MMMM YYYY"
            ),
            repo: commitData.data.url
              .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
              .split("/commits")[0],
            repo_url: `https://github.com/${process.env.VUE_APP_ORGANISATION}/${
              commitData.data.url
                .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
                .split("/commits")[0]
            }`,
          },
        },
      ]);
    },
    sortTable(options) {
      if (options.column.title === "Progress") {
        this.tableData.sort((a, b) => {
          let aPerc = (a.tasks_done / (a.tasks_done + a.tasks_not_done)) * 100;
          let bPerc = (b.tasks_done / (b.tasks_done + b.tasks_not_done)) * 100;

          aPerc = isNaN(aPerc) ? 0 : aPerc;
          bPerc = isNaN(bPerc) ? 0 : bPerc;

          return options.order === "asc"
            ? aPerc - bPerc
            : options.order === "desc"
            ? bPerc - aPerc
            : a.id - b.id;
        });
      } else if (options.column.title === "Last Commit") {
        this.tableData.sort((a, b) => {
          const timeA = moment(a.last_commit).isValid()
            ? moment(a.last_commit).unix()
            : 0;
          const timeB = moment(b.last_commit).isValid()
            ? moment(b.last_commit).unix()
            : 0;

          return options.order === "asc" ? timeA - timeB : timeB - timeA;
        });
      }

      this.reRenderSparkLine = !this.reRenderSparkLine;
    },
  },
};
</script>
