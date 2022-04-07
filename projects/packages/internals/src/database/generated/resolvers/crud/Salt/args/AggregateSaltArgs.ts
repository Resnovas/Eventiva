import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/SaltOrderByWithRelationAndSearchRelevanceInput";
import { SaltWhereInput } from "../../../inputs/SaltWhereInput";
import { SaltWhereUniqueInput } from "../../../inputs/SaltWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateSaltArgs {
  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  where?: SaltWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SaltOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: SaltOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: true
  })
  cursor?: SaltWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
