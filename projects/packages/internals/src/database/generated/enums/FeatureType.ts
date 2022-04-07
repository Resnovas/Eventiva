import * as TypeGraphQL from "type-graphql";

export enum FeatureType {
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER"
}
TypeGraphQL.registerEnumType(FeatureType, {
  name: "FeatureType",
  description: undefined,
});
