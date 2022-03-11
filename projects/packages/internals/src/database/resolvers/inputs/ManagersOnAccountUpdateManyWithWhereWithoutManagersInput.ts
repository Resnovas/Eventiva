import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountScalarWhereInput } from "../inputs/ManagersOnAccountScalarWhereInput";
import { ManagersOnAccountUpdateManyMutationInput } from "../inputs/ManagersOnAccountUpdateManyMutationInput";

@TypeGraphQL.InputType("ManagersOnAccountUpdateManyWithWhereWithoutManagersInput", {
  isAbstract: true
})
export class ManagersOnAccountUpdateManyWithWhereWithoutManagersInput {
  @TypeGraphQL.Field(_type => ManagersOnAccountScalarWhereInput, {
    nullable: false
  })
  where!: ManagersOnAccountScalarWhereInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: ManagersOnAccountUpdateManyMutationInput;
}
