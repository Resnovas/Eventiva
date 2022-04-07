import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DomainCountAggregate } from "../outputs/DomainCountAggregate";
import { DomainMaxAggregate } from "../outputs/DomainMaxAggregate";
import { DomainMinAggregate } from "../outputs/DomainMinAggregate";
import { dnsType } from "../../enums/dnsType";

@TypeGraphQL.ObjectType("DomainGroupBy", {
  isAbstract: true
})
export class DomainGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  domain!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  verified!: boolean;

  @TypeGraphQL.Field(_type => dnsType, {
    nullable: false
  })
  dnsType!: "TXT" | "CNAME";

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  data!: Prisma.JsonValue;

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

  @TypeGraphQL.Field(_type => DomainCountAggregate, {
    nullable: true
  })
  _count!: DomainCountAggregate | null;

  @TypeGraphQL.Field(_type => DomainMinAggregate, {
    nullable: true
  })
  _min!: DomainMinAggregate | null;

  @TypeGraphQL.Field(_type => DomainMaxAggregate, {
    nullable: true
  })
  _max!: DomainMaxAggregate | null;
}
