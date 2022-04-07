import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCountAggregate } from "../outputs/ManagersOnAccountCountAggregate";
import { ManagersOnAccountMaxAggregate } from "../outputs/ManagersOnAccountMaxAggregate";
import { ManagersOnAccountMinAggregate } from "../outputs/ManagersOnAccountMinAggregate";

@TypeGraphQL.ObjectType("ManagersOnAccountGroupBy", {
  isAbstract: true
})
export class ManagersOnAccountGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  managersId!: string;

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
