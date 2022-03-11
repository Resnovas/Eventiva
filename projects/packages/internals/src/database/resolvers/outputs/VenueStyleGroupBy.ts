import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCountAggregate } from "../outputs/VenueStyleCountAggregate";
import { VenueStyleMaxAggregate } from "../outputs/VenueStyleMaxAggregate";
import { VenueStyleMinAggregate } from "../outputs/VenueStyleMinAggregate";

@TypeGraphQL.ObjectType("VenueStyleGroupBy", {
  isAbstract: true
})
export class VenueStyleGroupBy {
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
  details!: string | null;

  @TypeGraphQL.Field(_type => VenueStyleCountAggregate, {
    nullable: true
  })
  _count!: VenueStyleCountAggregate | null;

  @TypeGraphQL.Field(_type => VenueStyleMinAggregate, {
    nullable: true
  })
  _min!: VenueStyleMinAggregate | null;

  @TypeGraphQL.Field(_type => VenueStyleMaxAggregate, {
    nullable: true
  })
  _max!: VenueStyleMaxAggregate | null;
}
