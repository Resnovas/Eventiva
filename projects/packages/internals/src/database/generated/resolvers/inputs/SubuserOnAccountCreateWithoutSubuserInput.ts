import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutAccessesInput } from "../inputs/AccountCreateNestedOneWithoutAccessesInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateWithoutSubuserInput", {
  isAbstract: true
})
export class SubuserOnAccountCreateWithoutSubuserInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutAccessesInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutAccessesInput;

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
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
