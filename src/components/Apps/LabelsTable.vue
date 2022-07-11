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
          <Input
            maxlength="50"
            v-model="labelName"
            placeholder="Enter text..."
            class="label-name-input"
          />
          <span class="picker-button">😀</span>
        </div>
        <div class="picker">
          <VEmojiPicker
            v-click-outside="pickerHandler"
            v-show="showEmojiPicker"
            @select="selectEmoji"
          />
        </div>
      </FormItem>
      <FormItem label="Description">
        <Input
          maxlength="100"
          v-model="labelDescription"
          placeholder="Enter text..."
          class="label-description-input"
        />
      </FormItem>
      <FormItem label="Color">
        <Icon
          @click="generateRandomColor"
          class="color-picker-repeat"
          type="ios-repeat"
          :size="20"
        />
        <ColorPicker v-model="labelColor" />
      </FormItem>
      <FormItem style="margin-top: 23px">
        <Button @click="saveLabel" class="sub-menu-copy">
          {{ editMode ? "Edit" : "Add" }}
        </Button>
      </FormItem>
      <FormItem v-if="editMode" style="margin-top: 23px">
        <Button @click="exitEditMode" class="sub-menu-copy">Cancel</Button>
      </FormItem>
      <FormItem class="label-preview" label="Preview">
        <div class="label" :style="generateLabelStyles(labelColor)">
          {{ getLabelName(labelName) || "Label Preview" }}
        </div>
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
        <div class="label" :style="generateLabelStyles(row.color)">
          {{ getLabelName(row.label) }}
        </div>
      </template>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template slot-scope="{ row }" slot="actions">
        <Button class="labels-action-button" @click="editLabel(row)"
          >Edit</Button
        >
        <Button @click="removeLabel(row)" class="labels-action-button"
          >Remove</Button
        >
      </template>
    </Table>
  </div>
</template>

<script>
import Spinner from "@/components/Spinner.vue";

import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";

import isDarkColor from "is-dark-color";

import { VEmojiPicker } from "v-emoji-picker";

const emojiDict = require("emoji-dictionary");

export default {
  name: "RepositoriesTable",
  props: ["repository"],
  mixins: [notifications, octokit],
  components: {
    Spinner,
    VEmojiPicker,
  },
  mounted() {
    const repositoryLabels = this.$store.state.cachedRepositories.find(
      (repository) => repository.name === this.repository
    )?.labels;

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
          const repository = repositories.find(
            (repository) => repository.name === this.repository
          );

          repository.labels = response.data;

          this.$store.commit(
            "setCachedRepositories",
            repositories.sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
          );

          this.tableData = response.data.map((label) => {
            return {
              label: label.name,
              color: label.color,
              description: label.description,
            };
          });

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
      const labels = this.$store.state.cachedRepositories.find(
        (repository) => repository.name === this.repository
      ).labels;

      this.tableData = labels.map((label) => {
        return {
          label: label.name,
          color: label.color,
          description: label.description,
        };
      });
    }

    this.generateRandomColor();
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
      labelName: "",
      editLabelName: "",
      labelDescription: "",
      labelColor: "",
      editMode: false,
      columns: [
        {
          title: "Label",
          key: "label",
          slot: "label",
          sortable: true,
          sortMethod(a, b, type) {
            if (type === "asc") {
              return a.toLowerCase().localeCompare(b.toLowerCase());
            }

            return b.toLowerCase().localeCompare(a.toLowerCase());
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
        },
      ],
      tableData: [],
    };
  },
  methods: {
    editLabel(label) {
      this.labelName = label.label;
      this.labelDescription = label.description;
      this.labelColor = `#${label.color}`;

      this.editLabelName = label.label;

      this.editMode = true;
    },
    exitEditMode() {
      this.labelName = "";
      this.editLabelName = "";
      this.labelDescription = "";

      this.generateRandomColor();

      this.editMode = false;
    },
    saveLabel() {
      if (this.labelName === "") {
        this.notificationError("Label name is required.");
        return;
      }

      this.showSpinner = true;

      if (!this.editMode) {
        this.octokit.issues
          .createLabel({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: this.repository,
            name: this.labelName,
            color: this.labelColor.replace("#", "").toLowerCase(),
            description: this.labelDescription,
          })
          .then(({ data }) => {
            this.notificationSuccess("Label added successfully");

            const repositories = this.$store.state.cachedRepositories;
            const repository = repositories.find(
              (repo) => repo.name === this.repository
            );

            repository.labels = [...repository.labels, data];

            this.$store.commit(
              "setCachedRepositories",
              repositories.sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
              )
            );

            this.tableData = repository.labels.map((label) => {
              return {
                label: label.name,
                color: label.color,
                description: label.description,
              };
            });

            this.showSpinner = false;

            this.exitEditMode();
          })
          .catch((error) => {
            if (error.response.status === 422) {
              this.notificationError("Label already exists.");
              return;
            }

            this.notificationError(
              "An error occured during adding label. Please try again."
            );

            this.showSpinner = false;
          });
      } else {
        this.octokit.issues
          .updateLabel({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: this.repository,
            name: this.editLabelName,
            new_name: this.labelName,
            color: this.labelColor.replace("#", "").toLowerCase(),
            description: this.labelDescription,
          })
          .then(({ data }) => {
            this.notificationSuccess("Label updated successfully");

            const repositories = this.$store.state.cachedRepositories;
            const repository = repositories.find(
              (repo) => repo.name === this.repository
            );

            repository.labels = [
              ...repository.labels.map((label) => {
                if (label.name === this.editLabelName) {
                  label = { ...data };
                }

                return label;
              }),
            ];

            this.$store.commit(
              "setCachedRepositories",
              repositories.sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
              )
            );

            this.tableData = repository.labels.map((label) => {
              return {
                label: label.name,
                color: label.color,
                description: label.description,
              };
            });

            this.showSpinner = false;

            this.exitEditMode();
          })
          .catch(() => {
            this.notificationError(
              "An error occured during editing label. Please try again."
            );

            this.showSpinner = false;
          });
      }
    },
    removeLabel(data) {
      this.showSpinner = true;

      this.octokit.issues
        .deleteLabel({
          owner: process.env.VUE_APP_ORGANISATION,
          repo: this.repository,
          name: data.label,
        })
        .then(() => {
          this.notificationSuccess("Label removed successfully");

          const repositories = this.$store.state.cachedRepositories;
          const repository = repositories.find(
            (repo) => repo.name === this.repository
          );

          repository.labels = [
            ...repository.labels.filter((label) => {
              return label.name !== data.label;
            }),
          ];

          this.$store.commit(
            "setCachedRepositories",
            repositories.sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
          );

          this.tableData = repository.labels.map((label) => {
            return {
              label: label.name,
              color: label.color,
              description: label.description,
            };
          });

          this.showSpinner = false;
        })
        .catch(() => {
          this.notificationError(
            "An error occured during adding label. Please try again."
          );
        });
    },
    pickerHandler(event) {
      if (event.target.className === "picker-button") {
        this.showEmojiPicker = true;
        return;
      }

      this.showEmojiPicker = false;
    },
    selectEmoji(emoji) {
      this.labelName += emoji.data;
    },
    generateRandomColor() {
      this.labelColor =
        "#" +
        (
          "00000" + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
        ).slice(-6);
    },
    generateLabelStyles(color) {
      if (!color) {
        return "black";
      }

      const value = color.includes("#") ? color : `#${color}`;

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
  },
};
</script>
