<template>
  <div id="labels">
    <Spinner v-if="showSpinner" />
    <Header />
    <div class="sub-header">
      <h2>Labels</h2>
    </div>
    <Form
      v-if="!selectedRepository"
      label-position="top"
      inline
      class="sub-menu"
    >
      <FormItem label="From">
        <Select v-model="copyFrom" filterable class="sub-menu-repository">
          <Option
            v-for="repo in $store.state.cachedRepositories"
            :value="repo.name"
            :key="repo.id"
          >
            {{ repo.name }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="To">
        <Select v-model="copyTo" filterable class="sub-menu-repository">
          <Option
            v-for="repo in $store.state.cachedRepositories"
            :value="repo.name"
            :key="repo.id"
          >
            {{ repo.name }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="Method">
        <RadioGroup v-model="copyMethod">
          <Radio label="overwrite">
            <span>Overwrite</span>
          </Radio>
          <Radio label="add">
            <span>Add</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem style="margin-top: 23px">
        <Button class="sub-menu-copy" @click="handleLabelsCopy">Copy</Button>
      </FormItem>
    </Form>
    <div class="labels-content">
      <div
        @click="resetRepositorySelection"
        v-if="selectedRepository"
        class="labels-content-back"
      >
        <Icon type="ios-arrow-round-back" />
        Back to repositories list
      </div>
      <LabelsTable v-if="selectedRepository" :repository="selectedRepository" />
      <RepositoriesTable
        v-if="!selectedRepository"
        @handleRepositorySelection="handleRepositorySelection"
      />
    </div>
  </div>
</template>

<script>
import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";

import Header from "@/components/Header.vue";
import LabelsTable from "@/components/LabelsTable.vue";
import RepositoriesTable from "@/components/RepositoriesTable.vue";
import Spinner from "@/components/Spinner.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Labels",
  mixins: [notifications, octokit],
  components: {
    Header,
    LabelsTable,
    RepositoriesTable,
    Spinner,
  },
  data() {
    return {
      showSpinner: false,
      selectedRepository: null,
      copyFrom: "",
      copyTo: "",
      copyMethod: "overwrite",
    };
  },
  methods: {
    handleLabelsCopy() {
      if (this.copyFrom !== this.copyTo) {
        this.showSpinner = true;

        const repositories = this.$store.state.cachedRepositories;

        const fromRepository = repositories.find(
          (repo) => repo.name === this.copyFrom
        );
        const toRepository = repositories.find(
          (repo) => repo.name === this.copyTo
        );

        const repoLabelsPromises = [
          this.octokit.issues.listLabelsForRepo({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: this.copyFrom,
            per_page: 100,
          }),
          this.octokit.issues.listLabelsForRepo({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: this.copyTo,
            per_page: 100,
          }),
        ];

        Promise.allSettled(repoLabelsPromises)
          .then((data) => {
            fromRepository.labels = data[0].value.data;
            toRepository.labels = data[1].value.data;

            this.$store.commit(
              "setCachedRepositories",
              repositories.sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
              )
            );

            if (this.copyMethod === "overwrite") {
              this.removeLabels();
            } else {
              this.moveLabels();
            }
          })
          .catch(() => {
            this.notificationError(
              "An error occured during copying labels. Please try again."
            );

            this.showSpinner = false;
          });
      }
    },
    removeLabels() {
      const repositories = this.$store.state.cachedRepositories;

      const toRepository = repositories.find(
        (repo) => repo.name === this.copyTo
      );

      const removeLabelPromises = [];

      toRepository.labels.map((label) => {
        removeLabelPromises.push(
          this.octokit.issues.deleteLabel({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: this.copyTo,
            name: label.name,
          })
        );
      });

      Promise.allSettled(removeLabelPromises)
        .then(() => {
          this.moveLabels(true);
        })
        .catch(() => {
          this.notificationError(
            "An error occured during copying labels. Please try again."
          );

          this.showSpinner = false;
        });
    },
    moveLabels(clear) {
      const repositories = this.$store.state.cachedRepositories;

      const fromRepository = repositories.find(
        (repo) => repo.name === this.copyFrom
      );

      const toRepository = repositories.find(
        (repo) => repo.name === this.copyTo
      );

      if (clear) {
        toRepository.labels = [];
      }

      const addLabelPromises = [];

      fromRepository.labels.forEach((label) => {
        if (!toRepository.labels.find((l) => l.name === label.name)) {
          addLabelPromises.push(
            this.octokit.issues.createLabel({
              owner: process.env.VUE_APP_ORGANISATION,
              repo: this.copyTo,
              name: label.name,
              color: label.color,
              description: label.description,
            })
          );
        }
      });

      Promise.allSettled(addLabelPromises)
        .then(() => {
          toRepository.labels = [
            ...toRepository.labels,
            ...fromRepository.labels.filter(
              (label) => !toRepository.labels.find((l) => l.name === label.name)
            ),
          ];

          this.notificationSuccess("Labels copied successfully.");

          this.showSpinner = false;
        })
        .catch(() => {
          this.notificationError(
            "An error occured during copying labels. Please try again."
          );

          this.showSpinner = false;
        });
    },
    handleRepositorySelection(repository) {
      this.selectedRepository = repository;
    },
    resetRepositorySelection() {
      this.selectedRepository = null;
    },
  },
};
</script>
