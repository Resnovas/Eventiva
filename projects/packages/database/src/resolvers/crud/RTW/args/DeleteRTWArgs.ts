import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWWhereUniqueInput } from '../../../inputs/RTWWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class DeleteRTWArgs {
  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: false,
  })
  where!: RTWWhereUniqueInput;
}
