import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutRoomsInput } from '../inputs/AddressCreateOrConnectWithoutRoomsInput';
import { AddressCreateWithoutRoomsInput } from '../inputs/AddressCreateWithoutRoomsInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateNestedOneWithoutRoomsInput', {
  isAbstract: true,
})
export class AddressCreateNestedOneWithoutRoomsInput {
  @TypeGraphQL.Field((_type) => AddressCreateWithoutRoomsInput, {
    nullable: true,
  })
  create?: AddressCreateWithoutRoomsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressCreateOrConnectWithoutRoomsInput, {
    nullable: true,
  })
  connectOrCreate?: AddressCreateOrConnectWithoutRoomsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;
}
