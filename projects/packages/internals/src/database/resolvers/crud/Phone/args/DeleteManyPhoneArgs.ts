import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PhoneWhereInput } from '../../../inputs/PhoneWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyPhoneArgs {
  @TypeGraphQL.Field((_type) => PhoneWhereInput, {
    nullable: true,
  })
  where?: PhoneWhereInput | undefined;
}
