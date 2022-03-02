import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('ManagersOnAccountCreateManyAccountInput', {
  isAbstract: true,
})
export class ManagersOnAccountCreateManyAccountInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  managersId!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;
}
