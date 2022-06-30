<template>
  <div id="utils">
    <Header />
    <div class="sub-header">
      <h2>Utils</h2>
    </div>
    <div class="utils-content">
      <div class="utils-content-cards">
        <router-link to="/utils/access">
          <div class="utils-card">
            <div class="utils-card-image card-access"></div>
            <h3>Access</h3>
            <Icon :size="30" type="ios-arrow-round-forward utils-card-icon" />
          </div>
        </router-link>
        <router-link to="/utils/labels">
          <div class="utils-card">
            <div class="utils-card-image card-labels"></div>
            <h3>Labels</h3>
            <Icon :size="30" type="ios-arrow-round-forward utils-card-icon" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Utils",
  components: {
    Header,
  },
};
</script>

<style></style>
