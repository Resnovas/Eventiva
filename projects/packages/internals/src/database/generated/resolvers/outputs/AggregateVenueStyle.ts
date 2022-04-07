import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCountAggregate } from "../outputs/VenueStyleCountAggregate";
import { VenueStyleMaxAggregate } from "../outputs/VenueStyleMaxAggregate";
import { VenueStyleMinAggregate } from "../outputs/VenueStyleMinAggregate";

@TypeGraphQL.ObjectType("AggregateVenueStyle", {
  isAbstract: true
})
export class AggregateVenueStyle {
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
