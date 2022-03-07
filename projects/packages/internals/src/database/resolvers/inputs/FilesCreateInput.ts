import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedManyWithoutFilesInput } from '../inputs/AccountCreateNestedManyWithoutFilesInput';
import { RTWCreateNestedOneWithoutFilesInput } from '../inputs/RTWCreateNestedOneWithoutFilesInput';

@TypeGraphQL.InputType('FilesCreateInput', {
  isAbstract: true,
})
export class FilesCreateInput {
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

  @TypeGraphQL.Field((_type) => AccountCreateNestedManyWithoutFilesInput, {
    nullable: true,
  })
  account?: AccountCreateNestedManyWithoutFilesInput | undefined;
}
