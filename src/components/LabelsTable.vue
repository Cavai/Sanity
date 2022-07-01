<template>
  <div id="labels-table">
    <Spinner v-if="showSpinner" />
    <Alert
      v-if="error.show"
      :type="error.type"
      show-icon
      class="error_container"
    >
      {{ error.title }}
      <span slot="desc">{{ error.message }}</span>
    </Alert>
    <Form label-position="top" inline class="sub-menu">
      <FormItem label="Name">
        <div class="label-name-form-item">
          <Input placeholder="Enter text..." />
          <span id="picker-button">😀</span>
        </div>
        <div class="picker">
          <VEmojiPicker v-click-outside="pickerHandler" v-show="showEmojiPicker" @select="selectEmoji" />
        </div>
      </FormItem>
      <FormItem label="Description">
        <Input placeholder="Enter text..." />
      </FormItem>
      <FormItem label="Color">
        <ColorPicker />
      </FormItem>
      <FormItem style="margin-top: 23px">
        <Button
          class="sub-menu-copy"
          >Add</Button
        >
      </FormItem>
    </Form>
    <Table
      ref="labels-table"
      :columns="columns"
      :data="tableData"
      :disabled-hover="true"
      :update-show-children="true"
    >
      <template slot-scope="{ row }" slot="label">
        <div
          class="label"
          :style="generateLabelStyles(row.color)"
        >
          {{ getLabelName(row.label) }}
        </div>
      </template>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template slot-scope="{ row }" slot="actions">
        <Button
          class="labels-action-button"
          >Edit</Button
        >
        <Button
          class="labels-action-button"
          >Remove</Button
        >
      </template>
    </Table>
  </div>
</template>

<script>
import Spinner from "@/components/Spinner.vue";

import octokit from "@/mixins/octokit";

import isDarkColor from "is-dark-color";

import { VEmojiPicker } from 'v-emoji-picker';

const emojiDict = require("emoji-dictionary");

export default {
  name: "RepositoriesTable",
  props: ["repository"],
  mixins: [octokit],
  components: {
    Spinner,
    VEmojiPicker
  },
  mounted() {
    const repositoryLabels = this.$store.state.cachedRepositories.find((repository) => repository.name === this.repository)?.labels;

    if (!repositoryLabels) {
      this.showSpinner = true;

      this.octokit.issues
        .listLabelsForRepo({
          owner: process.env.VUE_APP_ORGANISATION,
          repo: this.repository,
          per_page: 100,
        })
        .then((response) => {
          const repositories = this.$store.state.cachedRepositories;
          const repository = repositories.find((repository) => repository.name === this.repository);

          repository.labels = response.data;

          this.$store.commit(
            "setCachedRepositories",
            repositories.sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
          );

          this.tableData = response.data.map((label => {
            return {
              label: label.name,
              color: label.color,
              description: label.description,
            }
          }));

          this.showSpinner = false;
        })
        .catch(() => {
          this.showAlert(
            `An error has occured with the data fetch`,
            `Please try again in a few minutes.`,
            "error"
          );

          return;
        });
    } else {
      const labels = this.$store.state.cachedRepositories.find((repository) => repository.name === this.repository).labels;

      this.tableData = labels.map((label => {
        return {
          label: label.name,
          color: label.color,
          description: label.description,
        }
      }));
    }
  },
  data() {
    return {
      error: {
        show: false,
        title: "Service temporarily unavailable",
        message: "Please try again in a few minutes.",
        type: "error",
      },
      showSpinner: false,
      showEmojiPicker: false,
      columns: [
        {
          title: "Label",
          key: "label",
          slot: "label",
          sortable: true,
          sortMethod(a, b, type) {
            if (type === "asc") {
              return a.toLowerCase().localeCompare(b.toLowerCase());
            } else {
              return b.toLowerCase().localeCompare(a.toLowerCase());
            }
          },
          width: 300,
        },
        {
          title: "Description",
          key: "description",
        },
        {
          title: "Actions",
          slot: "actions",
          width: 250,
        }
      ],
      tableData: [],
    }
  },
  methods: {
    pickerHandler(event) {
      if (event.target.id === 'picker-button') {
        this.showEmojiPicker = true;
      } else {
        this.showEmojiPicker = false;
      }
    },
    selectEmoji(emoji) {
      console.log(emoji)
    },
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
    showAlert(title, message, type) {
      this.error.title = title ?? this.error.title;
      this.error.message = message ?? this.error.message;
      this.error.type = type ?? this.error.type;

      this.showSpinner = false;
      this.error.show = true;
    },
  }
}
</script>
