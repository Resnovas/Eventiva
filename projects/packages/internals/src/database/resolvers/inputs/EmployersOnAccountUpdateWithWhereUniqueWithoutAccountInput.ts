import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountUpdateWithoutAccountInput } from "../inputs/EmployersOnAccountUpdateWithoutAccountInput";
import { EmployersOnAccountWhereUniqueInput } from "../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: EmployersOnAccountUpdateWithoutAccountInput;
}
