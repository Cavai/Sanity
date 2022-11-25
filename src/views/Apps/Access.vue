<template>
  <div id="access">
    <Spinner v-if="showSpinner" />
    <Header />
    <div class="sub-header">
      <h2>Access</h2>
    </div>
    <div class="access-content">
      <AccessTable v-if="(dataFetched || toolsDataFetched) && this.$store.state.cachedRepositories[0].collaborators" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import notifications from "@/mixins/notifications";
import octokit from "@/mixins/octokit";
import preCache from "@/mixins/preCache";

import AccessTable from "@/components/Apps/AccessTable.vue";
import Header from "@/components/Header.vue";
import Spinner from "@/components/Spinner.vue";


export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Access",
  mixins: [notifications, octokit, preCache],
  components: {
    AccessTable,
    Header,
    Spinner,
  },
  data() {
    return {
      showSpinner: true,
    };
  },
  computed: {
    ...mapState({
      dataFetched: state => state.dataFetched,
      toolsDataFetched: state => state.toolsDataFetched,
    })
  },
  mounted() {
    if (!this.dataFetched && !this.toolsDataFetched) {
      this.preCacheToolsData();
      return;
    }

    if (this.$store.state.cachedRepositories && !this.$store.state.cachedRepositories[0]?.collaborators) {
      this.getRepositoriesCollaborators();
      return;
    }

    this.showSpinner = false;
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
  watch: {
    toolsDataFetched(status) {
      if (status) {
        if (!this.$store.state.cachedRepositories[0].collaborators) {
          this.getRepositoriesCollaborators();
        }
      }
    }
  }
};
</script>
