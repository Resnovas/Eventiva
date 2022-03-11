import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountCreateWithoutAccountInput } from "../inputs/EmployersOnAccountCreateWithoutAccountInput";
import { EmployersOnAccountWhereUniqueInput } from "../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("EmployersOnAccountCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class EmployersOnAccountCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountCreateWithoutAccountInput, {
    nullable: false
  })
  create!: EmployersOnAccountCreateWithoutAccountInput;
}
