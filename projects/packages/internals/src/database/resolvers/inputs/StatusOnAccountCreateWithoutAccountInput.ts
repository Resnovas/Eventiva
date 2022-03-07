import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCreateNestedOneWithoutAccountInput } from '../inputs/StatusCreateNestedOneWithoutAccountInput';

@TypeGraphQL.InputType('StatusOnAccountCreateWithoutAccountInput', {
  isAbstract: true,
})
export class StatusOnAccountCreateWithoutAccountInput {
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

  @TypeGraphQL.Field((_type) => StatusCreateNestedOneWithoutAccountInput, {
    nullable: false,
  })
  status!: StatusCreateNestedOneWithoutAccountInput;
}
