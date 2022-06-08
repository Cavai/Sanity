<template>
  <div id="requests-table">
    <Table
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
          <span v-if="row.pull" class="issue-icon"><Icon type="md-git-pull-request" /></span>
        </Tooltip>
        <Tooltip content="Commit">
          <span v-if="row.commit" class="issue-icon"><Icon type="md-git-commit" /></span>
        </Tooltip>
          <span v-if="row.commitData">
            <Avatar :src="row.commitData.authorAvatar" size="small" />
            &nbsp;
            <strong class="engineer-login">{{ row.commitData.author }}</strong>
          </span>
          <a :href="row.url" target="_blank">
            {{ row.issue }}
          </a>
          <Tooltip content="Merged pull request">
            <span v-if="row.state === 'closed'" class="issue-icon icon-violet"><Icon type="md-git-merge" /></span>
          </Tooltip>
      </template>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template slot-scope="{ row }" slot="commits">
        <span v-if="row.commits !== null"><SparkLine :commits="row.commits" :key="reRenderSparkLine" /></span>
        <div v-if="row.commitData">
          <ul class="commit-stats">
            <li><Icon type="ios-document-outline" />{{ row.commitData.stats.files }}</li>
            <li style="color: #3bca51;">
              <Icon type="ios-add" />{{ row.commitData.stats.additions }}
            </li>
            <li style="color: #ff0629;">
              <Icon type="ios-remove" />{{ row.commitData.stats.deletions }}
            </li>
          </ul>
        </div>
      </template>
      <template slot-scope="{ row }" slot="progress">
        <span v-if="row.tasks_done !== null">{{ row.tasks_done }}/{{ row.tasks_done + row.tasks_not_done}}</span>
        <strong v-if="row.tasks_done !== null">&nbsp;({{ calculatePercent(row.tasks_done, row.tasks_not_done).toFixed(2) }} %)</strong>
      </template>
      <template slot-scope="{ row }" slot="stage">
        <div class="labels-container" v-if="row.stage !== null">
          <div
            class="label"
            :style="generateLabelStyles(row.stage, getStageLabelColor(row.stage))"
          >
            {{ row.stage }}
          </div>
        </div>
      </template>
      <template slot-scope="{ row }" slot="engineers">
        <div class="engineers-container" v-if="row.engineers !== null">
          <div v-for="engineer in row.engineers" :key="engineer.login">
            <Avatar :src="engineer.avatar_url" size="small" />
            <span class="engineer-login">{{ engineer.login }}</span>
          </div>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import isDarkColor from 'is-dark-color';
import moment from 'moment';
import { v4 as uuidv4 } from "uuid";

import octokit from '@/mixins/octokit';

import SparkLine from '@/components/SparkLine.vue';

