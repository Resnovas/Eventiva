import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIACheckWhereInput } from '../../../inputs/SIACheckWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManySIACheckArgs {
  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  where?: SIACheckWhereInput | undefined;
}
