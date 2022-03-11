import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("SubscriptionOnAccountMaxAggregate", {
  isAbstract: true
})
export class SubscriptionOnAccountMaxAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  subscriptionId!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountId!: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active!: boolean | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deactivated!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  activated!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startedAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted!: Date | null;
}
