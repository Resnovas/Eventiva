import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountUpdateWithoutManagersInput } from "../inputs/ManagersOnAccountUpdateWithoutManagersInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput", {
  isAbstract: true
})
export class ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateWithoutManagersInput, {
    nullable: false
  })
  data!: ManagersOnAccountUpdateWithoutManagersInput;
}
