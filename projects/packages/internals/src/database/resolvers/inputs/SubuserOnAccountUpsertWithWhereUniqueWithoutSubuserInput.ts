import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateWithoutSubuserInput } from "../inputs/SubuserOnAccountCreateWithoutSubuserInput";
import { SubuserOnAccountUpdateWithoutSubuserInput } from "../inputs/SubuserOnAccountUpdateWithoutSubuserInput";
import { SubuserOnAccountWhereUniqueInput } from "../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput", {
  isAbstract: true
})
export class SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateWithoutSubuserInput, {
    nullable: false
  })
  update!: SubuserOnAccountUpdateWithoutSubuserInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateWithoutSubuserInput, {
    nullable: false
  })
  create!: SubuserOnAccountCreateWithoutSubuserInput;
}
