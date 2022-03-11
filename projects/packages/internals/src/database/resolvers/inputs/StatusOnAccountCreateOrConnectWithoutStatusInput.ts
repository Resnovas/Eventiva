import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountCreateWithoutStatusInput } from "../inputs/StatusOnAccountCreateWithoutStatusInput";
import { StatusOnAccountWhereUniqueInput } from "../inputs/StatusOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("StatusOnAccountCreateOrConnectWithoutStatusInput", {
  isAbstract: true
})
export class StatusOnAccountCreateOrConnectWithoutStatusInput {
  @TypeGraphQL.Field(_type => StatusOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => StatusOnAccountCreateWithoutStatusInput, {
    nullable: false
  })
  create!: StatusOnAccountCreateWithoutStatusInput;
}
