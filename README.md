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

1) Create a fork of this repository to your Github organization
2) Go to the Github organization's settings and pick `Github Apps`
3) Configure the Cloudflare app to allow `Sanity` repo
4) Login to your Cloudflare dashboard and go to `Pages`
5) Create a new project and choose `Connect to Git`
6) Choose the correct Github organization
7) Select the `Sanity` repository
8) Set build output directory to `/public`
9) Add all the environment variables from [.env.example](.env.example)
10) Deploy

## Docs

No documentation available at this time.

## Contributors

- [@olszewa](https://github.com/olszewa)
- [@mikkokotila](https://github.com/mikkokotila)
- [@mcsneaky](https://github.com/mcsneaky)
