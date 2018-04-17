# Qualifier Scoreboard

This repository contains a number of [React](https://reactjs.org/) frontends
applications:

* countdown_frontend
* scoreboard_frontend

Additionally, the root of this repository contains a
[serverless](https://serverless.com/) application for managing the server-side
components that run in AWS lambda.

# Table of Contents

   * [Qualifier Scoreboard](#qualifier-scoreboard)
   * [Table of Contents](#table-of-contents)
   * [Deployment Prerequisites](#deployment-prerequisites)
      * [AWS Configuration](#aws-configuration)
      * [Frontend Dependencies](#frontend-dependencies)
   * [Frontend Applications](#frontend-applications)
      * [Countdown](#countdown)
         * [Development](#development)
         * [Deployment](#deployment)
      * [Scoreboard](#scoreboard)
         * [Development](#development-1)
         * [Deployment](#deployment-1)
            * [Production Deployment](#production-deployment)

# Deployment Prerequisites

The following are necessary in order to develop, test, and deploy the
components that make up the scoreboard.

## AWS Configuration

In order to deploy these applications, you will need a profile named `ooo` in
your `~/.aws/credentials` file containing your `aws_access_key_id` and
`aws_secret_access_key`. For more information on setting up this file see:
https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html

## Frontend Dependencies

The frontend applications are all written using React. React depends on npm and
Node.js. Install node via your favorite package manager or from
https://nodejs.org/.

Additionally, the instructions below use `yarn` as the Javascript package
manager, so you will want to install `yarn` as well. Instructions for
installing yarn can be found at https://yarnpkg.com/lang/en/docs/install/.

Once yarn is installed, to develop or deploy any of the frontend application
will first require installing the application's packages. Do that via:

```sh
cd APP_frontend
yarn install
```

# Frontend Applications

The frontend applications each build to static html, css, and javascript. The
deployed code lives in the
[oooverflow-scoreboard](https://s3.console.aws.amazon.com/s3/buckets/oooverflow-scoreboard/?region=us-east-1&tab=overview)
S3 bucket under the `dev` and `prod` prefixes.

Cloudfront distributions are configured to serve files out of that S3 bucket
mapped to an appropriate prefix.

* (prod) https://scoreboard.oooverflow.io ->
  https://d2y59cme150ipu.cloudfront.net
* (dev) https://d3npqu6kfryvtp.cloudfront.net

The S3 bucket is accessible via `Coudfront` through the `access-identity`
Origin Access Identity:
https://console.aws.amazon.com/cloudfront/home?region=us-east-1#oai:

The `dev` distribution is protect by HTTP basic authentication using the
attached `scoreboard-basic-auth` lambda function:
https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/scoreboard-basic-auth?tab=graph

## Countdown

![Countdown Screenshot](static/countdown.png)

Up until the competition starts, https://scoreboard.ooooverflow.com should host
the countdown_frontend. This application counts down to the start of the
competition. When the countdown is exhausted a message appears indicating to
wait for changes to propagate.

### Development

```sh
cd countdown_frontend
yarn start
```

### Deployment

Deploy to https://scoreboard.ooooverflow.com via:

```sh
cd countdown_frontend
./deploy.sh

The `index.html` file is set to be cached for an hour, so updates may take an
hour to roll out.

```


## Scoreboard

![Countdown Screenshot](static/scoreboard.png)

This application is the actual scoreboard that the qualifiers will use. By
default it deploys to https://d3npqu6kfryvtp.cloudfront.net where it is
protected by HTTP basic authentication (credentials listed in #quals_scoreboard
on Slack). This application is intended to be deployed to the production
environment at the start of the competition.

### Development

```sh
cd scoreboard_frontend
yarn start
```

### Deployment

Deploy to https://d3npqu6kfryvtp.cloudfront.net via:

```sh
cd countdown_frontend
./deploy.sh
```

#### Production Deployment

To kick off the competition, or make an update during the competition, deploy
to https://scoreboard.oooverflow.io via:

```sh
cd countdown_frontend
BUILD=prod ./deploy.sh
```

You will be prompted to confirm that you want to deploy to production.

The `index.html` file is set to be cached for 60 seconds so everyone should be
able to see updates within a minute of deployment.