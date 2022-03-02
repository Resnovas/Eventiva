import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateManyAccountInputEnvelope } from '../inputs/AddressCreateManyAccountInputEnvelope';
import { AddressCreateOrConnectWithoutAccountInput } from '../inputs/AddressCreateOrConnectWithoutAccountInput';
import { AddressCreateWithoutAccountInput } from '../inputs/AddressCreateWithoutAccountInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateNestedManyWithoutAccountInput', {
  isAbstract: true,
})
export class AddressCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [AddressCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: AddressCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressCreateOrConnectWithoutAccountInput], {
    nullable: true,
  })
  connectOrCreate?: AddressCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => AddressCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: AddressCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [AddressWhereUniqueInput], {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput[] | undefined;
}
