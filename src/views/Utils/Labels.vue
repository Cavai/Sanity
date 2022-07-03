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

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Labels",
  mixins: [notifications, octokit],
  components: {
    Header,
    LabelsTable,
    RepositoriesTable,
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
      // if (this.copyFrom !== this.copyTo) {
      //   if (this.copyMethod === "overwrite") {
      //   } else {
      //   }
      // }
      // this.notificationSuccess("Labels copied successfully.");
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
