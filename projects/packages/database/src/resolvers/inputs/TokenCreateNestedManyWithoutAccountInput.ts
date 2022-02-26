import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TokenCreateManyAccountInputEnvelope } from '../inputs/TokenCreateManyAccountInputEnvelope';
import { TokenCreateOrConnectWithoutAccountInput } from '../inputs/TokenCreateOrConnectWithoutAccountInput';
import { TokenCreateWithoutAccountInput } from '../inputs/TokenCreateWithoutAccountInput';
import { TokenWhereUniqueInput } from '../inputs/TokenWhereUniqueInput';

@TypeGraphQL.InputType('TokenCreateNestedManyWithoutAccountInput', {
  isAbstract: true,
})
export class TokenCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [TokenCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: TokenCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TokenCreateOrConnectWithoutAccountInput], {
    nullable: true,
  })
  connectOrCreate?: TokenCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => TokenCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: TokenCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [TokenWhereUniqueInput], {
    nullable: true,
  })
  connect?: TokenWhereUniqueInput[] | undefined;
}
