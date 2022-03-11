import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutStatusInput } from "../inputs/AccountCreateNestedOneWithoutStatusInput";
import { StatusCreateNestedOneWithoutAccountInput } from "../inputs/StatusCreateNestedOneWithoutAccountInput";

@TypeGraphQL.InputType("StatusOnAccountCreateInput", {
  isAbstract: true
})
export class StatusOnAccountCreateInput {
  @TypeGraphQL.Field(_type => StatusCreateNestedOneWithoutAccountInput, {
    nullable: false
  })
  status!: StatusCreateNestedOneWithoutAccountInput;

  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutStatusInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutStatusInput;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | undefined;
}
