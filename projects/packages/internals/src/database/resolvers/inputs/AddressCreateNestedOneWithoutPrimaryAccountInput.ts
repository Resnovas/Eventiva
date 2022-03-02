import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutPrimaryAccountInput } from '../inputs/AddressCreateOrConnectWithoutPrimaryAccountInput';
import { AddressCreateWithoutPrimaryAccountInput } from '../inputs/AddressCreateWithoutPrimaryAccountInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateNestedOneWithoutPrimaryAccountInput', {
  isAbstract: true,
})
export class AddressCreateNestedOneWithoutPrimaryAccountInput {
  @TypeGraphQL.Field((_type) => AddressCreateWithoutPrimaryAccountInput, {
    nullable: true,
  })
  create?: AddressCreateWithoutPrimaryAccountInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AddressCreateOrConnectWithoutPrimaryAccountInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | AddressCreateOrConnectWithoutPrimaryAccountInput
    | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;
}
