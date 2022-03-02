import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ApplicationUpdateManyMutationInput } from '../../../inputs/ApplicationUpdateManyMutationInput';
import { ApplicationWhereInput } from '../../../inputs/ApplicationWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyApplicationArgs {
  @TypeGraphQL.Field((_type) => ApplicationUpdateManyMutationInput, {
    nullable: false,
  })
  data!: ApplicationUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => ApplicationWhereInput, {
    nullable: true,
  })
  where?: ApplicationWhereInput | undefined;
}
