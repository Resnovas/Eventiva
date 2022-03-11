import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountUpdateWithoutAccountInput } from "../inputs/ManagersOnAccountUpdateWithoutAccountInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: ManagersOnAccountUpdateWithoutAccountInput;
}
