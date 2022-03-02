import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateManyAddressInputEnvelope } from '../inputs/ContactAtAddressCreateManyAddressInputEnvelope';
import { ContactAtAddressCreateOrConnectWithoutAddressInput } from '../inputs/ContactAtAddressCreateOrConnectWithoutAddressInput';
import { ContactAtAddressCreateWithoutAddressInput } from '../inputs/ContactAtAddressCreateWithoutAddressInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType('ContactAtAddressCreateNestedManyWithoutAddressInput', {
  isAbstract: true,
})
export class ContactAtAddressCreateNestedManyWithoutAddressInput {
  @TypeGraphQL.Field((_type) => [ContactAtAddressCreateWithoutAddressInput], {
    nullable: true,
  })
  create?: ContactAtAddressCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressCreateOrConnectWithoutAddressInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ContactAtAddressCreateOrConnectWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ContactAtAddressCreateManyAddressInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ContactAtAddressCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressWhereUniqueInput], {
    nullable: true,
  })
  connect?: ContactAtAddressWhereUniqueInput[] | undefined;
}
