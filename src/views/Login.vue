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
      rateLimit: 0,
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
      provider.addScope("read:user");
      provider.addScope("read:org");

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
            .getMembershipForAuthenticatedUser({
              org: process.env.VUE_APP_ORGANISATION,
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
          `%c ** APP START - REMAINING RATE LIMIT ${data.rate.remaining} **`,
          "background: #0D47A1; color: #FFFFFF"
        );

        if (data.rate.remaining >= 500) {
          // Main token
          this.$store.commit("setToken", process.env.VUE_APP_GH_TOKEN);
        } else {
          this.showAlert(
            `Service currently unavailable.`,
            `Please try again in a few minutes.`,
            "error"
          );
          return;

          // Alternative token (TODO: Separate tokens PRE-CACHING <-> HORIZON)
          // this.$store.commit("setToken", process.env.VUE_APP_GH_TOKEN_ALT);
        }

        this.$router.push("/home");
      });
    },
  },
};
</script>
