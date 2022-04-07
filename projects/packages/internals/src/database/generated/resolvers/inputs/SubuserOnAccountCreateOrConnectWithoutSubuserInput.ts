import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateWithoutSubuserInput } from "../inputs/SubuserOnAccountCreateWithoutSubuserInput";
import { SubuserOnAccountWhereUniqueInput } from "../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateOrConnectWithoutSubuserInput", {
  isAbstract: true
})
export class SubuserOnAccountCreateOrConnectWithoutSubuserInput {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateWithoutSubuserInput, {
    nullable: false
  })
  create!: SubuserOnAccountCreateWithoutSubuserInput;
}
