<template>
  <div id="access">
    <Spinner v-if="showSpinner" />
    <Header />
    <div class="sub-header">
      <h2>Access</h2>
    </div>
    <div class="access-content">
      <AccessTable v-if="$store.state.cachedRepositories[0].collaborators" />
    </div>
  </div>
</template>

<script>
import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";

import AccessTable from "@/components/Apps/AccessTable.vue";
import Header from "@/components/Header.vue";
import Spinner from "@/components/Spinner.vue";


export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Access",
  mixins: [notifications, octokit],
  components: {
    AccessTable,
    Header,
    Spinner,
  },
  data() {
    return {
      showSpinner: false,
    };
  },
  mounted() {
    if (!this.$store.state.cachedRepositories[0].collaborators) {
      this.getRepositoriesCollaborators();
    }
  },
  methods: {
    async getRepositoriesCollaborators() {
      this.showSpinner = true;

      this.octokit.rateLimit.get().then(({ data }) => {
        this.rateLimit = data.rate.remaining;
      });

      const repositoriesCollaboratorsPromises = [];

      this.$store.state.cachedRepositories.forEach((repo) => {
        repositoriesCollaboratorsPromises.push(
          this.octokit.repos.listCollaborators({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            per_page: 50,
          })
        );
      });

      Promise.allSettled(repositoriesCollaboratorsPromises)
        .then((collaborators) => {
          const cachedRepos = this.$store.state.cachedRepositories;

          collaborators.forEach((repository, index) => {
            cachedRepos[index] = {
              ...cachedRepos[index],
              collaborators: repository.value.data,
            };
          });

          this.$store.commit(
            "setCachedRepositories",
            cachedRepos.sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
          );

          this.octokit.rateLimit.get().then(({ data }) => {
            console.log(
              `%c ** REMAINING RATE LIMIT ${data.rate.remaining} **`,
              "background: #0D47A1; color: #FFFFFF"
            );

            console.log(
              `%c ** COLLABORATORS DATA FETCHING COST ${
                this.rateLimit - data.rate.remaining
              } **`,
              "background: #0DA12F; color: #FFFFFF"
            );
          });

          this.showSpinner = false;
        })
        .catch(() => {
          this.notificationError(
            "An error has occured with the data fetch. Please try again."
          );

          this.showSpinner = false;
        });
    },
  },
};
</script>
