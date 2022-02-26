import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateNestedManyWithoutStatusInput } from '../inputs/StatusOnAccountCreateNestedManyWithoutStatusInput';

@TypeGraphQL.InputType('StatusCreateInput', {
  isAbstract: true,
})
export class StatusCreateInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

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

  @TypeGraphQL.Field(
    (_type) => StatusOnAccountCreateNestedManyWithoutStatusInput,
    {
      nullable: true,
    }
  )
  account?: StatusOnAccountCreateNestedManyWithoutStatusInput | undefined;
}
