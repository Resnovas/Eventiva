import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateOrConnectWithoutVenueStyleInput } from "../inputs/AddressCreateOrConnectWithoutVenueStyleInput";
import { AddressCreateWithoutVenueStyleInput } from "../inputs/AddressCreateWithoutVenueStyleInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressCreateNestedManyWithoutVenueStyleInput", {
  isAbstract: true
})
export class AddressCreateNestedManyWithoutVenueStyleInput {
  @TypeGraphQL.Field(_type => [AddressCreateWithoutVenueStyleInput], {
    nullable: true
  })
  create?: AddressCreateWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressCreateOrConnectWithoutVenueStyleInput], {
    nullable: true
  })
  connectOrCreate?: AddressCreateOrConnectWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereUniqueInput], {
    nullable: true
  })
  connect?: AddressWhereUniqueInput[] | undefined;
}
