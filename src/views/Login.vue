<template>
  <div id="login">
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
    <div class="sign_in_container">
      <div class="sign_in_left">
        <h1>Sign in</h1>
      </div>
      <div class="sign_in_right">
        <div class="sign_in_right_card">
          <Logo />
          <Button size="large" class="sign_in_button" @click="authenticate">
            <Icon size="22" type="logo-github" />
            <span>&nbsp;Sign In with GitHub</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/Logo.vue";
import Spinner from "@/components/Spinner.vue";

import { Octokit } from "@octokit/rest";
import firebase from "firebase";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Login",
  components: {
    Logo,
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
      firebaseInitialized: false,
      firebaseInstance: null,
      isNotOrganisationMember: false,
      showSpinner: false,
    };
  },
  computed: {
    organisationName() {
      return process.env.VUE_APP_ORGANISATION;
    },
  },
  methods: {
    authenticate() {
      if (!this.firebaseInitialized) {
        const firebaseConfig = {
          apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
          authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
          messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
          appId: process.env.VUE_APP_APP_ID,
        };

        if (!firebase.apps.length) {
          this.firebaseInstance = firebase.initializeApp(firebaseConfig);
        } else {
          this.firebaseInstance = firebase.app();
        }

        this.firebaseInitialized = true;
      }

      const provider = new firebase.auth.GithubAuthProvider();
      provider.addScope("user");

      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          this.showSpinner = true;

          const octokit = new Octokit({
            auth: result.credential.accessToken,
            userAgent: "Sanity v0.1",
          });

          octokit.orgs
            .getMembershipForUser({
              org: process.env.VUE_APP_ORGANISATION,
              username: result.additionalUserInfo.username,
            })
            .then(() => {
              this.$store.commit("authenticateUser", {
                login: result.additionalUserInfo.username,
                display: result.user.displayName,
              });
              this.$store.commit("setFirebaseInstance", this.firebaseInstance);
              this.$store.commit("setExpiryDate");

              this.prepareToken();
            })
            .catch((error) => {
              console.error("User membership error: ", error.message);
              this.showSpinner = false;

              this.showAlert(
                `You're not recognized as ${this.organisationName} organisation member`,
                "Please contact your line manager",
                "error"
              );
            });
        });
    },
    showAlert(title, message, type) {
      this.error.title = title ?? this.error.title;
      this.error.message = message ?? this.error.message;
      this.error.type = type ?? this.error.type;

      this.showSpinner = false;
      this.error.show = true;
    },
    prepareToken() {
      const octokit = new Octokit({
        auth: process.env.VUE_APP_GH_TOKEN,
        userAgent: "Sanity v0.1",
      });

      octokit.rateLimit.get().then(({ data }) => {
        console.log(
          `%c ** REMAINING RATE LIMIT ${data.rate.remaining} **`,
          "background: #0D47A1; color: #FFFFFF"
        );

        if (data.rate.remaining >= 1500) {
          // Main token
          this.$store.commit("setToken", process.env.VUE_APP_GH_TOKEN);
        } else {
          // Alternative token
          this.$store.commit("setToken", process.env.VUE_APP_GH_TOKEN_ALT);
        }

        this.preCacheData(
          new Octokit({
            auth: this.$store.state.authenticationToken,
            userAgent: "Sanity v0.1",
          })
        );
      });
    },
    async preCacheData(octokit) {
      // Users
      try {
        const { data: users } = await octokit.orgs.listMembers({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100,
        });

        this.$store.commit(
          "setCachedUsers",
          users.sort((a, b) =>
            a.login.toLowerCase().localeCompare(b.login.toLowerCase())
          )
        );
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        this.$store.commit("logoutUser");

        return;
      }

      // Repositories
      try {
        const { data: repos } = await octokit.repos.listForOrg({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100,
        });

        const branchesPromises = [];

        repos.forEach(repo => {
          branchesPromises.push(
            octokit.repos.listBranches({
              owner: process.env.VUE_APP_ORGANISATION,
              repo: repo.name,
            })
          )
        });

        const branches = await Promise.all(branchesPromises);

        this.$store.commit(
          "setCachedRepositories",
          repos.map((repo, index) => {
            return {
              ...repo,
              branches: branches[index].data
            }
          }).sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )
        );

        const pullsPromises = repos.map((repo) => {
          return octokit.pulls.list({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            state: "open",
            per_page: 100,
          });
        });

        const closedPullsPromises = repos.map((repo) => {
          return octokit.pulls.list({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            state: "closed",
            per_page: 100,
          });
        });

        const issuesPromises = repos.map((repo) => {
          return octokit.issues.listForRepo({
            owner: process.env.VUE_APP_ORGANISATION,
            repo: repo.name,
            per_page: 100,
          });
        });

        // PRs
        const pulls = await Promise.allSettled(pullsPromises);
        const closedPulls = await Promise.allSettled(closedPullsPromises);

        const pullsFiltered = [...pulls, ...closedPulls]
          .map((pullData) => {
            if (pullData.value.data.length) {
              return pullData.value.data.map((pull) => {
                return {
                  id: pull.number,
                  repo: pull.base.repo.name,
                  url: pull.url,
                  data: pull,
                };
              });
            }
          })
          .filter((pulls) => pulls)
          .flat()
          .filter((pull) => {
            return (
              pull.data.state === "open" || pull.data.title.includes("RFC")
            );
          });

        this.$store.commit("setCachedPulls", pullsFiltered);

        // Issues
        const issues = await Promise.allSettled(issuesPromises);
        const issuesFiltered = issues.map((issue) => {
          return {
            repo: issue.value.url
              .split(`${process.env.VUE_APP_ORGANISATION}/`)[1]
              .split("/issues")[0],
            url: issue.value.url,
            data: issue.value.data,
          };
        });

        this.$store.commit("setCachedIssues", issuesFiltered);
      } catch (error) {
        this.showAlert(
          `An error has occured with the data fetch`,
          `Please try again in a few minutes.`,
          "error"
        );

        this.$store.commit("logoutUser");

        return;
      }

      this.showSpinner = false;

      if (this.$route.query.to) {
        this.$router.push(`/${this.$route.query.to}`);
      } else {
        this.$router.push("/requests");
      }
    },
  },
};
</script>
