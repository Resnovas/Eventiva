import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWCreateWithoutFilesInput } from '../inputs/RTWCreateWithoutFilesInput';
import { RTWWhereUniqueInput } from '../inputs/RTWWhereUniqueInput';

@TypeGraphQL.InputType('RTWCreateOrConnectWithoutFilesInput', {
  isAbstract: true,
})
export class RTWCreateOrConnectWithoutFilesInput {
  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: false,
  })
  where!: RTWWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RTWCreateWithoutFilesInput, {
    nullable: false,
  })
  create!: RTWCreateWithoutFilesInput;
}
