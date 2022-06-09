<template>
  <div id="horizon">
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
            v-for="repo in [
              { name: 'All', id: 0 },
              ...$store.state.cachedRepositories,
            ]"
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
      <FormItem style="margin-top: 24px">
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

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Horizon",
  mixins: [octokit],
  components: {
    Header,
    HorizonTable,
    // HorizonTimeLine,
  },
  mounted() {
    if (this.$route.params.engineer) {
      const engineer = this.$store.state.cachedUsers.find(
        (user) => this.$route.params.engineer === user.login.toLowerCase()
      );

      this.selectedUser = engineer ? engineer.login : null;

      this.$nextTick(() => {
        this.getHorizonData();
      });
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
      paneSelected: "table",
      selectedUser: null,
      selectedRepositories: ["All"],
      selectedDateRange: [
        moment().subtract(7, "days").format(),
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

      try {
        const commitsPromises = [];

        if (this.selectedRepositories[0] === "All") {
          this.$store.state.cachedRepositories.forEach((repository) => {
            commitsPromises.push(
              this.octokit.repos.listCommits({
                owner: process.env.VUE_APP_ORGANISATION,
                repo: repository.name,
                author: this.selectedUser,
                since: moment(this.selectedDateRange[0]).toISOString(),
                until: moment(this.selectedDateRange[1])
                  .add("1", "day")
                  .toISOString(),
                per_page: 100,
              })
            );
          });
        } else {
          this.selectedRepositories.forEach((repository) => {
            commitsPromises.push(
              this.octokit.repos.listCommits({
                owner: process.env.VUE_APP_ORGANISATION,
                repo: repository,
                author: this.selectedUser,
                since: moment(this.selectedDateRange[0]).toISOString(),
                until: moment(this.selectedDateRange[1])
                  .add("1", "day")
                  .toISOString(),
                per_page: 100,
              })
            );
          });
        }

        const commits = await Promise.allSettled(commitsPromises);

        this.commitsData = commits.map((repo) => {
          return {
            commits: repo.value.data,
            repo: repo.value.url
              .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
              .split("/commits")[0],
          };
        });
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        return;
      }
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
  },
};
</script>

<style></style>
