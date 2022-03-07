import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutAccountInput } from '../inputs/AddressCreateWithoutAccountInput';
import { AddressUpdateWithoutAccountInput } from '../inputs/AddressUpdateWithoutAccountInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressUpsertWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class AddressUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutAccountInput;
}
