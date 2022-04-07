import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutSaltInput } from "../inputs/AccountCreateNestedOneWithoutSaltInput";

@TypeGraphQL.InputType("SaltCreateInput", {
  isAbstract: true
})
export class SaltCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  salt!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  expiry!: Date;

  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutSaltInput, {
    nullable: true
  })
  account?: AccountCreateNestedOneWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
