<template>
  <div id="login">
    <Spinner v-if="loadingData" />
    <div v-if="isNotOrganisationMember" class="error_container">
      <Alert type="error" show-icon>
        You're not recognized as {{ organisationName }} organisation member
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
        <div class="sign_in_right_card">
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
/* eslint-disable no-unused-vars */

import Logo from '@/components/Logo.vue';
import Spinner from '@/components/Spinner.vue';

import { Octokit } from '@octokit/rest';
import firebase from 'firebase';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Login',
  components: {
    Logo,
    Spinner,
  },
  data() {
    return {
      loadingData: false,
      firebaseInitialized: false,
      firebaseInstance: null,
      isNotOrganisationMember: false,
    }
  },
  computed: {
    organisationName() {
      return process.env.VUE_APP_ORGANISATION;
    }
  },
  methods: {
    authenticate() {
      if (!this.firebaseInitialized) {
        const firebaseConfig = {
          apiKey: 'AIzaSyDYfDWvYccsTTcasEkH6jkHoqqftOUJw90',
          authDomain: 'cavai-sanity.firebaseapp.com',
          projectId: 'cavai-sanity',
          storageBucket: 'cavai-sanity.appspot.com',
          messagingSenderId: '208882602019',
          appId: '1:208882602019:web:fcdce3c29dba7df7526196'
        };

        if (!firebase.apps.length) {
          this.firebaseInstance = firebase.initializeApp(firebaseConfig);
        } else {
          this.firebaseInstance = firebase.app();
        }

        this.firebaseInitialized = true;
      }

      const provider = new firebase.auth.GithubAuthProvider();
      provider.addScope('user');

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          this.loadingData = true;

          const octokit = new Octokit({
            auth: result.credential.accessToken,
            userAgent: 'Cavai Sanity v0.1',
          });

          octokit.orgs.getMembershipForUser({
            org: 'Cavai',
            username: result.additionalUserInfo.username,
          }).then(() => {

            this.isNotOrganisationMember = false;

            this.$store.commit('authenticateUser', { login: result.additionalUserInfo.username, display: result.user.displayName });
            this.$store.commit('setFirebaseInstance', this.firebaseInstance);
            this.$store.commit('setExpiryDate');

            this.prepareToken();
          }).catch(error => {
            console.error('User membership error: ', error.message);
            this.loadingData = false;
            this.isNotOrganisationMember = true;
          })
        })
    },
    prepareToken() {
      const octokit = new Octokit({
        auth: process.env.VUE_APP_GH_TOKEN,
        userAgent: 'Cavai Sanity v0.1'
      });

      octokit.rateLimit.get().then(({data}) => {
        console.log(
          `%c ** REMAINING RATE LIMIT ${data.rate.remaining} **`,
          'background: #0D47A1; color: #FFFFFF',
        );

        if (data.rate.remaining >= 1500) {
          // Main token
          this.$store.commit('setToken', process.env.VUE_APP_GH_TOKEN);
        } else {
          // Alternative token
          this.$store.commit('setToken', process.env.VUE_APP_GH_TOKEN_ALT);
        }
        this.preCacheData(octokit);
      });
    },
    async preCacheData(octokit) {

      // Repositories
      const { data: repos } = await octokit.repos.listForOrg({
          org: process.env.VUE_APP_ORGANISATION,
          per_page: 100
        });

      // this.$store.commit('setCachedRepositories', repos);

      const pullsPromises = repos.map(repo => {
        return octokit.pulls.list({
          owner: process.env.VUE_APP_ORGANISATION,
          repo: repo.name,
          state: "open",
          per_page: 100
        });
      });

      const issuesPromises = repos.map(repo => {
        return octokit.issues.listForRepo({
          owner: process.env.VUE_APP_ORGANISATION,
          repo: repo.name,
          per_page: 100
        });
      });

      // PRs
      const pulls = await Promise.allSettled(pullsPromises);

      const pullsFiltered = pulls.map(pullData => {
        if (pullData.value.data.length) {
          return pullData.value.data.map(pull => {
            return {
              id: pull.number,
              repo: pull.base.repo.name,
              url: pull.url,
              data: pull,
            }
          });
        }
      }).filter(pulls => pulls).flat();

      this.$store.commit('setCachedPulls', pullsFiltered);

      // Issues
      const issues = await Promise.allSettled(issuesPromises);
      const issuesFiltered = issues.map(issue => {
        return {
          repo: issue.value.url.split(`${process.env.VUE_APP_ORGANISATION}/`)[1].split("/issues")[0],
          url: issue.value.url,
          data: issue.value.data,
        }
      });

      this.$store.commit('setCachedIssues', issuesFiltered);

      this.loadingData = false;

      if (this.$route.query.to) {
        this.$router.push(`/${this.$route.query.to}`);
      } else {
        this.$router.push("/requests");
      }
    }
  }
}
</script>
