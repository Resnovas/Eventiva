import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { Title } from '../../enums/Title';

@TypeGraphQL.InputType('NullableEnumTitleFieldUpdateOperationsInput', {
  isAbstract: true,
})
export class NullableEnumTitleFieldUpdateOperationsInput {
  @TypeGraphQL.Field((_type) => Title, {
    nullable: true,
  })
  set?: 'Miss' | 'Ms' | 'Mrs' | 'Mr' | 'Dr' | undefined;
}
