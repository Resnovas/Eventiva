import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateWithoutVenueStyleInput } from "../inputs/AddressCreateWithoutVenueStyleInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressCreateOrConnectWithoutVenueStyleInput", {
  isAbstract: true
})
export class AddressCreateOrConnectWithoutVenueStyleInput {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => AddressCreateWithoutVenueStyleInput, {
    nullable: false
  })
  create!: AddressCreateWithoutVenueStyleInput;
}
