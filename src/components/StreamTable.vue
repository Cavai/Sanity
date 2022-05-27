<template>
  <div id="stream-table">
    <Table
      :columns="columns"
      :data="data"
      :disabled-hover="true"
    >
      <template slot-scope="{ row }" slot="title">
        <a :href="row.url" target="_blank">{{ row.title }}</a>
      </template>
      <template slot-scope="{ row }" slot="labels">
        <div class="labels-container">
          <div
            v-for="label in row.labels"
            :key="label.id"
            class="label"
            :style="generateLabelStyles(label.name, label.color)"
          >
            {{ getLabelName(label.name) }}
          </div>
        </div>
      </template>
      <template slot-scope="{ row }" slot="author">
        <div class="author-container">
          <Avatar :src="row.author.avatar_url" size="small" />
          <span class="author-login">{{ row.author.login }}</span>
        </div>
      </template>
      <template slot-scope="{ row }" slot="assignees">
        <div class="assignees-container">
          <div v-for="assignee in row.assignees" :key="assignee.login">
            <Avatar :src="assignee.avatar_url" size="small" />
            <span class="assignee-login">{{ assignee.login }}</span>
          </div>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import isDarkColor from 'is-dark-color';
import moment from 'moment';

const emojiDict = require("emoji-dictionary");

export default {
  name: 'StreamTable',
  mounted() {

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

    this.data = [...pullsData, ...issuesData.flat()];
  },
  data () {
    return {
      columns: [
        {
            title: 'Title',
            slot: 'title',
            key: 'title',
            sortable: true,
        },
        {
            title: 'Type',
            key: 'type',
            sortable: true,
            filters: [
              {
                label: "Issue",
                value: "issue"
              },
              {
                label: "Pull Request",
                value: "pull request"
              }
            ],
            filterMultiple: true,
            filterMethod(value, row) {
              return row.type.toLowerCase() === value;
            },
            width: 120,
        },
        {
            title: 'Repository',
            key: 'repository',
            sortable: true,
            width: 210,
        },
        {
            title: 'Last Activity',
            key: 'last_activity',
            sortable: true,
            sortMethod(a, b, type) {
              if (type === "asc") {
                return moment(a).unix() - moment(b).unix();
              } else {
                return moment(b).unix() - moment(a).unix();
              }
            },
            width: 160,
        },
        {
            title: 'Labels',
            slot: 'labels',
        },
        {
            title: 'Author',
            slot: 'author',
            width: 150,
        },
        {
            title: 'Assignees',
            slot: 'assignees',
            width: 150,
        },
      ],
      data: [],
    }
  },
  methods: {
    generateLabelStyles(name, color) {
      const value = `#${color}`;
      const calculateWidth = name.length > 20 ? name.length * 8 : name.length * 12;
      return {
        backgroundColor: value,
        borderColor: value === "#ffffff" ? "gray" : "transparent",
        color: isDarkColor(value) || color === 'ff0ea7' ? "white" : "black",
      };
    },
    getLabelName(name) {
      let regexp = /:.*?:/gm;
      const emojis = [...name.matchAll(regexp)];

      if (emojis.length) {
        let newName = name;

        emojis.forEach(emoji => {
          newName = newName.replaceAll(emoji[0], emojiDict.getUnicode(emoji[0].split(":")[1]));
        });

        return newName;
      }

      return name;
    }
  }
}
</script>

<style>

</style>
