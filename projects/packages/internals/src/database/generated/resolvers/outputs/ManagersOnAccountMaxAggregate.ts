import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("ManagersOnAccountMaxAggregate", {
  isAbstract: true
})
export class ManagersOnAccountMaxAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountId!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  managersId!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;
}
