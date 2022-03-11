import * as TypeGraphQL from "type-graphql";

export enum BadgeStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
  SUSPENDED = "SUSPENDED",
  NON_ACTIVE = "NON_ACTIVE"
}
TypeGraphQL.registerEnumType(BadgeStatus, {
  name: "BadgeStatus",
  description: undefined,
});
