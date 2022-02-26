import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIABadgeOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/SIABadgeOrderByWithRelationAndSearchRelevanceInput';
import { SIABadgeWhereInput } from '../../../inputs/SIABadgeWhereInput';
import { SIABadgeWhereUniqueInput } from '../../../inputs/SIABadgeWhereUniqueInput';
import { SIABadgeScalarFieldEnum } from '../../../../enums/SIABadgeScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindFirstSIABadgeArgs {
  @TypeGraphQL.Field((_type) => SIABadgeWhereInput, {
    nullable: true,
  })
  where?: SIABadgeWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIABadgeOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: SIABadgeOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeWhereUniqueInput, {
    nullable: true,
  })
  cursor?: SIABadgeWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [SIABadgeScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<
        | 'id'
        | 'licenseSector'
        | 'type'
        | 'licenseExplanation'
        | 'additionalTerms'
        | 'createdAt'
        | 'active'
        | 'expiry'
        | 'updatedAt'
        | 'deleted'
        | 'account_id'
      >
    | undefined;
}
