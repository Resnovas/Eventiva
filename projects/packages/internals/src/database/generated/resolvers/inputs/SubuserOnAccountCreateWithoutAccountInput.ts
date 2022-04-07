import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutSubusersInput } from "../inputs/AccountCreateNestedOneWithoutSubusersInput";

@TypeGraphQL.InputType("SubuserOnAccountCreateWithoutAccountInput", {
  isAbstract: true
})
export class SubuserOnAccountCreateWithoutAccountInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutSubusersInput, {
    nullable: false
  })
  subuser!: AccountCreateNestedOneWithoutSubusersInput;

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
