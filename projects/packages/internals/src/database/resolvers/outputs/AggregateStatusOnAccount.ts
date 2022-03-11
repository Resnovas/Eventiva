import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountCountAggregate } from "../outputs/StatusOnAccountCountAggregate";
import { StatusOnAccountMaxAggregate } from "../outputs/StatusOnAccountMaxAggregate";
import { StatusOnAccountMinAggregate } from "../outputs/StatusOnAccountMinAggregate";

@TypeGraphQL.ObjectType("AggregateStatusOnAccount", {
  isAbstract: true
})
export class AggregateStatusOnAccount {
  @TypeGraphQL.Field(_type => StatusOnAccountCountAggregate, {
    nullable: true
  })
  _count!: StatusOnAccountCountAggregate | null;

  @TypeGraphQL.Field(_type => StatusOnAccountMinAggregate, {
    nullable: true
  })
  _min!: StatusOnAccountMinAggregate | null;

  @TypeGraphQL.Field(_type => StatusOnAccountMaxAggregate, {
    nullable: true
  })
  _max!: StatusOnAccountMaxAggregate | null;
}
