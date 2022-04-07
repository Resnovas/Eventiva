import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCreateWithoutAddressInput } from "../inputs/VenueStyleCreateWithoutAddressInput";
import { VenueStyleWhereUniqueInput } from "../inputs/VenueStyleWhereUniqueInput";

@TypeGraphQL.InputType("VenueStyleCreateOrConnectWithoutAddressInput", {
  isAbstract: true
})
export class VenueStyleCreateOrConnectWithoutAddressInput {
  @TypeGraphQL.Field(_type => VenueStyleWhereUniqueInput, {
    nullable: false
  })
  where!: VenueStyleWhereUniqueInput;

  @TypeGraphQL.Field(_type => VenueStyleCreateWithoutAddressInput, {
    nullable: false
  })
  create!: VenueStyleCreateWithoutAddressInput;
}
