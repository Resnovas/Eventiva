import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCountAggregate } from "../outputs/SubuserOnAccountCountAggregate";
import { SubuserOnAccountMaxAggregate } from "../outputs/SubuserOnAccountMaxAggregate";
import { SubuserOnAccountMinAggregate } from "../outputs/SubuserOnAccountMinAggregate";

@TypeGraphQL.ObjectType("SubuserOnAccountGroupBy", {
  isAbstract: true
})
export class SubuserOnAccountGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  subuserId!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => SubuserOnAccountCountAggregate, {
    nullable: true
  })
  _count!: SubuserOnAccountCountAggregate | null;

  @TypeGraphQL.Field(_type => SubuserOnAccountMinAggregate, {
    nullable: true
  })
  _min!: SubuserOnAccountMinAggregate | null;

  @TypeGraphQL.Field(_type => SubuserOnAccountMaxAggregate, {
    nullable: true
  })
  _max!: SubuserOnAccountMaxAggregate | null;
}
