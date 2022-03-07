import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOnAccountWhereInput } from '../../../inputs/StatusOnAccountWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyStatusOnAccountArgs {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereInput, {
    nullable: true,
  })
  where?: StatusOnAccountWhereInput | undefined;
}
