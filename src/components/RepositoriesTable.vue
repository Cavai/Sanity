<template>
  <div id="repositories-table">
    <Table
      ref="repositories-table"
      :columns="columns"
      :data="tableData"
      :disabled-hover="true"
      :update-show-children="true"
    >
      <template slot-scope="{ row }" slot="repository">
        <a :href="row.repository_url" target="_blank">
          {{ row.repository }}
        </a>
      </template>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template slot-scope="{ row }" slot="actions">
        <Button
          class="repository-labels-button"
          @click="$emit('handleRepositorySelection', row.repository)"
          >Manage</Button
        >
      </template>
    </Table>
  </div>
</template>

<script>
export default {
  name: "RepositoriesTable",
  data() {
    return {
      columns: [
        {
          title: "Repository",
          key: "repository",
          slot: "repository",
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
          width: 200,
        },
      ],
      tableData: this.$store.state.cachedRepositories.map((repository) => {
        return {
          repository: repository.name,
          repository_url: repository.html_url,
          description: repository.description,
        }
      })
    }
  }
}
</script>
