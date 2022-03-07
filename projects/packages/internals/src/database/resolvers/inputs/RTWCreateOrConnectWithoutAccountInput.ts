import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWCreateWithoutAccountInput } from '../inputs/RTWCreateWithoutAccountInput';
import { RTWWhereUniqueInput } from '../inputs/RTWWhereUniqueInput';

@TypeGraphQL.InputType('RTWCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class RTWCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: false,
  })
  where!: RTWWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RTWCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: RTWCreateWithoutAccountInput;
}
