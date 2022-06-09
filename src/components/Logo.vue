<template>
  <transition name="fade">
  <div v-if="logoSrc" class="logo" :style="{ height: `${size}px`, width: `${size}px` }">
    <img :height="size" :width="size" :src="logoSrc" />
  </div>
  </transition>
</template>

<script>
import { Octokit } from "@octokit/rest";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Logo",
  props: {
    size: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      logoSrc: '',
    }
  },
  async created() {
    if (this.$store.state.cachedLogo) {
      this.logoSrc = this.$store.state.cachedLogo;
    } else {
      if (process.env.VUE_APP_ORGANISATION_LOGO_URL) {
        this.logoSrc = process.env.VUE_APP_ORGANISATION_LOGO_URL;
      } else {
        const octokit = new Octokit({
          auth: process.env.VUE_APP_GH_TOKEN,
          userAgent: "Sanity v0.1",
        });

        const orgData = await octokit.orgs.get({
          org: process.env.VUE_APP_ORGANISATION,
        });

        this.logoSrc = orgData.data.avatar_url;
      }

      this.$store.commit('setCachedLogo', this.logoSrc);
    }


    const favicon = document.getElementById("favicon");
    favicon.href = this.logoSrc;
  }
};
</script>
