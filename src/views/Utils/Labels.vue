<template>
  <div id="labels">
    <Header />
    <div class="sub-header">
      <h2>Labels</h2>
    </div>
    <Form v-if="!selectedRepository" label-position="top" inline class="sub-menu">
      <FormItem label="From">
        <Select
          filterable
          class="sub-menu-repository"
        >
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
        <Select
          filterable
          class="sub-menu-repository"
        >
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
        <RadioGroup>
          <Radio label="overwrite">
              <span>Overwrite</span>
          </Radio>
          <Radio label="add">
              <span>Add</span>
          </Radio>
      </RadioGroup>
      </FormItem>
      <FormItem style="margin-top: 23px">
        <Button
          class="sub-menu-copy"
          >Copy</Button
        >
      </FormItem>
    </Form>
    <div class="labels-content">
      <div @click="resetRepositorySelection" v-if="selectedRepository" class="labels-content-back">
        <Icon type="ios-arrow-round-back" />
        Back to repositories list
      </div>
      <LabelsTable v-if="selectedRepository" :repository="selectedRepository" />
      <RepositoriesTable v-if="!selectedRepository" @handleRepositorySelection="handleRepositorySelection" />
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import LabelsTable from "@/components/LabelsTable.vue";
import RepositoriesTable from "@/components/RepositoriesTable.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Labels",
  components: {
    Header,
    LabelsTable,
    RepositoriesTable,
  },
  data() {
    return {
      selectedRepository: null,
    }
  },
  methods: {
    handleRepositorySelection(repository) {
      this.selectedRepository = repository;
    },
    resetRepositorySelection() {
      this.selectedRepository = null;
    }
  }
}
</script>
