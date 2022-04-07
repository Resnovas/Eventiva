import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionCountAggregate } from "../outputs/SubscriptionCountAggregate";
import { SubscriptionMaxAggregate } from "../outputs/SubscriptionMaxAggregate";
import { SubscriptionMinAggregate } from "../outputs/SubscriptionMinAggregate";

@TypeGraphQL.ObjectType("SubscriptionGroupBy", {
  isAbstract: true
})
export class SubscriptionGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  name!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  cost!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details!: string | null;

  @TypeGraphQL.Field(_type => SubscriptionCountAggregate, {
    nullable: true
  })
  _count!: SubscriptionCountAggregate | null;

  @TypeGraphQL.Field(_type => SubscriptionMinAggregate, {
    nullable: true
  })
  _min!: SubscriptionMinAggregate | null;

  @TypeGraphQL.Field(_type => SubscriptionMaxAggregate, {
    nullable: true
  })
  _max!: SubscriptionMaxAggregate | null;
}
