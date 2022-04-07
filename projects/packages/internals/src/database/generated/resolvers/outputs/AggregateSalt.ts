import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCountAggregate } from "../outputs/SaltCountAggregate";
import { SaltMaxAggregate } from "../outputs/SaltMaxAggregate";
import { SaltMinAggregate } from "../outputs/SaltMinAggregate";

@TypeGraphQL.ObjectType("AggregateSalt", {
  isAbstract: true
})
export class AggregateSalt {
  @TypeGraphQL.Field(_type => SaltCountAggregate, {
    nullable: true
  })
  _count!: SaltCountAggregate | null;

  @TypeGraphQL.Field(_type => SaltMinAggregate, {
    nullable: true
  })
  _min!: SaltMinAggregate | null;

  @TypeGraphQL.Field(_type => SaltMaxAggregate, {
    nullable: true
  })
  _max!: SaltMaxAggregate | null;
}
