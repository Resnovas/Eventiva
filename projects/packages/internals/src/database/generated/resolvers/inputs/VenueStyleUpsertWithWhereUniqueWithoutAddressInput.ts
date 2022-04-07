import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCreateWithoutAddressInput } from "../inputs/VenueStyleCreateWithoutAddressInput";
import { VenueStyleUpdateWithoutAddressInput } from "../inputs/VenueStyleUpdateWithoutAddressInput";
import { VenueStyleWhereUniqueInput } from "../inputs/VenueStyleWhereUniqueInput";

@TypeGraphQL.InputType("VenueStyleUpsertWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class VenueStyleUpsertWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => VenueStyleWhereUniqueInput, {
    nullable: false
  })
  where!: VenueStyleWhereUniqueInput;

  @TypeGraphQL.Field(_type => VenueStyleUpdateWithoutAddressInput, {
    nullable: false
  })
  update!: VenueStyleUpdateWithoutAddressInput;

  @TypeGraphQL.Field(_type => VenueStyleCreateWithoutAddressInput, {
    nullable: false
  })
  create!: VenueStyleCreateWithoutAddressInput;
}
