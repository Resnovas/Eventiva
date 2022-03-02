import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyAccountInput } from '../inputs/EmployersOnAccountCreateManyAccountInput';

@TypeGraphQL.InputType('EmployersOnAccountCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class EmployersOnAccountCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountCreateManyAccountInput], {
    nullable: false,
  })
  data!: EmployersOnAccountCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
