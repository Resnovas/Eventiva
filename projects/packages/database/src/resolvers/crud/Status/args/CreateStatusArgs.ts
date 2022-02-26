import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusCreateInput } from '../../../inputs/StatusCreateInput';

@TypeGraphQL.ArgsType()
export class CreateStatusArgs {
  @TypeGraphQL.Field((_type) => StatusCreateInput, {
    nullable: false,
  })
  data!: StatusCreateInput;
}
