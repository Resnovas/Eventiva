import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FilesUpdateWithoutAccountInput } from '../inputs/FilesUpdateWithoutAccountInput';
import { FilesWhereUniqueInput } from '../inputs/FilesWhereUniqueInput';

@TypeGraphQL.InputType('FilesUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class FilesUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => FilesWhereUniqueInput, {
    nullable: false,
  })
  where!: FilesWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FilesUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: FilesUpdateWithoutAccountInput;
}
