import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BadgeStatus } from "../../enums/BadgeStatus";

@TypeGraphQL.InputType("SIACheckCreateManyInput", {
  isAbstract: true
})
export class SIACheckCreateManyInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  sia_id?: number | undefined;

  @TypeGraphQL.Field(_type => BadgeStatus, {
    nullable: false
  })
  status!: "ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE";

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  AuthUrl?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  pubUrl?: string | undefined;

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

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  error?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  transactionId?: string | undefined;
}
