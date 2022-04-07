import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementCountAggregate } from "../outputs/ArrangementCountAggregate";
import { ArrangementMaxAggregate } from "../outputs/ArrangementMaxAggregate";
import { ArrangementMinAggregate } from "../outputs/ArrangementMinAggregate";

@TypeGraphQL.ObjectType("ArrangementGroupBy", {
  isAbstract: true
})
export class ArrangementGroupBy {
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

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  icon!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

  @TypeGraphQL.Field(_type => ArrangementCountAggregate, {
    nullable: true
  })
  _count!: ArrangementCountAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementMinAggregate, {
    nullable: true
  })
  _min!: ArrangementMinAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementMaxAggregate, {
    nullable: true
  })
  _max!: ArrangementMaxAggregate | null;
}
