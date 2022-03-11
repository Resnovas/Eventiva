import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StatusOnAccountCountAggregate } from "../outputs/StatusOnAccountCountAggregate";
import { StatusOnAccountMaxAggregate } from "../outputs/StatusOnAccountMaxAggregate";
import { StatusOnAccountMinAggregate } from "../outputs/StatusOnAccountMinAggregate";

@TypeGraphQL.ObjectType("StatusOnAccountGroupBy", {
  isAbstract: true
})
export class StatusOnAccountGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  statusId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

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
  deleted!: Date | null;

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
