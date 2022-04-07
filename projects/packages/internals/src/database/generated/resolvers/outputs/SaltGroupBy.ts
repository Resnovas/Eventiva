import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltCountAggregate } from "../outputs/SaltCountAggregate";
import { SaltMaxAggregate } from "../outputs/SaltMaxAggregate";
import { SaltMinAggregate } from "../outputs/SaltMinAggregate";

@TypeGraphQL.ObjectType("SaltGroupBy", {
  isAbstract: true
})
export class SaltGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  salt!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  expiry!: Date;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountID!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

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
