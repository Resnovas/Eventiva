import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCountAggregate } from "../outputs/PhoneCountAggregate";
import { PhoneMaxAggregate } from "../outputs/PhoneMaxAggregate";
import { PhoneMinAggregate } from "../outputs/PhoneMinAggregate";

@TypeGraphQL.ObjectType("PhoneGroupBy", {
  isAbstract: true
})
export class PhoneGroupBy {
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

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  phone!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  public!: boolean;

  @TypeGraphQL.Field(_type => PhoneCountAggregate, {
    nullable: true
  })
  _count!: PhoneCountAggregate | null;

  @TypeGraphQL.Field(_type => PhoneMinAggregate, {
    nullable: true
  })
  _min!: PhoneMinAggregate | null;

  @TypeGraphQL.Field(_type => PhoneMaxAggregate, {
    nullable: true
  })
  _max!: PhoneMaxAggregate | null;
}
