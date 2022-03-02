import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutAccessesInput } from '../inputs/AccountCreateOrConnectWithoutAccessesInput';
import { AccountCreateWithoutAccessesInput } from '../inputs/AccountCreateWithoutAccessesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountCreateNestedOneWithoutAccessesInput', {
  isAbstract: true,
})
export class AccountCreateNestedOneWithoutAccessesInput {
  @TypeGraphQL.Field((_type) => AccountCreateWithoutAccessesInput, {
    nullable: true,
  })
  create?: AccountCreateWithoutAccessesInput | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateOrConnectWithoutAccessesInput, {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAccessesInput | undefined;

  @TypeGraphQL.Field((_type) => AccountWhereUniqueInput, {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput | undefined;
}
