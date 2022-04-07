import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("SaltCreateManyInput", {
  isAbstract: true
})
export class SaltCreateManyInput {
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

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountID?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
