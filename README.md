<h1 align="center">
  <br>
  <a href="https://cavai.com"><img src="https://raw.githubusercontent.com/Cavai/Sanity/main/Sanity-Logo.png" alt="Cavai" width="150"></a>
  <br>
</h1>

<h3 align="center">Sanity</h3>

<p align="center">
  <a href="#background">Background</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#docs">Docs</a> •
  <a href="#contributors">Contributors</a>
</p>
<hr>

## Background

**Sanity** provides three different horizons to a software project/organization:

- **Requests** - all RFCs that meet a set criteria
- **Stream** - all Github activity of the organization
- **Horizon** - all commits at the level of individual contributors

## Getting Started (takes about 5 minutes)

To get started with Sanity, you will need three things:

- A Github organization (can be private or public)
- A Github OAuth App
- A Github personal token
- A [Firebase](https://firebase.google.com/) account
- The contents of this repo

It sounds like a lot, and there are some steps that have to be taken care before you can start using Sanity, but everything is really straightforward and should not take longer than 5 minutes to complete.

### 1. Setting up Sanity (Required)

1.1) Create an account in [Firebase](https://console.firebase.google.com/) if you don't already have one

1.2) Start by cliking `Create a project`

1.3) Name the project and select a resource it belongs to

1.4) Turn `Enable Google Analytics` on or off as per your liking

1.5) Once the project is created, add a web app to it

1.6) From the screen that opens get the following:

```
  apiKey: "00000yA00000-OWbyZ7AnMt00000-bfR200000",
  authDomain: "cavai-sanity-00000.firebaseapp.com",
  projectId: "cavai-sanity-00000",
  storageBucket: "cavai-sanity-00000.appspot.com",
  messagingSenderId: "58213300000",
  appId: "1:00000394149:web:00003b8088779c95a160c"
```

1.7) The `Continue to console`

1.8) In `Authentication` go to `Sign-in method`

1.9) First choose Github as `Sign-in provider`

1.10) In the opening settings window, `Enable` Github

1.11) Copy the callback url below `Client ID` and `Client secret` fields

Next, you have to go to Github.com to generate the OAuth credentials:

1.12) First, go to your personal `Settings`from the avatar in right top corner

1.13) Go to `Developer settings`

1.14) Choose `OAuth Apps` and create a `New OAuth App`

1.15) You can put any value to `Application name` and `Homepage URL` but `Authorization callback URL` must be the one you copied from Firebase in the previous steps

1.16) Leave `Enable Device Flow` unchecked

1.17) In the next window `Generate a new client secret` and copy it together with `Client ID`

Now, you have to go back to Firebase to complete the setup in there:

1.18) Add the values from Github to `Client ID` and `Client secret`

1.19) Add the domain you intend to use for **Sanity** (e.g. sanity.xyz.com) including localhost or other local address if you intend to use one

As the last step, you have to go back to Github and create a personal token:

1.20) First, go to your personal `Settings`from the avatar in right top corner

1.21) Go to `Developer settings`

1.22) Choose `Personal access tokens` and create a new token

1.23) Select `repo` as scope

### 2. Running Sanity

#### 2.1. Locally

2.1.1) Make sure that you have **Sanity** package on the local machine

2.1.2) Create a copy of the .env.example file called `.env.local`

2.1.3) Fill in the values you have generated in the above section into `.env.local`

2.1.4) Run `npm install` and then `npm run serve`

You now have **Sanity** running locally on https://localhost:8080

#### 2.2. On Cloudflare pages

2.2.1) Go to the Github organization's settings and pick `Github Apps`

2.2.2) Configure the Cloudflare app to allow `Sanity` repo

2.2.3) Login to your Cloudflare dashboard and go to `Pages`

2.2.4) Create a new project and choose `Connect to Git`

2.2.5) Choose the correct Github organization

2.2.6) Select the `Sanity` repository

2.2.7) Set build output directory to `/dist`

2.2.8) Add all the environment variables from [.env.example](.env.example)

2.2.9) Test deploy

2.2.10) In the main view of the sanity pages setup go to `Custom domains` tab

2.2.11) Click `Setup domain`

2.2.12) Enter the domain name that you are going to use (e.g. sanity.xyz.com)

2.2.13) Finally, add the domain name you are using to Firebase for the Sanity app

You should be now able to see **Sanity** for your organization in the domain that you had given, and also have automatic CI for PRs if you end up making changes to your **Sanity** fork.

## Docs

No documentation available at this time.

## Contributors

- [@olszewa](https://github.com/olszewa)
- [@mikkokotila](https://github.com/mikkokotila)
- [@mcsneaky](https://github.com/mcsneaky)
