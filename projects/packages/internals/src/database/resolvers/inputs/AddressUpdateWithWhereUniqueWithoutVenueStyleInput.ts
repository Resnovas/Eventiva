import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressUpdateWithoutVenueStyleInput } from "../inputs/AddressUpdateWithoutVenueStyleInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressUpdateWithWhereUniqueWithoutVenueStyleInput", {
  isAbstract: true
})
export class AddressUpdateWithWhereUniqueWithoutVenueStyleInput {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => AddressUpdateWithoutVenueStyleInput, {
    nullable: false
  })
  data!: AddressUpdateWithoutVenueStyleInput;
}
