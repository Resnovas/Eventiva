import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCountAggregate } from "../outputs/AddressCountAggregate";
import { AddressMaxAggregate } from "../outputs/AddressMaxAggregate";
import { AddressMinAggregate } from "../outputs/AddressMinAggregate";

@TypeGraphQL.ObjectType("AggregateAddress", {
  isAbstract: true
})
export class AggregateAddress {
  @TypeGraphQL.Field(_type => AddressCountAggregate, {
    nullable: true
  })
  _count!: AddressCountAggregate | null;

  @TypeGraphQL.Field(_type => AddressMinAggregate, {
    nullable: true
  })
  _min!: AddressMinAggregate | null;

  @TypeGraphQL.Field(_type => AddressMaxAggregate, {
    nullable: true
  })
  _max!: AddressMaxAggregate | null;
}
