import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountCountAggregate } from "../outputs/EmployersOnAccountCountAggregate";
import { EmployersOnAccountMaxAggregate } from "../outputs/EmployersOnAccountMaxAggregate";
import { EmployersOnAccountMinAggregate } from "../outputs/EmployersOnAccountMinAggregate";

@TypeGraphQL.ObjectType("EmployersOnAccountGroupBy", {
  isAbstract: true
})
export class EmployersOnAccountGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  employerId!: string;

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

  @TypeGraphQL.Field(_type => EmployersOnAccountCountAggregate, {
    nullable: true
  })
  _count!: EmployersOnAccountCountAggregate | null;

  @TypeGraphQL.Field(_type => EmployersOnAccountMinAggregate, {
    nullable: true
  })
  _min!: EmployersOnAccountMinAggregate | null;

  @TypeGraphQL.Field(_type => EmployersOnAccountMaxAggregate, {
    nullable: true
  })
  _max!: EmployersOnAccountMaxAggregate | null;
}
