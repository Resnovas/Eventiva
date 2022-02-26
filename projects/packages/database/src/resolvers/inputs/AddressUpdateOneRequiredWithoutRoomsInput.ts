import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutRoomsInput } from '../inputs/AddressCreateOrConnectWithoutRoomsInput';
import { AddressCreateWithoutRoomsInput } from '../inputs/AddressCreateWithoutRoomsInput';
import { AddressUpdateWithoutRoomsInput } from '../inputs/AddressUpdateWithoutRoomsInput';
import { AddressUpsertWithoutRoomsInput } from '../inputs/AddressUpsertWithoutRoomsInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressUpdateOneRequiredWithoutRoomsInput', {
  isAbstract: true,
})
export class AddressUpdateOneRequiredWithoutRoomsInput {
  @TypeGraphQL.Field((_type) => AddressCreateWithoutRoomsInput, {
    nullable: true,
  })
  create?: AddressCreateWithoutRoomsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressCreateOrConnectWithoutRoomsInput, {
    nullable: true,
  })
  connectOrCreate?: AddressCreateOrConnectWithoutRoomsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressUpsertWithoutRoomsInput, {
    nullable: true,
  })
  upsert?: AddressUpsertWithoutRoomsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => AddressUpdateWithoutRoomsInput, {
    nullable: true,
  })
  update?: AddressUpdateWithoutRoomsInput | undefined;
}
