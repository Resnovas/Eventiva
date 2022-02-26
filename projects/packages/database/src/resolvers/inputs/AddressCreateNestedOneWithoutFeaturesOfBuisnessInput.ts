import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutFeaturesOfBuisnessInput } from '../inputs/AddressCreateOrConnectWithoutFeaturesOfBuisnessInput';
import { AddressCreateWithoutFeaturesOfBuisnessInput } from '../inputs/AddressCreateWithoutFeaturesOfBuisnessInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateNestedOneWithoutFeaturesOfBuisnessInput', {
  isAbstract: true,
})
export class AddressCreateNestedOneWithoutFeaturesOfBuisnessInput {
  @TypeGraphQL.Field((_type) => AddressCreateWithoutFeaturesOfBuisnessInput, {
    nullable: true,
  })
  create?: AddressCreateWithoutFeaturesOfBuisnessInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AddressCreateOrConnectWithoutFeaturesOfBuisnessInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | AddressCreateOrConnectWithoutFeaturesOfBuisnessInput
    | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;
}
