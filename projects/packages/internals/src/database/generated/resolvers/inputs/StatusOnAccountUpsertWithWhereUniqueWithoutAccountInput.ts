import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountCreateWithoutAccountInput } from "../inputs/StatusOnAccountCreateWithoutAccountInput";
import { StatusOnAccountUpdateWithoutAccountInput } from "../inputs/StatusOnAccountUpdateWithoutAccountInput";
import { StatusOnAccountWhereUniqueInput } from "../inputs/StatusOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => StatusOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => StatusOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: StatusOnAccountUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => StatusOnAccountCreateWithoutAccountInput, {
    nullable: false
  })
  create!: StatusOnAccountCreateWithoutAccountInput;
}
