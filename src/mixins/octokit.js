import { Octokit } from "@octokit/rest";

const octokit = {
  data() {
    return {
      octokit: null,
    };
  },
  mounted() {
    this.octokit = new Octokit({
      auth: this.$store.state.authenticationToken,
      userAgent: "Sanity v0.1",
    });

    if (this.dataFetched) {
      this.getData();
    }
  },
  methods: {
    getData() {
      this.octokit.rateLimit.get().then((data) => {
        if (data.data.resources.core.used > data.data.resources.core.limit) {
          this.showAlert(
            `Service temporarily unavailable`,
            `Please try again in a few minutes.`,
            "error"
          );
        } else {
          if (this.getInitialData) {
            this.getInitialData();
          }
        }
      });
    }
  }
};

export default octokit;
