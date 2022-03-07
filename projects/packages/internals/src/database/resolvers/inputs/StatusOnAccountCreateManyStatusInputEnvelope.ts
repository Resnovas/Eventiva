import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyStatusInput } from '../inputs/StatusOnAccountCreateManyStatusInput';

@TypeGraphQL.InputType('StatusOnAccountCreateManyStatusInputEnvelope', {
  isAbstract: true,
})
export class StatusOnAccountCreateManyStatusInputEnvelope {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateManyStatusInput], {
    nullable: false,
  })
  data!: StatusOnAccountCreateManyStatusInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
