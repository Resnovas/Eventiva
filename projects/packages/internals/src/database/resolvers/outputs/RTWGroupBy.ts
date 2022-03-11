import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCountAggregate } from "../outputs/RTWCountAggregate";
import { RTWMaxAggregate } from "../outputs/RTWMaxAggregate";
import { RTWMinAggregate } from "../outputs/RTWMinAggregate";

@TypeGraphQL.ObjectType("RTWGroupBy", {
  isAbstract: true
})
export class RTWGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active!: boolean | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startDate!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  endDate!: Date | null;

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
