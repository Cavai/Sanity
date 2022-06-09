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
- A [Firebase](https://firebase.google.com/) account
- The contents of this repo

### Creating a Firebase app (Required)

- In `Authentication` go to `Sign-in method`
- Under `Authorized domains` add

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
