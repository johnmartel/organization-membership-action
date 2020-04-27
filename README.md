# organization-membership-action

[![](https://github.com/johnmartel/organization-membership-action/workflows/Build%20and%20test/badge.svg)](https://github.com/johnmartel/organization-membership-action/actions?query=workflow%3A%22Build+and+test%22)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![](https://api.dependabot.com/badges/status?host=github&repo=johnmartel/organization-membership-action)](https://dependabot.com)

A [Github action](https://github.com/features/actions) to manage organization and teams membership using pull requests.


## Usage

This action will compare the contents of the `.github/organization/members.yml` file of your repository with the actual
membership of the containing organization. Of course, this will only work for organization-owned repositories.

### Trigger

This action will fail on any event other than [push](https://help.github.com/en/actions/reference/events-that-trigger-workflows#push-event-push).

### Inputs

This action has no input.

### Outputs

This action has no output

### Secrets

#### `ORG_MEMBERSHIP_MANAGEMENT_TOKEN`
The Github membership management endpoints require a [personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line).
Create a new one and [create a new secret named `ORG_MEMBERSHIP_MANAGEMENT_TOKEN` in your repository](https://help.github.com/en/github/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
with the value of your new personal access token.

### Example usage

```yaml
jobs:
  manage:
    name: Manage organization membership
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Manage organization membership
        uses: johnmartel/organization-membership-action@v1
        env:
          ORG_MEMBERSHIP_MANAGEMENT_TOKEN: ${{ secrets.ORG_MEMBERSHIP_MANAGEMENT_TOKEN }}
```

#### .github/organization/members.yml

This action will only fire if `.github/organization/members.yml` has been modified in the triggering event.

This file defines the required members for your organization when this action completes successfully. The expected
format is:

```yaml
public_members:
  - name: johnmartel
    role: admin
  - name: sebasrobert
    role: member
```

The roles are defined in the [API documentation](https://developer.github.com/v3/orgs/members/#parameters-1).

## Building

```shell script
npm run lint
npm test
npm run build:clean
docker build .
```
