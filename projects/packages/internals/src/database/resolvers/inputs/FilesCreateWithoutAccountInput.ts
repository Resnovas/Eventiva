import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWCreateNestedOneWithoutFilesInput } from '../inputs/RTWCreateNestedOneWithoutFilesInput';

@TypeGraphQL.InputType('FilesCreateWithoutAccountInput', {
  isAbstract: true,
})
export class FilesCreateWithoutAccountInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field((_type) => RTWCreateNestedOneWithoutFilesInput, {
    nullable: true,
  })
  rtw?: RTWCreateNestedOneWithoutFilesInput | undefined;
}
