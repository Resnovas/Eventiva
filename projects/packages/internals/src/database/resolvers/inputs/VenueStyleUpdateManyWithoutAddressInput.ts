import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCreateOrConnectWithoutAddressInput } from "../inputs/VenueStyleCreateOrConnectWithoutAddressInput";
import { VenueStyleCreateWithoutAddressInput } from "../inputs/VenueStyleCreateWithoutAddressInput";
import { VenueStyleScalarWhereInput } from "../inputs/VenueStyleScalarWhereInput";
import { VenueStyleUpdateManyWithWhereWithoutAddressInput } from "../inputs/VenueStyleUpdateManyWithWhereWithoutAddressInput";
import { VenueStyleUpdateWithWhereUniqueWithoutAddressInput } from "../inputs/VenueStyleUpdateWithWhereUniqueWithoutAddressInput";
import { VenueStyleUpsertWithWhereUniqueWithoutAddressInput } from "../inputs/VenueStyleUpsertWithWhereUniqueWithoutAddressInput";
import { VenueStyleWhereUniqueInput } from "../inputs/VenueStyleWhereUniqueInput";

@TypeGraphQL.InputType("VenueStyleUpdateManyWithoutAddressInput", {
  isAbstract: true
})
export class VenueStyleUpdateManyWithoutAddressInput {
  @TypeGraphQL.Field(_type => [VenueStyleCreateWithoutAddressInput], {
    nullable: true
  })
  create?: VenueStyleCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleCreateOrConnectWithoutAddressInput], {
    nullable: true
  })
  connectOrCreate?: VenueStyleCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleUpsertWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  upsert?: VenueStyleUpsertWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleWhereUniqueInput], {
    nullable: true
  })
  set?: VenueStyleWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleWhereUniqueInput], {
    nullable: true
  })
  disconnect?: VenueStyleWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleWhereUniqueInput], {
    nullable: true
  })
  delete?: VenueStyleWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleWhereUniqueInput], {
    nullable: true
  })
  connect?: VenueStyleWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleUpdateWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  update?: VenueStyleUpdateWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleUpdateManyWithWhereWithoutAddressInput], {
    nullable: true
  })
  updateMany?: VenueStyleUpdateManyWithWhereWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereInput], {
    nullable: true
  })
  deleteMany?: VenueStyleScalarWhereInput[] | undefined;
}
