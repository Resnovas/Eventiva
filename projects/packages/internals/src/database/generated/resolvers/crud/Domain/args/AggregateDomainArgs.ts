import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DomainOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/DomainOrderByWithRelationAndSearchRelevanceInput";
import { DomainWhereInput } from "../../../inputs/DomainWhereInput";
import { DomainWhereUniqueInput } from "../../../inputs/DomainWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateDomainArgs {
  @TypeGraphQL.Field(_type => DomainWhereInput, {
    nullable: true
  })
  where?: DomainWhereInput | undefined;

  @TypeGraphQL.Field(_type => [DomainOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: DomainOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => DomainWhereUniqueInput, {
    nullable: true
  })
  cursor?: DomainWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
