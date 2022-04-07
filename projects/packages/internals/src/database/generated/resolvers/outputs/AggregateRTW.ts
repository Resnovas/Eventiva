import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCountAggregate } from "../outputs/RTWCountAggregate";
import { RTWMaxAggregate } from "../outputs/RTWMaxAggregate";
import { RTWMinAggregate } from "../outputs/RTWMinAggregate";

@TypeGraphQL.ObjectType("AggregateRTW", {
  isAbstract: true
})
export class AggregateRTW {
  @TypeGraphQL.Field(_type => RTWCountAggregate, {
    nullable: true
  })
  _count!: RTWCountAggregate | null;

  @TypeGraphQL.Field(_type => RTWMinAggregate, {
    nullable: true
  })
  _min!: RTWMinAggregate | null;

  @TypeGraphQL.Field(_type => RTWMaxAggregate, {
    nullable: true
  })
  _max!: RTWMaxAggregate | null;
}
