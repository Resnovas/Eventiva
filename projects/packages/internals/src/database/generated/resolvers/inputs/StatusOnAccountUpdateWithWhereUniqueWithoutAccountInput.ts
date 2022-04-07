import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountUpdateWithoutAccountInput } from "../inputs/StatusOnAccountUpdateWithoutAccountInput";
import { StatusOnAccountWhereUniqueInput } from "../inputs/StatusOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => StatusOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => StatusOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: StatusOnAccountUpdateWithoutAccountInput;
}
