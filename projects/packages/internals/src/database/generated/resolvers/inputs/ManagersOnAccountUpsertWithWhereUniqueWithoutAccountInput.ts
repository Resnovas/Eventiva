import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCreateWithoutAccountInput } from "../inputs/ManagersOnAccountCreateWithoutAccountInput";
import { ManagersOnAccountUpdateWithoutAccountInput } from "../inputs/ManagersOnAccountUpdateWithoutAccountInput";
import { ManagersOnAccountWhereUniqueInput } from "../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: ManagersOnAccountUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateWithoutAccountInput, {
    nullable: false
  })
  create!: ManagersOnAccountCreateWithoutAccountInput;
}
