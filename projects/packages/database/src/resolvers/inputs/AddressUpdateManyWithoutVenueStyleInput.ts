import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutVenueStyleInput } from '../inputs/AddressCreateOrConnectWithoutVenueStyleInput';
import { AddressCreateWithoutVenueStyleInput } from '../inputs/AddressCreateWithoutVenueStyleInput';
import { AddressScalarWhereInput } from '../inputs/AddressScalarWhereInput';
import { AddressUpdateManyWithWhereWithoutVenueStyleInput } from '../inputs/AddressUpdateManyWithWhereWithoutVenueStyleInput';
import { AddressUpdateWithWhereUniqueWithoutVenueStyleInput } from '../inputs/AddressUpdateWithWhereUniqueWithoutVenueStyleInput';
import { AddressUpsertWithWhereUniqueWithoutVenueStyleInput } from '../inputs/AddressUpsertWithWhereUniqueWithoutVenueStyleInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressUpdateManyWithoutVenueStyleInput', {
  isAbstract: true,
})
export class AddressUpdateManyWithoutVenueStyleInput {
  @TypeGraphQL.Field((_type) => [AddressCreateWithoutVenueStyleInput], {
    nullable: true,
  })
  create?: AddressCreateWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AddressCreateOrConnectWithoutVenueStyleInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?: AddressCreateOrConnectWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AddressUpsertWithWhereUniqueWithoutVenueStyleInput],
    {
      nullable: true,
    }
  )
  upsert?: AddressUpsertWithWhereUniqueWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressWhereUniqueInput], {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressWhereUniqueInput], {
    nullable: true,
  })
  set?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressWhereUniqueInput], {
    nullable: true,
  })
  delete?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AddressUpdateWithWhereUniqueWithoutVenueStyleInput],
    {
      nullable: true,
    }
  )
  update?: AddressUpdateWithWhereUniqueWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AddressUpdateManyWithWhereWithoutVenueStyleInput],
    {
      nullable: true,
    }
  )
  updateMany?: AddressUpdateManyWithWhereWithoutVenueStyleInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: AddressScalarWhereInput[] | undefined;
}
