import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWScalarWhereInput } from '../inputs/RTWScalarWhereInput';
import { RTWUpdateManyMutationInput } from '../inputs/RTWUpdateManyMutationInput';

@TypeGraphQL.InputType('RTWUpdateManyWithWhereWithoutAccountInput', {
  isAbstract: true,
})
export class RTWUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field((_type) => RTWScalarWhereInput, {
    nullable: false,
  })
  where!: RTWScalarWhereInput;

  @TypeGraphQL.Field((_type) => RTWUpdateManyMutationInput, {
    nullable: false,
  })
  data!: RTWUpdateManyMutationInput;
}
