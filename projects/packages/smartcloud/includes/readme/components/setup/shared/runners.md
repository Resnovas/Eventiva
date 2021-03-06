<!-- @format -->

#### Runners

You can have multiple runners, which allows for configuration for monorepo projects.

| Option             | Required | Description                                 | Params                                    |
| ------------------ | -------- | ------------------------------------------- | ----------------------------------------- |
| Root               | true     | Defines the root of the project             | `string`                                  |
| projectType        | true     | Defines the type of project                 | `"node" / "other"`                        |
| versioning         | true     | Defines the versioning of the project       | [`Versioning`](#versioning)               |
| prereleaseName     | false    | Defines the name of a prerelease            | `string`                                  |
| sharedLabelsConfig | false    | Defines labels to use on both PR and Issues | [`SharedLabels`](#sharedlabels)           |
| pr                 | false    | Defines the configuration for Pull Requests | [`PullRequestConfig`](#pullrequestconfig) |
| issue              | false    | Defines the configuration for issues        | [`IssueConfig`](#issueconfig)             |
| project            | false    | Defines the configuration for projects      | [`ProjectConfig`](#projectconfig)         |

##### Versioning

| Option | Required | Description                           | Params                           |
| ------ | -------- | ------------------------------------- | -------------------------------- |
| source | true     | Defines the source for versioning     | `"node" / "milestones" / string` |
| type   | false    | Defines the versioning of the project | `"SemVer" / "other"`             |
