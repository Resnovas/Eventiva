import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmailOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/EmailOrderByWithRelationAndSearchRelevanceInput";
import { EmailWhereInput } from "../../../inputs/EmailWhereInput";
import { EmailWhereUniqueInput } from "../../../inputs/EmailWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateEmailArgs {
  @TypeGraphQL.Field(_type => EmailWhereInput, {
    nullable: true
  })
  where?: EmailWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EmailOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: EmailOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: true
  })
  cursor?: EmailWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
