import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutPrimaryAccountInput } from '../inputs/AddressCreateOrConnectWithoutPrimaryAccountInput';
import { AddressCreateWithoutPrimaryAccountInput } from '../inputs/AddressCreateWithoutPrimaryAccountInput';
import { AddressUpdateWithoutPrimaryAccountInput } from '../inputs/AddressUpdateWithoutPrimaryAccountInput';
import { AddressUpsertWithoutPrimaryAccountInput } from '../inputs/AddressUpsertWithoutPrimaryAccountInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressUpdateOneWithoutPrimaryAccountInput', {
  isAbstract: true,
})
export class AddressUpdateOneWithoutPrimaryAccountInput {
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

  @TypeGraphQL.Field((_type) => AddressUpsertWithoutPrimaryAccountInput, {
    nullable: true,
  })
  upsert?: AddressUpsertWithoutPrimaryAccountInput | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => AddressUpdateWithoutPrimaryAccountInput, {
    nullable: true,
  })
  update?: AddressUpdateWithoutPrimaryAccountInput | undefined;
}
