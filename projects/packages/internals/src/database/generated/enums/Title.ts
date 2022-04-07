import * as TypeGraphQL from "type-graphql";

export enum Title {
  Miss = "Miss",
  Ms = "Ms",
  Mrs = "Mrs",
  Mr = "Mr",
  Dr = "Dr"
}
TypeGraphQL.registerEnumType(Title, {
  name: "Title",
  description: undefined,
});
