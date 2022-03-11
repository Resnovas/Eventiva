import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountCreateWithoutEmployerInput } from "../inputs/EmployersOnAccountCreateWithoutEmployerInput";
import { EmployersOnAccountUpdateWithoutEmployerInput } from "../inputs/EmployersOnAccountUpdateWithoutEmployerInput";
import { EmployersOnAccountWhereUniqueInput } from "../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput", {
  isAbstract: true
})
export class EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateWithoutEmployerInput, {
    nullable: false
  })
  update!: EmployersOnAccountUpdateWithoutEmployerInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountCreateWithoutEmployerInput, {
    nullable: false
  })
  create!: EmployersOnAccountCreateWithoutEmployerInput;
}
