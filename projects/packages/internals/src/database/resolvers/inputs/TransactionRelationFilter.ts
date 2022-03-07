import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionWhereInput } from '../inputs/TransactionWhereInput';

@TypeGraphQL.InputType('TransactionRelationFilter', {
  isAbstract: true,
})
export class TransactionRelationFilter {
  @TypeGraphQL.Field((_type) => TransactionWhereInput, {
    nullable: true,
  })
  is?: TransactionWhereInput | undefined;

  @TypeGraphQL.Field((_type) => TransactionWhereInput, {
    nullable: true,
  })
  isNot?: TransactionWhereInput | undefined;
}
