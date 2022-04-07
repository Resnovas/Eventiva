import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput";
import { ArrangementOfRoomWhereInput } from "../../../inputs/ArrangementOfRoomWhereInput";
import { ArrangementOfRoomWhereUniqueInput } from "../../../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  where?: ArrangementOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: true
  })
  cursor?: ArrangementOfRoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
