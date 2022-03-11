import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateWithoutManagersInput } from "../inputs/ManagersOnAccountCreateWithoutManagersInput";
import { ManagersOnAccountUpdateWithoutManagersInput } from "../inputs/ManagersOnAccountUpdateWithoutManagersInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput", {
  isAbstract: true
})
export class ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateWithoutManagersInput, {
    nullable: false
  })
  update!: ManagersOnAccountUpdateWithoutManagersInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateWithoutManagersInput, {
    nullable: false
  })
  create!: ManagersOnAccountCreateWithoutManagersInput;
}
