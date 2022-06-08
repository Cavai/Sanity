<template>
  <div id="horizon">
    <Alert v-if="error.show" type="error" show-icon class="error_container">
      {{ error.message }}
      <span slot="desc"> Please try again in a few minutes. </span>
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
          :max-tag-count="3"
          :max-tag-placeholder="maxTagPlaceholder"
          v-model="selectedRepositories"
          class="sub-menu-repository"
        >
          <Option v-for="repo in $store.state.cachedRepositories" :value="repo.name" :key="repo.id">
            {{ repo.name }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="Date Range">
        <DatePicker type="daterange" placement="bottom-end" placeholder="Select date" class="sub-menu-date-picker"></DatePicker>
      </FormItem>
      <FormItem style="margin-top: 24px;">
        <Button
          class="sub-menu-search"
          icon="ios-search-outline"
          @click="false"
          >Search</Button
        >
      </FormItem>
    </Form>
    <Tabs v-model="paneSelected">
        <TabPane label="Timeline" name="timeline">
          <div class="horizon-content-timeline">
            <HorizonTimeLine />
          </div>
        </TabPane>
        <TabPane label="Table" name="table">
          <div class="horizon-content-table">
            <HorizonTable />
          </div>
        </TabPane>
    </Tabs>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import HorizonTable from '@/components/HorizonTable.vue';
import HorizonTimeLine from '@/components/HorizonTimeLine.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Horizon",
  components: {
    Header,
    HorizonTable,
    HorizonTimeLine
  },
  data() {
    return {
      error: {
        show: false,
        message: "Service temporarily unavailable",
      },
      selectedUser: null,
      selectedRepositories: [],
      paneSelected: "timeline",
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
  }
};
</script>

<style></style>
