import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateWithoutManagersInput } from "../inputs/ManagersOnAccountCreateWithoutManagersInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateOrConnectWithoutManagersInput", {
  isAbstract: true
})
export class ManagersOnAccountCreateOrConnectWithoutManagersInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateWithoutManagersInput, {
    nullable: false
  })
  create!: ManagersOnAccountCreateWithoutManagersInput;
}
