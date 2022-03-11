import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCountAggregate } from "../outputs/ManagersOnAccountCountAggregate";
import { ManagersOnAccountMaxAggregate } from "../outputs/ManagersOnAccountMaxAggregate";
import { ManagersOnAccountMinAggregate } from "../outputs/ManagersOnAccountMinAggregate";

@TypeGraphQL.ObjectType("AggregateManagersOnAccount", {
  isAbstract: true
})
export class AggregateManagersOnAccount {
  @TypeGraphQL.Field(_type => ManagersOnAccountCountAggregate, {
    nullable: true
  })
  _count!: ManagersOnAccountCountAggregate | null;

  @TypeGraphQL.Field(_type => ManagersOnAccountMinAggregate, {
    nullable: true
  })
  _min!: ManagersOnAccountMinAggregate | null;

  @TypeGraphQL.Field(_type => ManagersOnAccountMaxAggregate, {
    nullable: true
  })
  _max!: ManagersOnAccountMaxAggregate | null;
}
