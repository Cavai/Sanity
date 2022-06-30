<template>
  <div id="access">
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
import AccessTable from "@/components/AccessTable.vue";
import Header from "@/components/Header.vue";
import Spinner from "@/components/Spinner.vue";

import octokit from "@/mixins/octokit";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Access",
  mixins: [octokit],
  components: {
    AccessTable,
    Header,
    Spinner,
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
    }
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
          this.showAlert(
            `An error has occured with the data fetch`,
            `Please try again in a few minutes.`,
            "error"
          );

          return;
        });
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
