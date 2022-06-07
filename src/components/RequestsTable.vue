<template>
  <div id="requests-table">
    <Table
      :key="reRender"
      row-key="id"
      :columns="requestsHeaders"
      :data="tableData"
      :disabled-hover="true"
      @on-sort-change="sortTable"
    >
      <template slot-scope="{ row }" slot="issue">
        <span v-if="row.pull" class="issue-icon"><Icon type="md-git-pull-request" /></span>
        <span v-if="row.commit" class="issue-icon"><Icon type="md-git-commit" /></span>
        <a :href="row.url" target="_blank">{{ row.issue }}</a>
      </template>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template slot-scope="{ row }" slot="commits">
        <span v-if="row.commits !== null"><SparkLine :commits="row.commits" :key="reRenderSparkLine" /></span>
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

import SparkLine from '@/components/SparkLine.vue';

export default {
  name: 'RequestsTable',
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
          children: request.pulls.length ? request.pulls.filter(pull => pull.state === 'open').map(pull => ({
              id: uuidv4(),
              issue: pull.title,
              url: pull.html_url,
              commits: null,
              last_commit: null,
              tasks_done: null,
              stage: null,
              engineers: null,
              pull: true,
              children: pull.commits.length ? pull.commits.map(commit => ({
                id: uuidv4(),
                issue: commit.commit.message,
                url: commit.html_url,
                commits: null,
                last_commit: null,
                tasks_done: null,
                stage: null,
                engineers: null,
                commit: true,
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
