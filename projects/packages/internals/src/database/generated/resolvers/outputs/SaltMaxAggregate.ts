import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("SaltMaxAggregate", {
  isAbstract: true
})
export class SaltMaxAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  salt!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  expiry!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountID!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;
}
