import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusWhereInput } from '../../../inputs/StatusWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyStatusArgs {
  @TypeGraphQL.Field((_type) => StatusWhereInput, {
    nullable: true,
  })
  where?: StatusWhereInput | undefined;
}
