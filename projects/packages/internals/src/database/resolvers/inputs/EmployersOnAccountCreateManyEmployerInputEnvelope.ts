import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyEmployerInput } from '../inputs/EmployersOnAccountCreateManyEmployerInput';

@TypeGraphQL.InputType('EmployersOnAccountCreateManyEmployerInputEnvelope', {
  isAbstract: true,
})
export class EmployersOnAccountCreateManyEmployerInputEnvelope {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountCreateManyEmployerInput], {
    nullable: false,
  })
  data!: EmployersOnAccountCreateManyEmployerInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
