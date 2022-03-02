import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyAccountInput } from '../inputs/StatusOnAccountCreateManyAccountInput';

@TypeGraphQL.InputType('StatusOnAccountCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class StatusOnAccountCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateManyAccountInput], {
    nullable: false,
  })
  data!: StatusOnAccountCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
