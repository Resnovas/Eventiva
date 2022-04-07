import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountAccountIdManagersIdCompoundUniqueInput } from "../inputs/ManagersOnAccountAccountIdManagersIdCompoundUniqueInput";

@TypeGraphQL.InputType("ManagersOnAccountWhereUniqueInput", {
  isAbstract: true
})
export class ManagersOnAccountWhereUniqueInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountAccountIdManagersIdCompoundUniqueInput, {
    nullable: true
  })
  accountId_managersId?: ManagersOnAccountAccountIdManagersIdCompoundUniqueInput | undefined;
}