export default {
  name: 'RequestsTable',
  mixins: [octokit],
  props: {
    rawData: {
      type: Array
    }
  },
  components: {
    SparkLine,
  },
  data () {
    return {
      reRender: false,
      reRenderSparkLine: false,
      requestsHeaders: [
        {
          title: 'Name',
          slot: 'issue',
          sortable: true,
          tree: true,
          minWidth: 200,
        },
        {
          title: 'Commits',
          slot: 'commits',
          width: 160,
        },
        {
          title: 'Last Commit',
          key: 'last_commit',
          sortable: 'custom',
          width: 160,
        },
        {
          title: 'Progress',
          slot: 'progress',
          sortable: 'custom',
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
              value: "STAGE-1"
            },
            {
              label: "STAGE-2",
              value: "STAGE-2"
            },
            {
              label: "STAGE-3",
              value: "STAGE-3"
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
          width: 150,
        }
      ],
      tableData: [],
      stageLabelColors: ['00ffff', 'fffe00', 'ff0ea7']
    }
  },
  methods: {
    calculatePercent(value, value2) {
      const result = (value * 100 / (value + value2));
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
    generateLabelStyles(name, color) {
      const value = `#${color}`;
      return {
        backgroundColor: value,
        borderColor: value === "#ffffff" ? "gray" : "transparent",
        color: isDarkColor(value) || color === 'ff0ea7' ? "white" : "black",
        width:
          name.length > 20 ? `${name.length * 8}px` : `${name.length * 15}px`
      };
    },
    getStageLabelColor(stage) {
      switch(stage) {
        case 'STAGE-1':
          return this.stageLabelColors[0];
        case 'STAGE-2':
          return this.stageLabelColors[1];
        case 'STAGE-3':
          return this.stageLabelColors[2];
      }
    },
    async handleCommitData (item, callback) {
      const commitData = await this.octokit.repos.getCommit({
        owner: process.env.VUE_APP_ORGANISATION,
        repo: item.repo,
        ref: item.commit_sha
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
            author: commitData.data.author.login,
            authorAvatar: commitData.data.author.avatar_url,
            stats: {
              files: commitData.data.files.length,
              additions: commitData.data.stats.additions,
              deletions: commitData.data.stats.deletions,
            },
            timestamp: moment(commitData.data.commit.author.date).format("dddd, MMMM Do YYYY, h:mm:ss a")
          }
        }
      ]);
    },
    sortTable(options) {
      if (options.column.title === 'Progress') {
        if (options.order === 'asc') {
          this.tableData.sort((a, b) => {
            let aPerc = (a.tasks_done / (a.tasks_done + a.tasks_not_done)) * 100;
            let bPerc = (b.tasks_done / (b.tasks_done + b.tasks_not_done)) * 100;

            aPerc = isNaN(aPerc) ? 0 : aPerc;
            bPerc = isNaN(bPerc) ? 0 : bPerc;

            return aPerc - bPerc;
          });
        } else if (options.order === 'desc') {
          this.tableData.sort((a, b) => {
            let aPerc = (a.tasks_done / (a.tasks_done + a.tasks_not_done)) * 100;
            let bPerc = (b.tasks_done / (b.tasks_done + b.tasks_not_done)) * 100;

            aPerc = isNaN(aPerc) ? 0 : aPerc;
            bPerc = isNaN(bPerc) ? 0 : bPerc;

            return bPerc - aPerc;
          });
        } else {
          this.tableData.sort((a, b) => {
            return a.id - b.id;
          });
        }
      } else if (options.column.title === 'Last Commit') {
        if (options.order === 'asc') {
          this.tableData.sort((a, b) => {
            const timeA = moment(a.last_commit).unix();
            const timeB = moment(b.last_commit).unix();

            return (timeA ? timeA : 0) - (timeB ? timeB: 0);
          });
        } else if (options.order === 'desc') {
          this.tableData.sort((a, b) => {
            const timeA = moment(a.last_commit).unix();
            const timeB = moment(b.last_commit).unix();

            return (timeB ? timeB : 0) - (timeA ? timeA: 0);
          });
        }
      }

      this.reRenderSparkLine = !this.reRenderSparkLine;
    }
  },
  watch: {
    rawData() {
      this.tableData = [...this.rawData.map(request => {

        const workPhases = request.body.split("# Work Phases")[1];
        const tasksDone = this.countInString("- [x]", workPhases);
        const tasksNotDone = this.countInString("- [ ]", workPhases);

        const commits = request.commits.length && request.commits.flat().map(commit => commit.commit.author.date).sort((a, b) => moment(b).format('X') - moment(a).format('X'));

        return {
          id: request.id,
          issue: request.title,
          url: request.html_url,
          commits,
          last_commit: commits ? moment(commits[0]).format('DD MMM YYYY') : '-',
          tasks_done: tasksDone,
          tasks_not_done: tasksNotDone,
          stage: request.labels.find(label => label.name.includes('STAGE')).name,
          engineers: request.assignees,
          children: request.pulls.length ? request.pulls.map(pull => ({
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
              children: pull.commits.length && pull.state === 'open' ? pull.commits.map(commit => ({
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
                children: []
              })) : [],
            }))
          : [],
        }
      })];

      this.reRender = !this.reRender;
    }
  }
}
</script>
