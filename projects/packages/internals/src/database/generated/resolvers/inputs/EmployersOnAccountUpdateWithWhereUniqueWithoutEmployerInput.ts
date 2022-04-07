import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountUpdateWithoutEmployerInput } from "../inputs/EmployersOnAccountUpdateWithoutEmployerInput";
import { EmployersOnAccountWhereUniqueInput } from "../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput", {
  isAbstract: true
})
export class EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateWithoutEmployerInput, {
    nullable: false
  })
  data!: EmployersOnAccountUpdateWithoutEmployerInput;
}
