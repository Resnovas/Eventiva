import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ContactAtAddressOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/ContactAtAddressOrderByWithRelationAndSearchRelevanceInput';
import { ContactAtAddressWhereInput } from '../../../inputs/ContactAtAddressWhereInput';
import { ContactAtAddressWhereUniqueInput } from '../../../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateContactAtAddressArgs {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereInput, {
    nullable: true,
  })
  where?: ContactAtAddressWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?:
    | ContactAtAddressOrderByWithRelationAndSearchRelevanceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: true,
  })
  cursor?: ContactAtAddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
