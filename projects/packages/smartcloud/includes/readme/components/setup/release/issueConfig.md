<!-- @format -->

#### IssueConfig

| Option             | Required | Description                                    | Params                                                         |
| ------------------ | -------- | ---------------------------------------------- | -------------------------------------------------------------- |
| ref                | false    | Overrides the reference                        | `string`                                                       |
| enforceConventions | false    | Enforces conventions                           | [`EnforceConventions`](#enforceconventions)                    |
| labels             | false    | Apply labels automatically                     | [`[Key: string]: IssueConditionConfig`](#issueconditionconfig) |
| assignProject      | false    | Automatically assign to projects               | [`AssignProject[]`](#assignproject)                            |
| createBranch       | false    | Automatically create branches on configuration | [`[label: string]: CreateBranch`](#createbranch)               |
