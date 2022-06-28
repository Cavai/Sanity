<template>
  <div id="stream-table">
    <Table :columns="columns" :data="rawData" :disabled-hover="true">
      <template slot-scope="{ row }" slot="title">
        <a :href="row.url" target="_blank">{{ row.title }}</a>
      </template>
      <template slot-scope="{ row }" slot="repository">
        <a :href="row.repository_url" target="_blank">{{ row.repository }}</a>
      </template>
      <template slot-scope="{ row }" slot="labels">
        <div class="labels-container">
          <div
            v-for="label in row.labels"
            :key="label.id"
            class="label"
            :style="generateLabelStyles(label.color)"
          >
            {{ getLabelName(label.name) }}
          </div>
        </div>
      </template>
      <template slot-scope="{ row }" slot="author">
        <div class="author-container">
          <Avatar :src="row.author.avatar_url" size="small" />
          <router-link
            tag="span"
            class="author-login"
            style="cursor: pointer"
            :to="`/horizon/${row.author.login.toLowerCase()}`"
          >
            {{ row.author.login }}
          </router-link>
        </div>
      </template>
      <template slot-scope="{ row }" slot="assignees">
        <div class="assignees-container">
          <div v-for="assignee in row.assignees" :key="assignee.login">
            <Avatar :src="assignee.avatar_url" size="small" />
            <router-link
              tag="span"
              class="assignee-login"
              style="cursor: pointer"
              :to="`/horizon/${assignee.login.toLowerCase()}`"
            >
              {{ assignee.login }}
            </router-link>
          </div>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import isDarkColor from "is-dark-color";
import moment from "moment";

const emojiDict = require("emoji-dictionary");

export default {
  name: "StreamTable",
  props: ["rawData"],
  data() {
    return {
      columns: [
        {
          title: "Title",
          slot: "title",
          key: "title",
          sortable: true,
          minWidth: 250,
        },
        {
          title: "Type",
          key: "type",
          sortable: true,
          filters: [
            {
              label: "Issue",
              value: "issue",
            },
            {
              label: "Pull Request",
              value: "pull request",
            },
          ],
          filterMultiple: true,
          filterMethod(value, row) {
            return row.type.toLowerCase() === value;
          },
          width: 120,
        },
        {
          title: "Repository",
          key: "repository",
          slot: "repository",
          sortable: true,
          filters: [...new Set(this.rawData.map((entry) => entry.repository))]
            .sort((a, b) => a.localeCompare(b))
            .map((repository) => {
              return {
                label: repository,
                value: repository,
              };
            }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.repository === value;
          },
          width: 210,
        },
        {
          title: "Last Activity",
          key: "last_activity",
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
          title: "Labels",
          slot: "labels",
          filters: [
            ...new Set(
              this.rawData
                .map((entry) => entry.labels)
                .flat()
                .map((label) => label.name)
            ),
          ]
            .sort((a, b) => a.localeCompare(b))
            .map((label) => {
              return {
                label: this.getLabelName(label),
                value: label,
              };
            }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.labels.map((label) => label.name).includes(value);
          },
          width: 240,
        },
        {
          title: "Author",
          slot: "author",
          filters: [...new Set(this.rawData.map((entry) => entry.author.login))]
            .sort((a, b) => a.localeCompare(b))
            .map((author) => {
              return {
                label: author,
                value: author,
              };
            }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.author.login === value;
          },
          width: 165,
        },
        {
          title: "Assignees",
          slot: "assignees",
          filters: [
            ...new Set(
              this.rawData
                .map((pull) => pull.assignees.map((assignee) => assignee.login))
                .flat()
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            ),
          ].map((assignee) => {
            return {
              label: assignee,
              value: assignee,
            };
          }),
          filterMultiple: true,
          filterMethod(value, row) {
            return row.assignees
              .map((assignee) => assignee.login)
              .includes(value);
          },
          width: 165,
        },
      ],
      data: [],
    };
  },
  computed: {
    repos() {
      return [...new Set(this.data.map((entry) => entry.repository))];
    },
  },
  methods: {
    generateLabelStyles(color) {
      const value = `#${color}`;
      return {
        backgroundColor: value,
        borderColor: value === "#ffffff" ? "gray" : "transparent",
        color: isDarkColor(value) || color === "ff0ea7" ? "white" : "black",
      };
    },
    getLabelName(name) {
      let regexp = /:.*?:/gm;
      const emojis = [...name.matchAll(regexp)];

      if (emojis.length) {
        let newName = name;

        emojis.forEach((emoji) => {
          newName = newName.replaceAll(
            emoji[0],
            emojiDict.getUnicode(emoji[0].split(":")[1])
          );
        });

        return newName;
      }

      return name;
    },
  },
};
</script>

<style></style>
