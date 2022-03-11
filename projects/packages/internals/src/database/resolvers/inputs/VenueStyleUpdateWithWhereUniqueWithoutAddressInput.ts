import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleUpdateWithoutAddressInput } from "../inputs/VenueStyleUpdateWithoutAddressInput";
import { VenueStyleWhereUniqueInput } from "../inputs/VenueStyleWhereUniqueInput";

@TypeGraphQL.InputType("VenueStyleUpdateWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class VenueStyleUpdateWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => VenueStyleWhereUniqueInput, {
    nullable: false
  })
  where!: VenueStyleWhereUniqueInput;

  @TypeGraphQL.Field(_type => VenueStyleUpdateWithoutAddressInput, {
    nullable: false
  })
  data!: VenueStyleUpdateWithoutAddressInput;
}
