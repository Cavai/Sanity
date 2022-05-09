<template>
  <div id="login">
    <div v-if="isNotOrganisationMember" class="sign_in_error_container">
      <Alert type="error" show-icon>
        <!-- TODO -->
        You're not recognized as Cavai organisation member
        <span slot="desc">
          Please contact your line manager.
        </span>
      </Alert>
    </div>
    <div class="sign_in_container">
      <div class="sign_in_left">
        <h1>Sign in</h1>
      </div>
      <div class="sign_in_right">
        <div class="sign_in_card">
          <Logo />
          <Button
            size="large"
            class="sign_in_button"
            @click="authenticate"
          >
            <Icon size="22" type="logo-github" />
            <span>&nbsp;Sign In with GitHub</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '@/components/Logo.vue';

import { Octokit } from "@octokit/rest";
import firebase from "firebase";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Login',
  components: {
    Logo,
  },
  data() {
    return {
      firebaseInitialized: false,
      firebaseInstance: null,
      isNotOrganisationMember: false,
    }
  },
  methods: {
    authenticate() {
      if (!this.firebaseInitialized) {
        const firebaseConfig = {
          // TODO
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
        .then(result => {

          console.log(result);

          const octokit = this.octokit = new Octokit({
            auth: result.credential.accessToken,
            userAgent: "Cavai Sanity v0.1"
          });

          octokit.orgs.getMembershipForUser({
            org: "Cavai",
            username: result.additionalUserInfo.username,
          }).then(() => {
            this.isNotOrganisationMember = false;

            this.$store.commit("authenticateUser", { username: result.additionalUserInfo.username, display: result.user.displayName });
            this.$store.commit("setFirebaseInstance", this.firebaseInstance);
            // TODO
            this.$store.commit("setToken", '');

            if (this.$route.query.to) {
              this.$router.push(`/${this.$route.query.to}`);
            } else {
              this.$router.push("/requests");
            }
          }).catch(error => {
            console.error('User membership error: ', error.message);
            this.isNotOrganisationMember = true;
          })
        })
    }
  }
}
</script>

<style>

</style>
