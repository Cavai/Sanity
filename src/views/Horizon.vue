<template>
  <div id="horizon">
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
      <h2>Horizon</h2>
    </div>
    <Form label-position="top" inline class="sub-menu">
      <FormItem label="Engineer">
        <Select filterable v-model="selectedUser" class="sub-menu-engineer">
          <Avatar
            v-show="selectedUser"
            :src="setAvatar"
            slot="prefix"
            size="small"
          />
          <Option
            v-for="user in $store.state.cachedUsers"
            :value="user.login"
            :key="user.id"
          >
            {{ user.login }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="Repositories">
        <Select
          filterable
          multiple
          :max-tag-count="2"
          :max-tag-placeholder="maxTagPlaceholder"
          v-model="selectedRepositories"
          class="sub-menu-repository"
        >
          <Option
            v-for="repo in [{ name: 'All', id: 0 }, ...userRepositories]"
            :value="repo.name"
            :key="repo.id"
          >
            {{ repo.name }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="Date Range">
        <DatePicker
          v-model="selectedDateRange"
          type="daterange"
          :options="pickerShortcuts"
          :split-panels="true"
          placeholder="Select date"
          class="sub-menu-date-picker"
        ></DatePicker>
      </FormItem>
      <FormItem style="margin-top: 23px">
        <Button
          class="sub-menu-search"
          icon="ios-search-outline"
          @click="getHorizonData"
          >Search</Button
        >
      </FormItem>
    </Form>
    <!-- <Tabs v-if="commitsData.length" v-model="paneSelected">
      <TabPane label="Timeline" name="timeline">
        <div class="horizon-content-timeline">
          <HorizonTimeLine />
        </div>
      </TabPane>
      <TabPane label="Table" name="table">
        <div class="horizon-content-table"> -->
    <HorizonTable v-if="commitsData.length" :commitsData="commitsData" />
    <!-- </div>
      </TabPane>
    </Tabs> -->
  </div>
</template>

<script>
import moment from "moment";

import octokit from "@/mixins/octokit";

import Header from "@/components/Header.vue";
import HorizonTable from "@/components/HorizonTable.vue";
// import HorizonTimeLine from "@/components/HorizonTimeLine.vue";
import Spinner from "@/components/Spinner.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Horizon",
  mixins: [octokit],
  components: {
    Header,
    HorizonTable,
    // HorizonTimeLine,
    Spinner,
  },
  mounted() {
    if (!this.$store.state.cachedUsers) {
      this.getMembers();
      return;
    }

    if (this.$route.params.engineer) {
      const engineer = this.$store.state.cachedUsers.find(
        (user) => this.$route.params.engineer === user.login.toLowerCase()
      );

      this.selectedUser = engineer ? engineer.login : null;

      // this.$nextTick(() => {
      //   this.getHorizonData();
      // });
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
      // paneSelected: "table",
      selectedUser: null,
      selectedRepositories: ["All"],
      userRepositories: [],
      selectedDateRange: [
        moment().subtract(3, "days").format(),
        moment().format(),
      ],
      pickerShortcuts: {
        shortcuts: [
          {
            text: "Today",
            value() {
              const end = new Date();
              const start = new Date();
              return [start, end];
            },
          },
          {
            text: "Yesterday",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              return [start, end];
            },
          },
          {
            text: "1 week",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            },
          },
          {
            text: "1 month",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            },
          },
          {
            text: "3 months",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            },
          },
        ],
      },
      commitsData: [],
      rateLimit: 0,
    };
  },
  computed: {
    setAvatar() {
      return this.selectedUser
        ? this.$store.state.cachedUsers.find(
            (user) => this.selectedUser === user.login
          ).avatar_url
        : null;
    },
  },
  methods: {
    async getMembers() {
      this.showSpinner = true;

      // Users
      try {
        const { data: users } = await this.octokit.orgs.listMembers({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100,
        });

        this.$store.commit(
          "setCachedUsers",
          users.sort((a, b) =>
            a.login.toLowerCase().localeCompare(b.login.toLowerCase())
          )
        );

        this.getRepositoriesCollaborators();
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        this.$store.commit("logoutUser");

        return;
      }
    },
    async getRepositoriesCollaborators() {
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

          if (this.$route.params.engineer) {
            const engineer = this.$store.state.cachedUsers.find(
              (user) => this.$route.params.engineer === user.login.toLowerCase()
            );

            this.selectedUser = engineer ? engineer.login : null;

            this.userRepositories = this.$store.state.cachedRepositories.filter(
              (repository) => {
                return repository.collaborators
                  .map((collaborator) => collaborator.login)
                  .includes(this.$store.state.user.login);
              }
            );

            // this.$nextTick(() => {
            //   this.getHorizonData();
            // });
          }

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
    maxTagPlaceholder(num) {
      return `+${num} more`;
    },
    async getHorizonData() {
      if (
        !this.selectedUser ||
        !this.selectedRepositories.length ||
        !this.selectedDateRange[0] ||
        !this.selectedDateRange[1]
      ) {
        return false;
      }

      this.octokit.rateLimit.get().then(({ data }) => {
        this.rateLimit = data.rate.remaining;
      });

      this.showSpinner = true;

      try {
        this.octokit.rateLimit.get().then(({ data }) => {
          this.rateLimit = data.rate.remaining;
        });

        this.commitsData = [];
        const commitsPromises = [];

        if (this.selectedRepositories[0] === "All") {
          this.$store.state.cachedRepositories.forEach((repository) => {
            repository.branches.forEach((branch) => {
              commitsPromises.push(
                this.octokit.repos.listCommits({
                  owner: process.env.VUE_APP_ORGANISATION,
                  repo: repository.name,
                  sha: branch.name,
                  author: this.selectedUser,
                  since: moment(this.selectedDateRange[0]).toISOString(),
                  until: moment(this.selectedDateRange[1])
                    .add("1", "day")
                    .toISOString(),
                  per_page: 100,
                })
              );
            });
          });
        } else {
          this.selectedRepositories.forEach((repository) => {
            this.$store.state.cachedRepositories
              .find((repo) => repo.name === repository)
              .branches.forEach((branch) => {
                commitsPromises.push(
                  this.octokit.repos.listCommits({
                    owner: process.env.VUE_APP_ORGANISATION,
                    repo: repository,
                    sha: branch.name,
                    author: this.selectedUser,
                    since: moment(this.selectedDateRange[0]).toISOString(),
                    until: moment(this.selectedDateRange[1])
                      .add("1", "day")
                      .toISOString(),
                    per_page: 100,
                  })
                );
              });
          });
        }

        const commits = await Promise.allSettled(commitsPromises);

        this.commitsData = commits.map((repo) => {
          return {
            commits: repo.value.data,
            branch: repo.value.url.split("sha=")[1].split("&author")[0],
            repo: repo.value.url
              .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
              .split("/commits")[0],
          };
        });

        this.octokit.rateLimit.get().then(({ data }) => {
          console.log(
            `%c ** REMAINING RATE LIMIT ${data.rate.remaining} **`,
            "background: #0D47A1; color: #FFFFFF"
          );

          console.log(
            `%c ** COMMITS DATA FETCHING COST ${
              this.rateLimit - data.rate.remaining
            } **`,
            "background: #0DA12F; color: #FFFFFF"
          );
        });
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        return;
      }

      this.showSpinner = false;
    },
    showAlert(title, message, type) {
      this.error.title = title ?? this.error.title;
      this.error.message = message ?? this.error.message;
      this.error.type = type ?? this.error.type;

      this.showSpinner = false;
      this.error.show = true;
    },
  },
  watch: {
    selectedRepositories(newVal, oldVal) {
      // Delete "All"
      if (newVal.length > 1 && oldVal.includes("All")) {
        this.selectedRepositories.splice(
          this.selectedRepositories.indexOf("All"),
          1
        );
      }
      // Add "All", delete others
      if (newVal.length > 1 && newVal.includes("All")) {
        this.selectedRepositories = ["All"];
      }
    },
    selectedUser(user) {
      this.userRepositories = this.$store.state.cachedRepositories.filter(
        (repository) => {
          return repository.collaborators
            .map((collaborator) => collaborator.login)
            .includes(user);
        }
      );
    },
  },
};
</script>

<style></style>
