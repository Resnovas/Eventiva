import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountScalarWhereInput } from "../inputs/SubuserOnAccountScalarWhereInput";
import { SubuserOnAccountUpdateManyMutationInput } from "../inputs/SubuserOnAccountUpdateManyMutationInput";

@TypeGraphQL.InputType("SubuserOnAccountUpdateManyWithWhereWithoutAccountInput", {
  isAbstract: true
})
export class SubuserOnAccountUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field(_type => SubuserOnAccountScalarWhereInput, {
    nullable: false
  })
  where!: SubuserOnAccountScalarWhereInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: SubuserOnAccountUpdateManyMutationInput;
}
