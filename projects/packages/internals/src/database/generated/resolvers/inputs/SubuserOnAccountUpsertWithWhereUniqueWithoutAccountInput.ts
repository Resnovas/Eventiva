import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateWithoutAccountInput } from "../inputs/SubuserOnAccountCreateWithoutAccountInput";
import { SubuserOnAccountUpdateWithoutAccountInput } from "../inputs/SubuserOnAccountUpdateWithoutAccountInput";
import { SubuserOnAccountWhereUniqueInput } from "../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: SubuserOnAccountUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateWithoutAccountInput, {
    nullable: false
  })
  create!: SubuserOnAccountCreateWithoutAccountInput;
}
