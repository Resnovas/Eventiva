import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { dnsType } from '../../enums/dnsType';

@TypeGraphQL.InputType('EnumdnsTypeFieldUpdateOperationsInput', {
  isAbstract: true,
})
export class EnumdnsTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field((_type) => dnsType, {
    nullable: true,
  })
  set?: 'TXT' | 'CNAME' | undefined;
}
