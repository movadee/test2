# Deployment Process – Address Update Application

This repository (**ABC Deployment Repo**) is responsible for deploying the **Address Update Angular application** to SIT1, SIT2, and Production environments.

---

## Branches

- **addressupdate/pre-deploy** — staging branch where deployment packages are added and deployment script is updated.
- **addressupdate/deploy** — main branch; merging into this branch triggers deployment.

---

## Steps for Deployment

### 1. Build the Application (in the app repo)

Run one of the following commands in the `addressupdate` source repository:

```bash
npm run sit1-build   # SIT1 environment
npm run sit2-build   # SIT2 environment
npm run prod-build   # Production environment


This will output the build into the dist/ folder.

2. Create Deployment Package

Zip the contents of the dist/ folder. The root of the zip must contain index.html and all assets (do not include a nested dist/ folder).

Name the zip file using the following format:

<ENV>_<YYYY-MM-DD>.zip


Examples:

SIT1_2025-09-21.zip
SIT2_2025-09-21.zip
PROD_2025-09-21.zip

3. Place the Package

Copy the zip file into this repository’s /packages directory:

/packages

4. Update the Deployment Script

Open the following file:

lib/addressupdate-s3-deployment.ts


Update the filename constant to match the zip file name you placed in /packages:

const filename = "SIT2_2025-09-21.zip";

5. Create a Pull Request

Commit both the zip file and the script update on addressupdate/pre-deploy branch.

Create a pull request from addressupdate/pre-deploy into addressupdate/deploy.

The PR comment must include the target environment:

SIT1 → cdk2.sit1,2,ca1

SIT2 → cdk2.sit2,2,ca1

PROD → cdk2.prod,2,ca1

Add the appropriate developer(s) as reviewers.

6. Deployment

Once the pull request is approved and merged into addressupdate/deploy, the CI/CD pipeline will automatically:

Read the filename constant.

Locate the corresponding zip file in /packages.

Deploy it to the specified environment.
```
