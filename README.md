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

### Setting up Sanity (Minimal)

- Create an account in [Firebase](https://console.firebase.google.com/) if you don't already have one
- Start by cliking `Create a project`
- Name the project and select a resource it belongs to
- Turn `Enable Google Analytics` on or off as per your liking
- Once the project is created, add a web app to it
- From the screen that opens get the following: 

```
  apiKey: "00000yA00000-OWbyZ7AnMt00000-bfR200000",
  authDomain: "cavai-sanity-00000.firebaseapp.com",
  projectId: "cavai-sanity-00000",
  storageBucket: "cavai-sanity-00000.appspot.com",
  messagingSenderId: "58213300000",
  appId: "1:00000394149:web:00003b8088779c95a160c"
```

- The `Continue to console`
- In `Authentication` go to `Sign-in method`
- First choose Github as `Sign-in provider`
- In the opening settings window, `Enable` Github
- Copy the callback url below `Client ID` and `Client secret` fields

Next, you have to go to Github.com to generate the OAuth credentials:

- First, go to your personal `Settings`from the avatar in right top corner
- Go to `Developer settings`
- Choose `OAuth Apps` and create a `New OAuth App`
- You can put any value to `Application name` and `Homepage URL` but `Authorization callback URL` must be the one you copied from Firebase in the previous steps
- Leave `Enable Device Flow` unchecked
- In the next window `Generate a new client secret` and copy it together with `Client ID`

Now, you have to go back to Firebase to complete the setup in there: 

- Add the values from Github to `Client ID` and `Client secret`
- Add the domain you intend to use for **Sanity** (e.g. sanity.xyz.com) including localhost or other local address if you intend to use one

As the last step, you have to go back to Github and create a personal token: 

- First, go to your personal `Settings`from the avatar in right top corner
- Go to `Developer settings`
- Choose `Personal access tokens` and create a new token
- Select `repo` as scope

### Setting up Sanity locally (Optional)

1) Make sure that you have **Sanity** package on the local machine
2) Create a copy of the .env.example file called `.env.local`
3) Fill in the values you have generated in the above section into `.env.local`
4) Run `npm install` and then `npm run serve`

You now have **Sanity** running locally on https://localhost:8080

### Setting up Sanity with Cloudflare pages (Optional)

1) Go to the Github organization's settings and pick `Github Apps`
2) Configure the Cloudflare app to allow `Sanity` repo
3) Login to your Cloudflare dashboard and go to `Pages`
4) Create a new project and choose `Connect to Git`
5) Choose the correct Github organization
6) Select the `Sanity` repository
7) Set build output directory to `/public`
8) Add all the environment variables from [.env.example](.env.example)
9) Test deploy
10) In the main view of the sanity pages setup go to `Custom domains` tab
11) Click `Setup domain`
12) Enter the domain name that you are going to use (e.g. sanity.xyz.com)
13) Finally, add the domain name you are using to Firebase for the Sanity app

You should be now able to see **Sanity** for your organization in the domain that you had given, and also have automatic CI for PRs if you end up making changes to your **Sanity** fork.

## Docs

No documentation available at this time.

## Contributors

- [@olszewa](https://github.com/olszewa)
- [@mikkokotila](https://github.com/mikkokotila)
- [@mcsneaky](https://github.com/mcsneaky)
