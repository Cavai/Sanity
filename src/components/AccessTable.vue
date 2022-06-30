<template>
  <div id="access-table">
    <Spinner v-if="showSpinner" />
    <Table
      ref="access-table"
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
      <template slot-scope="{ row }" slot="access">
        <Button
          :class="['access-table-button', row.collaborator.read || isDisabled('pull', row.repository) ? 'disabled' : '']"
          :disabled="row.collaborator.read || isDisabled('pull', row.repository)"
          @click="grantAccess('pull', row.repository)"
          >Read</Button
        >
        <Button
          :class="['access-table-button', row.collaborator.write || isDisabled('push', row.repository) ? 'disabled' : '']"
          :disabled="row.collaborator.write || isDisabled('push', row.repository)"
          @click="grantAccess('push', row.repository)"
          >Write</Button
        >
      </template>
    </Table>
  </div>
</template>

<script>
import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";

import Spinner from "@/components/Spinner.vue";

export default {
  name: "AccessTable",
  mixins: [notifications, octokit],
  components: {
    Spinner,
  },
  data() {
    return {
      showSpinner: false,
      disabledButtons: {},
      tableData: this.$store.state.cachedRepositories.map((repository) => {
        return {
          repository: repository.name,
          repository_url: repository.html_url,
          description: repository.description,
          collaborator: {
            read: repository.collaborators.find(collaborator => collaborator.login === this.$store.state.user.login)?.permissions?.pull,
            write: repository.collaborators.find(collaborator => collaborator.login === this.$store.state.user.login)?.permissions?.push,
          }
        }
      }),
      columns: [
       {
        title: "Repository",
        slot: "repository",
        key: "repository",
        width: 300,
        sortable: true,
        sortMethod(a, b, type) {
          if (type === "asc") {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          } else {
            return b.toLowerCase().localeCompare(a.toLowerCase());
          }
        },
       },
       {
        title: "Description",
        key: "description",
       },
       {
        title: "Grant Access",
        slot: "access",
        width: 250,
       },
      ],
    };
  },
  methods: {
    isDisabled(type, repositoryName) {
      return this.disabledButtons[repositoryName]?.[type];
    },
    grantAccess(type, repositoryName) {
      this.showSpinner = true;

      this.octokit.rest.repos.addCollaborator({
        owner: process.env.VUE_APP_ORGANISATION,
        repo: repositoryName,
        username: this.$store.state.user.login,
        permission: type
      }).then(() => {
        this.notificationSuccess("Access successfully granted.");

        const repositories = this.$store.state.cachedRepositories;
        const repository = repositories.find(repository => repository.name === repositoryName);

        const collaborator = repository.collaborators.find(collaborator => collaborator.login === this.$store.state.user.login);

        if (collaborator) {
           collaborator.permissions = {
            ...collaborator.permissions,
            [type]: true,
          }
        } else {
          repository.collaborators = [
            ...repository.collaborators,
            {
              login: this.$store.state.user.login,
              permissions: {
                [type]: true,
              }
            }
          ];
        }

        this.$store.commit(
          "setCachedRepositories",
          repositories.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )
        );

        this.disabledButtons = {
          ...this.disabledButtons,
          [repositoryName]: {
            ...this.disabledButtons[repositoryName],
            [type]: true,
          }
        };

        this.showSpinner = false;
      }).catch(() => {
        this.showSpinner = false;

        this.notificationError(
          `An error has occured with the granting access request`,
          `Please try again in a few minutes.`,
        );

        return;
      });
    },
  }
};
</script>

<style></style>
